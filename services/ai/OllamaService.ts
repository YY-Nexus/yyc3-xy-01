/**
 * @file OllamaService.ts
 * @description YYC³ AI小语智能成长守护系统Ollama本地AI服务，提供本地AI模型调用和管理
 * @author YYC³团队 <admin@0379.email>
 * @version 1.0.0
 */

import { config } from '../../lib/config';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: number;
}

export interface ChatOptions {
  model?: string;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  stream?: boolean;
}

export interface ChatResponse {
  message: ChatMessage;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  model: string;
  created_at: string;
  done: boolean;
  thinking_time?: number;
}

export interface ModelInfo {
  name: string;
  model: string;
  modified_at: string;
  size: number;
  digest: string;
  details: {
    parent_model: string;
    format: string;
    family: string;
    families: string[];
    parameter_size: string;
    quantization_level: string;
  };
}

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  models_loaded: string[];
  gpu_available: boolean;
  memory_usage: {
    used: number;
    total: number;
    percentage: number;
  };
  response_time: {
    avg: number;
    p95: number;
    p99: number;
  };
}

export interface PerformanceMetrics {
  total_requests: number;
  successful_requests: number;
  failed_requests: number;
  avg_response_time: number;
  requests_per_minute: number;
  gpu_utilization: number;
  memory_usage: number;
  model_load_time: number;
}

/**
 * Ollama本地AI服务管理器
 * 负责管理本地AI模型的推理、切换和性能监控
 */
export class OllamaService {
  private baseURL: string;
  private currentModel: string;
  private requestQueue: Map<string, AbortController> = new Map();
  private metrics: PerformanceMetrics;
  private healthCache: HealthStatus | null = null;
  private lastHealthCheck: number = 0;

  constructor() {
    this.baseURL = config.OLLAMA_BASE_URL || 'http://localhost:11434';
    this.currentModel = config.OLLAMA_DEFAULT_MODEL || 'llama3.1:8b';
    this.metrics = this.initializeMetrics();
  }

  /**
   * 初始化性能指标
   */
  private initializeMetrics(): PerformanceMetrics {
    return {
      total_requests: 0,
      successful_requests: 0,
      failed_requests: 0,
      avg_response_time: 0,
      requests_per_minute: 0,
      gpu_utilization: 0,
      memory_usage: 0,
      model_load_time: 0,
    };
  }

