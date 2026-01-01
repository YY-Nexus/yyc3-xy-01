/**
 * @file LocalAIGateway.ts
 * @description YYC³ AI小语智能成长守护系统本地AI服务API网关，提供本地AI模型集成和API管理
 * @author YYC³团队 <admin@0379.email>
 * @version 1.0.0
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import ollamaService, { ChatMessage, ChatOptions } from './OllamaService';
import ragEngine, { RAGContext, RAGResponse } from './RAGEngine';

// 配置
const PORT = parseInt(process.env.PORT || '8081');
const HOST = process.env.HOST || '0.0.0.0';

// 创建Hono应用
const app = new Hono();

// 中间件
app.use('*', cors({
  origin: ['http://localhost:3000', 'http://localhost:1229', 'http://localhost:8080'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use('*', logger());

// 健康检查端点
app.get('/health', async (c) => {
  try {
    const ollamaHealth = await ollamaService.healthCheck();
    const metrics = await ollamaService.getMetrics();

    return c.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        ollama: ollamaHealth,
        gateway: {
          status: 'healthy',
          uptime: process.uptime(),
          memory: process.memoryUsage(),
        }
      },
      metrics: {
        total_requests: metrics.total_requests,
        successful_requests: metrics.successful_requests,
        avg_response_time: Math.round(metrics.avg_response_time),
      }
    });
  } catch (error) {
    return c.json({
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, 503);
  }
});

// AI聊天端点
app.post('/api/chat', async (c) => {
  try {
    const { messages, options = {}, use_rag = false, user_context } = await c.req.json();

    // 验证请求参数
    if (!messages || !Array.isArray(messages)) {
      return c.json({
        error: 'Invalid messages format',
        code: 'INVALID_MESSAGES'
      }, 400);
    }

    if (messages.length === 0) {
      return c.json({
        error: 'Messages cannot be empty',
        code: 'EMPTY_MESSAGES'
      }, 400);
    }

    let response;

    if (use_rag) {
      // 使用RAG增强生成
      const ragContext: RAGContext = {
        query: messages[messages.length - 1].content,
        conversation_history: messages.slice(0, -1),
        user_context: user_context,
        retrieved_knowledge: [], // 将在generateResponse中填充
      };

      response = await ragEngine.generateResponse(ragContext);
    } else {
      // 直接使用Ollama
      const chatResponse = await ollamaService.chat(messages, options);

      response = {
        answer: chatResponse.message.content,
        sources: [],
        confidence: 0.8, // 默认置信度
        reasoning: '基于AI模型直接生成回答',
        related_questions: [],
        follow_up_suggestions: [],
        model: chatResponse.model,
        usage: chatResponse.usage,
        thinking_time: chatResponse.thinking_time,
      };
    }

    return c.json({
      success: true,
      data: response,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Chat API error:', error);

    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      code: 'CHAT_FAILED',
      timestamp: new Date().toISOString(),
    }, 500);
  }
});

// 流式聊天端点
app.post('/api/chat/stream', async (c) => {
  try {
    const { messages, options = {} } = await c.req.json();

    // 验证请求参数
    if (!messages || !Array.isArray(messages)) {
      return c.json({
        error: 'Invalid messages format',
        code: 'INVALID_MESSAGES'
      }, 400);
    }

    // 设置响应头为流式
    c.header('Content-Type', 'text/event-stream');
    c.header('Cache-Control', 'no-cache');
    c.header('Connection', 'keep-alive');

    // 创建流式响应
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const requestId = Date.now().toString();

          // 发送开始事件
          controller.enqueue(`event: start\n`);
          controller.enqueue(`data: ${JSON.stringify({
            type: 'start',
            requestId,
            timestamp: new Date().toISOString(),
          })}\n\n`);

          // 调用Ollama流式API
          const response = await fetch(`${process.env.OLLAMA_BASE_URL}/api/chat`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: options.model || process.env.DEFAULT_MODEL,
              messages: messages,
              stream: true,
              options: {
                temperature: options.temperature ?? 0.7,
                top_p: options.top_p ?? 0.9,
                num_predict: options.max_tokens ?? 2048,
              }
            }),
          });

          if (!response.ok) {
            throw new Error(`Ollama API error: ${response.statusText}`);
          }

          const reader = response.body?.getReader();
          const decoder = new TextDecoder();

          if (!reader) {
            throw new Error('No response body available');
          }

          let buffer = '';

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (line.trim() && line.startsWith('data: ')) {
                try {
                  const data = line.slice(6);
                  if (data === '[DONE]') {
                    controller.enqueue(`event: end\n`);
                    controller.enqueue(`data: ${JSON.stringify({
                      type: 'end',
                      requestId,
                      timestamp: new Date().toISOString(),
                    })}\n\n`);
                    break;
                  }

                  const parsed = JSON.parse(data);
                  controller.enqueue(`event: message\n`);
                  controller.enqueue(`data: ${JSON.stringify({
                    type: 'message',
                    requestId,
                    content: parsed.message?.content || '',
                    done: parsed.done || false,
                    timestamp: new Date().toISOString(),
                  })}\n\n`);
                } catch (e) {
                  // 忽略解析错误
                }
              }
            }
          }

        } catch (error) {
          controller.enqueue(`event: error\n`);
          controller.enqueue(`data: ${JSON.stringify({
            type: 'error',
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString(),
          })}\n\n`);
        } finally {
          controller.close();
        }
      }
    });

    return new Response(stream);

  } catch (error) {
    console.error('Stream chat API error:', error);

    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      code: 'STREAM_CHAT_FAILED',
      timestamp: new Date().toISOString(),
    }, 500);
  }
});

// 模型管理端点
app.get('/api/models', async (c) => {
  try {
    const models = await ollamaService.listModels();
    const currentModel = ollamaService.getCurrentModel();

    return c.json({
      success: true,
      data: {
        models,
        current_model: currentModel,
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('List models API error:', error);

    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      code: 'LIST_MODELS_FAILED',
      timestamp: new Date().toISOString(),
    }, 500);
  }
});

// 拉取模型端点
app.post('/api/models/pull', async (c) => {
  try {
    const { model } = await c.req.json();

    if (!model) {
      return c.json({
        success: false,
        error: 'Model name is required',
        code: 'MISSING_MODEL_NAME',
      }, 400);
    }

    // 创建流式响应
    const stream = new ReadableStream({
      async start(controller) {
        try {
          await ollamaService.pullModel(model, (progress) => {
            controller.enqueue(`data: ${JSON.stringify({
              type: 'progress',
              model,
              status: progress.status,
              completed: progress.completed,
              total: progress.total,
              percentage: progress.total > 0 ? Math.round((progress.completed / progress.total) * 100) : 0,
              timestamp: new Date().toISOString(),
            })}\n\n`);
          });

          controller.enqueue(`data: ${JSON.stringify({
            type: 'completed',
            model,
            timestamp: new Date().toISOString(),
          })}\n\n`);

        } catch (error) {
          controller.enqueue(`data: ${JSON.stringify({
            type: 'error',
            error: error instanceof Error ? error.message : 'Unknown error',
            model,
            timestamp: new Date().toISOString(),
          })}\n\n`);
        } finally {
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Pull model API error:', error);

    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      code: 'PULL_MODEL_FAILED',
      timestamp: new Date().toISOString(),
    }, 500);
  }
});

// 切换模型端点
app.post('/api/models/switch', async (c) => {
  try {
    const { model } = await c.req.json();

    if (!model) {
      return c.json({
        success: false,
        error: 'Model name is required',
        code: 'MISSING_MODEL_NAME',
      }, 400);
    }

    await ollamaService.switchModel(model);

    return c.json({
      success: true,
      data: {
        current_model: model,
        message: `Successfully switched to model: ${model}`,
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Switch model API error:', error);

    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      code: 'SWITCH_MODEL_FAILED',
      timestamp: new Date().toISOString(),
    }, 500);
  }
});

// 删除模型端点
app.delete('/api/models/:model', async (c) => {
  try {
    const model = c.req.param('model');

    // 这里需要在OllamaService中实现删除方法
    // const success = await ollamaService.deleteModel(model);

    return c.json({
      success: true,
      data: {
        model,
        message: `Model ${model} deletion not implemented yet`,
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Delete model API error:', error);

    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      code: 'DELETE_MODEL_FAILED',
      timestamp: new Date().toISOString(),
    }, 500);
  }
});

// 知识检索端点
app.post('/api/knowledge/search', async (c) => {
  try {
    const { query, filters = {}, top_k = 5, similarity_threshold = 0.7 } = await c.req.json();

    if (!query) {
      return c.json({
        success: false,
        error: 'Query is required',
        code: 'MISSING_QUERY',
      }, 400);
    }

    const results = await ragEngine.retrieveKnowledge({
      text: query,
      filters,
      top_k,
      similarity_threshold,
    });

    return c.json({
      success: true,
      data: {
        query,
        results,
        count: results.length,
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Knowledge search API error:', error);

    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      code: 'KNOWLEDGE_SEARCH_FAILED',
      timestamp: new Date().toISOString(),
    }, 500);
  }
});

// 添加知识文档端点
app.post('/api/knowledge/documents', async (c) => {
  try {
    const documents = await c.req.json();

    if (!Array.isArray(documents) || documents.length === 0) {
      return c.json({
        success: false,
        error: 'Documents array is required',
        code: 'MISSING_DOCUMENTS',
      }, 400);
    }

    await ragEngine.addKnowledge(documents);

    return c.json({
      success: true,
      data: {
        count: documents.length,
        message: `Successfully added ${documents.length} knowledge documents`,
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Add knowledge API error:', error);

    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      code: 'ADD_KNOWLEDGE_FAILED',
      timestamp: new Date().toISOString(),
    }, 500);
  }
});

// 知识统计端点
app.get('/api/knowledge/stats', async (c) => {
  try {
    const stats = await ragEngine.getKnowledgeStats();

    return c.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Knowledge stats API error:', error);

    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      code: 'KNOWLEDGE_STATS_FAILED',
      timestamp: new Date().toISOString(),
    }, 500);
  }
});

// 性能指标端点
app.get('/api/metrics', async (c) => {
  try {
    const ollamaMetrics = await ollamaService.getMetrics();
    const health = await ollamaService.healthCheck();
    const knowledgeStats = await ragEngine.getKnowledgeStats();

    return c.json({
      success: true,
      data: {
        ollama: ollamaMetrics,
        health,
        knowledge: knowledgeStats,
        system: {
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          cpu: process.cpuUsage(),
        },
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Metrics API error:', error);

    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      code: 'METRICS_FAILED',
      timestamp: new Date().toISOString(),
    }, 500);
  }
});

// 404处理
app.notFound((c) => {
  return c.json({
    success: false,
    error: 'Endpoint not found',
    code: 'NOT_FOUND',
    timestamp: new Date().toISOString(),
  }, 404);
});

// 错误处理
app.onError((err, c) => {
  console.error('Server error:', err);
  return c.json({
    success: false,
    error: 'Internal server error',
    code: 'INTERNAL_ERROR',
    timestamp: new Date().toISOString(),
  }, 500);
});

// 启动服务器
console.log(`🚀 YYC³ 本地AI服务网关启动在 http://${HOST}:${PORT}`);

Bun.serve({
  fetch: app.fetch,
  port: PORT,
  hostname: HOST,
});

export default app;