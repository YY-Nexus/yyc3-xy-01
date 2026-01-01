/**
 * @file common.ts
 * @description YYC³ AI小语智能成长守护系统API服务通用类型定义
 * @author YYC³团队 <admin@0379.email>
 * @version 1.0.0
 */

/**
 * API路由处理器类型
 */
export type APIRouteHandler = (request: Request) => Promise<Response>

/**
 * API路由方法映射
 */
export type APIRouteMethods = {
  GET?: APIRouteHandler
  POST?: APIRouteHandler
  PUT?: APIRouteHandler
  DELETE?: APIRouteHandler
  PATCH?: APIRouteHandler
}

/**
 * API路由注册表
 */
export type APIRouteRegistry = Record<string, APIRouteMethods>

/**
 * API响应基础结构
 */
export interface APIResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
  total?: number
  hasMore?: boolean
}

/**
 * 分页参数
 */
export interface PaginationParams {
  limit?: number
  offset?: number
  page?: number
}

/**
 * 排序参数
 */
export interface SortParams {
  field?: string
  order?: 'asc' | 'desc'
}

/**
 * 查询参数
 */
export interface QueryParams extends PaginationParams, SortParams {
  filters?: Record<string, unknown>
  search?: string
}

/**
 * 批量操作请求
 */
export interface BatchOperationRequest<T = unknown> {
  operation: string
  items: T[]
  options?: Record<string, unknown>
}

/**
 * 批量操作响应
 */
export interface BatchOperationResponse {
  success: boolean
  total: number
  succeeded: number
  failed: number
  results?: Array<{
    item: unknown
    success: boolean
    error?: string
  }>
}

/**
 * 健康检查响应
 */
export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: Date
  checks?: Record<string, {
    status: 'pass' | 'fail' | 'warn'
    message?: string
  }>
}

/**
 * 统计信息响应
 */
export interface StatisticsResponse {
  [key: string]: unknown
}

/**
 * 趋势数据点
 */
export interface TrendDataPoint {
  timestamp: string | Date
  value: number
  label?: string
}

/**
 * 趋势分析响应
 */
export interface TrendsResponse {
  period: string
  metrics: Record<string, unknown>
  data: TrendDataPoint[]
  insights?: string[]
}

/**
 * 推荐项
 */
export interface RecommendationItem {
  id: string
  type: string
  score: number
  reason?: string
  metadata?: Record<string, unknown>
}

/**
 * 推荐响应
 */
export interface RecommendationsResponse {
  items: RecommendationItem[]
  total: number
  algorithm?: string
  timestamp?: Date
}

/**
 * 错误详情
 */
export interface ErrorDetail {
  code: string
  message: string
  field?: string
  details?: Record<string, unknown>
}

/**
 * 验证错误响应
 */
export interface ValidationErrorResponse {
  success: false
  error: string
  details: ErrorDetail[]
}

/**
 * API配置
 */
export interface APIConfig {
  basePath?: string
  version?: string
  timeout?: number
  maxRetries?: number
  enableCaching?: boolean
  enableRateLimiting?: boolean
  rateLimitWindow?: number
  rateLimitMax?: number
}

/**
 * API中间件
 */
export type APIMiddleware = (
  request: Request,
  response: Response,
  next: () => Promise<Response>
) => Promise<Response>

/**
 * API上下文
 */
export interface APIContext {
  request: Request
  response: Response
  user?: {
    id: string
    roles: string[]
    permissions: string[]
  }
  session?: {
    id: string
    data: Record<string, unknown>
  }
  metadata: Record<string, unknown>
}
