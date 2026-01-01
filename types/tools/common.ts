/**
 * @file common.ts
 * @description YYC³ AI小语智能成长守护系统工具系统类型定义，定义工具注册、执行和编排相关的类型
 * @author YYC³团队 <admin@0379.email>
 * @version 1.0.0
 */

/**
 * 工具状态枚举
 */
export enum ToolStatus {
  REGISTERED = 'registered',    // 已注册
  INITIALIZING = 'initializing', // 初始化中
  READY = 'ready',             // 就绪
  RUNNING = 'running',         // 运行中
  ERROR = 'error',             // 错误
  STOPPED = 'stopped',         // 停止
  UPDATING = 'updating'        // 更新中
}

/**
 * 工具能力定义
 */
export interface ToolCapability {
  name: string
  description: string
  parameters: ToolParameter[]
  returnType: string
  examples?: string[]
}

/**
 * 工具参数定义
 */
export interface ToolParameter {
  name: string
  type: 'string' | 'number' | 'boolean' | 'object' | 'array'
  required: boolean
  description: string
  defaultValue?: string | number | boolean | Record<string, unknown> | unknown[]
  validation?: {
    min?: number
    max?: number
    pattern?: string
    enum?: (string | number | boolean)[]
  }
}

/**
 * 工具定义
 */
export interface ToolDefinition {
  name: string
  displayName: string
  description: string
  version: string
  category?: string
  tags?: string[]
  author?: string
  license?: string

  // 技术信息
  entryPoint: string
  runtime?: 'node' | 'python' | 'docker' | 'wasm'
  dependencies?: string[]

  // 能力定义
  capabilities: ToolCapability[]

  // 配置
  timeout?: number
  maxMemory?: number
  maxCpu?: number

  // 状态信息
  status: ToolStatus
  registeredAt?: Date
  updatedAt?: Date

  // 元数据
  metadata?: Record<string, unknown>
  icon?: string
  homepage?: string
  repository?: string
  documentation?: string

  // 安全和权限
  permissions?: string[]
  securityLevel?: 'low' | 'medium' | 'high' | 'critical'

  // 性能指标
  performance?: {
    averageResponseTime?: number
    throughput?: number
    successRate?: number
  }
}

/**
 * 工具执行上下文
 */
export interface ToolContext {
  toolName: string
  executionId: string
  parameters: Record<string, unknown>
  userId: string
  sessionId?: string
  metadata: {
    startedAt: Date
    timeout: number
    [key: string]: unknown
  }
}

/**
 * 工具执行请求
 */
export interface ToolExecutionRequest {
  toolName: string
  parameters: Record<string, unknown>
  userId: string
  sessionId?: string
  timeout?: number
  metadata?: Record<string, unknown>
}

/**
 * 工具执行结果
 */
export interface ToolExecutionResult {
  success: boolean
  data?: unknown
  error?: string
  metadata: {
    executionTime: number
    toolVersion: string
    executedAt: Date
    [key: string]: unknown
  }
}

/**
 * 工具指标
 */
export interface ToolMetrics {
  executionCount: number
  successCount: number
  errorCount: number
  averageExecutionTime: number
  lastExecutedAt?: Date
  lastStatus: ToolStatus
  qualityScore: number

  // 详细指标
  responseTimeHistory?: number[]
  errorTypes?: Map<string, number>
  usageByUser?: Map<string, number>
  resourceUsage?: {
    averageMemory: number
    peakMemory: number
    averageCpu: number
    peakCpu: number
  }
}

/**
 * 工具注册表配置
 */
export interface ToolRegistryConfig {
  maxConcurrentExecutions?: number
  healthCheckInterval?: number
  metricsRetentionDays?: number
  enableSemanticSearch?: boolean
  enableAutoOptimization?: boolean
  enableDependencyResolution?: boolean
  cacheSize?: number
  enableCaching?: boolean
  enableMonitoring?: boolean
  enableSecurityScan?: boolean
}

/**
 * 工具编排请求
 */
export interface ToolOrchestrationRequest {
  goal: string
  context?: Record<string, unknown>
  requiredCapabilities?: string[]
  preferredTools?: string[]
  excludedTools?: string[]
  maxSteps?: number
  timeout?: number
  constraints?: {
    maxCost?: number
    maxDuration?: number
    allowedCategories?: string[]
    securityLevel?: 'low' | 'medium' | 'high' | 'critical'
  }
}

/**
 * 工具编排步骤
 */
export interface OrchestrationStep {
  id: string
  toolName: string
  description: string
  parameters: Record<string, unknown>
  estimatedDuration: number
  dependencies: string[]
  conditions?: {
    requires?: string[]
    conflicts?: string[]
  }
  retryPolicy?: {
    maxRetries: number
    backoffStrategy: 'linear' | 'exponential'
    retryDelay: number
  }
}

/**
 * 工具编排计划
 */
export interface ToolOrchestrationPlan {
  id: string
  goal: string
  steps: OrchestrationStep[]
  estimatedDuration: number
  requiredTools: string[]
  dependencies: string[]
  created_at: Date
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
  metadata?: Record<string, unknown>
}