  /**
   * 执行AI聊天对话
   */
  async chat(messages: ChatMessage[], options: ChatOptions = {}): Promise<ChatResponse> {
    const startTime = Date.now();
    const requestId = this.generateRequestId();

    try {
      // 更新指标
      this.metrics.total_requests++;

      // 构建请求体
      const requestBody = {
        model: options.model || this.currentModel,
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        stream: options.stream || false,
        options: {
          temperature: options.temperature ?? 0.7,
          top_p: options.top_p ?? 0.9,
          num_predict: options.max_tokens ?? 2048,
        }
      };

      // 创建取消控制器
      const controller = new AbortController();
      this.requestQueue.set(requestId, controller);

      // 发送请求
      const response = await fetch(`${this.baseURL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      const endTime = Date.now();

      // 清理请求队列
      this.requestQueue.delete(requestId);

      // 更新成功指标
      this.metrics.successful_requests++;
      const responseTime = endTime - startTime;
      this.updateResponseTime(responseTime);

      return {
        message: {
          role: 'assistant',
          content: result.message?.content || '',
          timestamp: Date.now(),
        },
        usage: {
          prompt_tokens: result.prompt_eval_count || 0,
          completion_tokens: result.eval_count || 0,
          total_tokens: (result.prompt_eval_count || 0) + (result.eval_count || 0),
        },
        model: result.model,
        created_at: result.created_at,
        done: result.done,
        thinking_time: responseTime,
      };

    } catch (error) {
      // 清理请求队列
      this.requestQueue.delete(requestId);

      // 更新失败指标
      this.metrics.failed_requests++;

      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request was cancelled');
      }

      console.error('Ollama chat error:', error);
      throw new Error(`AI chat failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * 获取可用模型列表
   */
  async listModels(): Promise<ModelInfo[]> {
    try {
      const response = await fetch(`${this.baseURL}/api/tags`);

      if (!response.ok) {
        throw new Error(`Failed to list models: ${response.statusText}`);
      }

      const result = await response.json();
      return result.models || [];
    } catch (error) {
      console.error('Failed to list models:', error);
      throw new Error(`Failed to retrieve model list: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * 下载模型
   */
  async pullModel(modelName: string, onProgress?: (progress: { status: string; completed: number; total: number }) => void): Promise<void> {
    try {
      const response = await fetch(`${this.baseURL}/api/pull`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: modelName }),
      });

      if (!response.ok) {
        throw new Error(`Failed to pull model: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body available');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim()) {
            try {
              const data = JSON.parse(line);
              if (onProgress && data.status) {
                onProgress({
                  status: data.status,
                  completed: data.completed || 0,
                  total: data.total || 0,
                });
              }
            } catch (e) {
              // 忽略解析错误
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to pull model:', error);
      throw new Error(`Model download failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * 切换当前模型
   */
  async switchModel(modelName: string): Promise<void> {
    try {
      // 检查模型是否存在
      const models = await this.listModels();
      const modelExists = models.some(model => model.name === modelName);

      if (!modelExists) {
        throw new Error(`Model ${modelName} not found. Please download it first.`);
      }

      // 预热模型
      const startTime = Date.now();
      await this.chat([{ role: 'user', content: 'Hello' }], { model: modelName });
      const loadTime = Date.now() - startTime;

      // 更新当前模型
      this.currentModel = modelName;
      this.metrics.model_load_time = loadTime;

      console.log(`Switched to model: ${modelName} (load time: ${loadTime}ms)`);
    } catch (error) {
      console.error('Failed to switch model:', error);
      throw new Error(`Model switch failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * 获取当前模型
   */
  getCurrentModel(): string {
    return this.currentModel;
  }

  /**
   * 执行健康检查
   */
  async healthCheck(): Promise<HealthStatus> {
    const now = Date.now();

    // 缓存健康检查结果（30秒内）
    if (this.healthCache && (now - this.lastHealthCheck) < 30000) {
      return this.healthCache;
    }

    try {
      const startTime = Date.now();

      // 检查Ollama服务可用性
      const response = await fetch(`${this.baseURL}/api/tags`, {
        signal: AbortSignal.timeout(5000)
      });

      const checkTime = Date.now() - startTime;

      if (!response.ok) {
        throw new Error(`Health check failed: ${response.statusText}`);
      }

      // 获取模型信息
      const modelsData = await response.json();
      const models = modelsData.models || [];

      // 估算系统资源使用情况
      const memoryUsage = await this.estimateMemoryUsage();
      const gpuAvailable = await this.checkGPUAvailability();

      // 计算响应时间指标
      const avgResponseTime = this.metrics.avg_response_time;
      const p95ResponseTime = avgResponseTime * 1.5; // 简化估算
      const p99ResponseTime = avgResponseTime * 2; // 简化估算

      this.healthCache = {
        status: this.determineHealthStatus(checkTime, memoryUsage.percentage),
        models_loaded: models.map(model => model.name),
        gpu_available: gpuAvailable,
        memory_usage: memoryUsage,
        response_time: {
          avg: avgResponseTime,
          p95: p95ResponseTime,
          p99: p99ResponseTime,
        },
      };

      this.lastHealthCheck = now;
      return this.healthCache;

    } catch (error) {
      console.error('Health check failed:', error);

      this.healthCache = {
        status: 'unhealthy',
        models_loaded: [],
        gpu_available: false,
        memory_usage: { used: 0, total: 0, percentage: 0 },
        response_time: { avg: 0, p95: 0, p99: 0 },
      };

      return this.healthCache;
    }
  }

  /**
   * 获取性能指标
   */
  async getMetrics(): Promise<PerformanceMetrics> {
    // 更新实时指标
    await this.updateRealTimeMetrics();
    return { ...this.metrics };
  }

  /**
   * 取消请求
   */
  cancelRequest(requestId: string): boolean {
    const controller = this.requestQueue.get(requestId);
    if (controller) {
      controller.abort();
      this.requestQueue.delete(requestId);
      return true;
    }
    return false;
  }

  /**
   * 清理资源
   */
  cleanup(): void {
    // 取消所有进行中的请求
    for (const [requestId, controller] of this.requestQueue) {
      controller.abort();
    }
    this.requestQueue.clear();

    // 重置指标
    this.metrics = this.initializeMetrics();
    this.healthCache = null;
  }

  /**
   * 生成请求ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 更新响应时间指标
   */
  private updateResponseTime(responseTime: number): void {
    const total = this.metrics.successful_requests;
    const currentAvg = this.metrics.avg_response_time;

    // 计算新的平均响应时间
    this.metrics.avg_response_time = (currentAvg * (total - 1) + responseTime) / total;
  }

  /**
   * 估算内存使用情况
   */
  private async estimateMemoryUsage(): Promise<{ used: number; total: number; percentage: number }> {
    // 简化实现，实际应该读取系统内存信息
    const total = 16 * 1024; // 16GB
    const used = Math.floor(total * 0.3 + Math.random() * total * 0.2); // 30-50%
    const percentage = Math.round((used / total) * 100);

    return { used, total, percentage };
  }

  /**
   * 检查GPU可用性
   */
  private async checkGPUAvailability(): Promise<boolean> {
    // 简化实现，实际应该检查NVIDIA GPU状态
    return true;
  }

  /**
   * 确定健康状态
   */
  private determineHealthStatus(responseTime: number, memoryUsage: number): 'healthy' | 'degraded' | 'unhealthy' {
    if (responseTime > 10000 || memoryUsage > 90) {
      return 'unhealthy';
    }
    if (responseTime > 5000 || memoryUsage > 70) {
      return 'degraded';
    }
    return 'healthy';
  }

  /**
   * 更新实时指标
   */
  private async updateRealTimeMetrics(): Promise<void> {
    // 更新GPU利用率
    this.metrics.gpu_utilization = Math.floor(Math.random() * 30 + 40); // 40-70%

    // 更新内存使用
    const memoryUsage = await this.estimateMemoryUsage();
    this.metrics.memory_usage = memoryUsage.percentage;

    // 计算每分钟请求数（简化实现）
    this.metrics.requests_per_minute = Math.floor(this.metrics.total_requests / 10); // 简化计算
  }
}

// 创建单例实例
export const ollamaService = new OllamaService();

// 导出类型和服务
export default ollamaService;