/**
 * 工具编排执行状态
 */
export interface OrchestrationExecutionStatus {
  planId: string
  currentStep?: string
  completedSteps: string[]
  failedSteps: string[]
  startTime: Date
  endTime?: Date
  progress: number
  results: Map<string, ToolExecutionResult>
  errors: Array<{
    step: string
    error: string
    timestamp: Date
  }>
}

/**
 * 工具发现结果
 */
export interface ToolDiscoveryResult {
  tools: ToolDefinition[]
  totalCount: number
  searchTime: number
  facets?: {
    categories: Map<string, number>
    capabilities: Map<string, number>
    tags: Map<string, number>
  }
  suggestions?: string[]
}

/**
 * 工具健康状态
 */
export interface ToolHealthStatus {
  toolName: string
  status: ToolStatus
  lastHealthCheck: Date
  responseTime: number
  errorRate: number
  available: boolean
  issues: Array<{
    type: 'error' | 'warning' | 'info'
    message: string
    timestamp: Date
  }>
  metrics?: {
    cpu: number
    memory: number
    disk: number
    network: number
  }
}

/**
 * 工具性能报告
 */
export interface ToolPerformanceReport {
  toolName: string
  period: {
    start: Date
    end: Date
  }
  summary: {
    totalExecutions: number
    successRate: number
    averageResponseTime: number
    throughput: number
    errorRate: number
  }
  trends: {
    responseTimeTrend: Array<{ timestamp: Date; value: number }>
    successRateTrend: Array<{ timestamp: Date; value: number }>
    usageTrend: Array<{ timestamp: Date; value: number }>
  }
  topErrors: Array<{
    error: string
    count: number
    percentage: number
  }>
  recommendations: string[]
}

/**
 * 工具使用分析
 */
export interface ToolUsageAnalytics {
  toolName: string
  period: {
    start: Date
    end: Date
  }
  usage: {
    totalUsers: number
    totalSessions: number
    totalExecutions: number
    averageExecutionsPerUser: number
    averageExecutionsPerSession: number
  }
  userDistribution: Map<string, number>
  timeDistribution: Map<string, number>
  parameterUsage: Map<string, Record<string, unknown>>
  performanceMetrics: {
    averageResponseTime: number
    p95ResponseTime: number
    p99ResponseTime: number
    errorRate: number
  }
}

/**
 * 工具依赖关系
 */
export interface ToolDependency {
  toolName: string
  dependencies: Array<{
    name: string
    version?: string
    optional: boolean
    type: 'runtime' | 'build' | 'dev'
  }>
  dependents: string[]
  dependencyTree: DependencyNode
}

/**
 * 依赖节点
 */
export interface DependencyNode {
  name: string
  version?: string
  children: DependencyNode[]
  circular: boolean
}

/**
 * 工具注册事件
 */
export interface ToolRegistryEvent {
  type: 'tool_registered' | 'tool_unregistered' | 'tool_updated' |
        'tool_status_changed' | 'tool_execution_started' | 'tool_execution_completed' |
        'tool_execution_error' | 'orchestration_plan_created' | 'orchestration_error'
  timestamp: Date
  data: Record<string, unknown>
}

/**
 * 工具安全策略
 */
export interface ToolSecurityPolicy {
  toolName: string
  permissions: {
    read: string[]
    write: string[]
    execute: string[]
    network: string[]
  }
  resourceLimits: {
    maxMemory: number
    maxCpu: number
    maxDiskSpace: number
    maxNetworkBandwidth: number
  }
  timeout: number
  allowedUsers?: string[]
  allowedRoles?: string[]
  deniedUsers?: string[]
  deniedRoles?: string[]
}

/**
 * 工具监控指标
 */
export interface ToolMonitoringMetrics {
  toolName: string
  timestamp: Date
  metrics: {
    responseTime: number
    memoryUsage: number
    cpuUsage: number
    activeConnections: number
    errorCount: number
    successCount: number
  }
  tags?: Record<string, string>
}

/**
 * 工具配置模板
 */
export interface ToolConfigurationTemplate {
  name: string
  displayName: string
  description: string
  category: string
  version: string
  schema: {
    type: 'object'
    properties: Record<string, {
      type: string
      description: string
      default?: string | number | boolean | Record<string, unknown> | unknown[]
      enum?: (string | number | boolean)[]
    }>
    required: string[]
  }
  examples: Array<{
    name: string
    description: string
    config: Record<string, unknown>
  }>
}

/**
 * 工具推荐上下文
 */
export interface ToolRecommendationContext {
  userId?: string
  sessionId?: string
  previousTools?: string[]
  userPreferences?: {
    categories?: string[]
    tags?: string[]
    excludedTools?: string[]
  }
  constraints?: {
    maxCost?: number
    maxDuration?: number
    securityLevel?: 'low' | 'medium' | 'high' | 'critical'
  }
  metadata?: Record<string, unknown>
}