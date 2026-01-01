/**
 * @file common.ts
 * @description YYC³ AI小语智能成长守护系统API网关类型定义，定义API网关、微服务架构和路由管理的类型
 * @author YYC³团队 <admin@0379.email>
 * @version 1.0.0
 */

/**
 * API网关配置
 */
export interface GatewayConfig {
  port: number
  host: string
  maxConnections: number
  requestTimeout: number
  enableMetrics?: boolean
  enableCircuitBreaker?: boolean
  enableRateLimit?: boolean
  enableAuth?: boolean
  healthCheckInterval?: number
  retryAttempts?: number
  retryDelay?: number
  loadBalancingStrategy?: LoadBalancingStrategy
  authentication?: AuthenticationConfig
  ssl?: SSLConfig
  cors?: CORSConfig
  compression?: boolean
  cache?: CacheConfig
  serviceDiscovery?: ServiceDiscoveryConfig
}

/**
 * 负载均衡策略
 */
export type LoadBalancingStrategy =
  | 'round_robin'
  | 'weighted_round_robin'
  | 'least_connections'
  | 'least_response_time'
  | 'random'
  | 'consistent_hash'
  | 'ip_hash'

/**
 * 服务定义
 */
export interface ServiceDefinition {
  id: string
  name: string
  version: string
  host: string
  port: number
  protocol: 'http' | 'https' | 'ws' | 'wss'
  basePath?: string
  healthCheckPath?: string
  timeout?: number
  retryAttempts?: number
  weight?: number
  authentication?: boolean
  rateLimit?: RateLimit
  circuitBreaker?: boolean
  metadata?: Record<string, unknown>
  tags?: string[]
  dependencies?: string[]
  environment?: 'development' | 'staging' | 'production'
  region?: string
  zone?: string
}

/**
 * 路由定义
 */
export interface RouteDefinition {
  path: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS' | 'ALL'
  serviceId: string
  handler?: (request: Request, metadata: RequestMetadata) => Promise<Response>
  middleware?: string[]
  timeout?: number
  cache?: boolean
  authentication?: boolean
  rateLimit?: RateLimit
  circuitBreaker?: boolean
  retries?: number
  transformRequest?: RequestTransform
  transformResponse?: ResponseTransform
  headers?: Record<string, string>
  query?: Record<string, string>
  body?: unknown
  conditions?: RouteCondition[]
}

/**
 * 路由条件
 */
export interface RouteCondition {
  field: 'header' | 'query' | 'body' | 'path'
  operator: 'equals' | 'contains' | 'regex' | 'in' | 'not_in'
  key: string
  value: unknown
}

/**
 * 请求元数据
 */
export interface RequestMetadata {
  requestId: string
  path: string
  method: string
  startTime: number
  userAgent: string
  ip: string
  headers: Record<string, string>
  query: Record<string, string>
  body?: unknown
  user?: UserContext
  serviceChain?: string[]
  traceId?: string
  spanId?: string
}

/**
 * 响应元数据
 */
export interface ResponseMetadata {
  requestId: string
  duration: number
  statusCode: number
  serviceId: string
  cacheHit: boolean
  error?: string
  headers?: Record<string, string>
  size?: number
  compressed?: boolean
  fromCache?: boolean
  traceId?: string
}

/**
 * 用户上下文
 */
export interface UserContext {
  id: string
  username: string
  email?: string
  roles: string[]
  permissions: string[]
  organization?: string
  department?: string
  metadata?: Record<string, unknown>
}

/**
 * 健康检查
 */
export interface HealthCheck {
  serviceId: string
  status: 'healthy' | 'unhealthy' | 'degraded'
  lastCheck: Date
  responseTime?: number
  details?: string
  error?: string
  uptime?: number
  version?: string
  checks?: Array<{
    name: string
    status: 'pass' | 'fail' | 'warn'
    message?: string
  }>
}

/**
 * 熔断器
 */
export interface CircuitBreaker {
  serviceId: string
  state: 'closed' | 'open' | 'half_open'
  failureCount: number
  successCount: number
  lastFailureTime?: Date
  timeout: number
  threshold: number
  resetTimeout?: number
  monitoringPeriod?: number
}

/**
 * 速率限制
 */
export interface RateLimit {
  windowMs: number
  maxRequests: number
  keyGenerator?: (request: Request) => string
  skipSuccessfulRequests?: boolean
  skipFailedRequests?: boolean
  message?: string
  standardHeaders?: boolean
  legacyHeaders?: boolean
}

/**
 * 认证配置
 */
export interface AuthenticationConfig {
  enabled: boolean
  type: 'jwt' | 'oauth2' | 'basic' | 'apikey' | 'custom'
  secret?: string
  algorithm?: string
  issuer?: string
  audience?: string
  expiresIn?: number
  refreshExpiresIn?: number
  providers?: AuthProvider[]
  headers?: {
    authorization?: string
    apikey?: string
    token?: string
  }
}

/**
 * 认证提供商
 */
export interface AuthProvider {
  name: string
  type: 'oauth2' | 'openid' | 'saml' | 'ldap'
  config: Record<string, unknown>
  enabled: boolean
}

/**
 * SSL配置
 */
export interface SSLConfig {
  enabled: boolean
  certPath?: string
  keyPath?: string
  caPath?: string
  rejectUnauthorized?: boolean
  requestCert?: boolean
  minVersion?: string
  maxVersion?: string
  ciphers?: string[]
}

/**
 * CORS配置
 */
export interface CORSConfig {
  enabled: boolean
  origin: string | string[] | boolean
  methods?: string[]
  allowedHeaders?: string[]
  exposedHeaders?: string[]
  credentials?: boolean
  maxAge?: number
  preflightContinue?: boolean
  optionsSuccessStatus?: number
}

/**
 * 缓存配置
 */
export interface CacheConfig {
  enabled: boolean
  type: 'memory' | 'redis' | 'memcached'
  ttl: number
  maxSize?: number
  keyGenerator?: (request: Request) => string
  skip?: (request: Request) => boolean
  hit?: (response: Response) => boolean
  store?: (key: string, value: unknown, ttl: number) => void
  get?: (key: string) => unknown
  delete?: (key: string) => void
}

/**
 * 请求转换
 */
export interface RequestTransform {
  headers?: Record<string, string>
  query?: Record<string, string>
  body?: unknown
  method?: string
  path?: string
  remove?: string[]
  add?: Record<string, unknown>
}

/**
 * 响应转换
 */
export interface ResponseTransform {
  headers?: Record<string, string>
  body?: unknown
  statusCode?: number
  remove?: string[]
  add?: Record<string, unknown>
  compress?: boolean
}

/**
 * 服务发现配置
 */
export interface ServiceDiscoveryConfig {
  enabled?: boolean
  discoveryInterval?: number
  healthCheckTimeout?: number
  registryType?: 'consul' | 'etcd' | 'zookeeper' | 'redis' | 'memory'
  registryConfig?: Record<string, unknown>
}

/**
 * 服务发现
 */
export interface ServiceDiscovery {
  register(service: ServiceDefinition): Promise<void>
  unregister(serviceId: string): Promise<void>
  discover(): Promise<ServiceDefinition[]>
  getService(serviceId: string): Promise<ServiceDefinition | undefined>
  getServicesByTag(tag: string): Promise<ServiceDefinition[]>
  watch(serviceId: string, callback: (service: ServiceDefinition | null) => void): void
}

/**
 * 负载均衡器
 */
export interface LoadBalancer {
  selectInstance(service: ServiceDefinition): Promise<ServiceInstance>
  updateWeight(serviceId: string, instanceId: string, weight: number): Promise<void>
  getStats(serviceId: string): Promise<LoadBalancerStats>
}

/**
 * 服务实例
 */
export interface ServiceInstance {
  id: string
  host: string
  port: number
  protocol: 'http' | 'https' | 'ws' | 'wss'
  weight: number
  status: 'healthy' | 'unhealthy' | 'draining'
  metadata?: Record<string, unknown>
  healthCheck?: {
    path: string
    interval: number
    timeout: number
    expectedStatus: number
  }
}

/**
 * 负载均衡统计
 */
export interface LoadBalancerStats {
  totalRequests: number
  activeConnections: number
  instanceStats: Array<{
    instanceId: string
    requests: number
    errors: number
    responseTime: number
    lastUsed: Date
  }>
}

/**
 * 指标系统
 */
export interface Metrics {
  requestCount: number
  responseCount: number
  errorCount: number
  responseTimeSum: number
  minResponseTime?: number
  maxResponseTime?: number
  averageResponseTime?: number
  percentile95?: number
  percentile99?: number
  throughput?: number
  errorRate?: number
  activeConnections?: number
  memoryUsage?: NodeJS.MemoryUsage
  cpuUsage?: number
  uptime?: number
  lastReset?: Date
}

/**
 * API文档
 */
export interface APIDocumentation {
  openapi: string
  info: {
    title: string
    version: string
    description?: string
    contact?: {
      name: string
      email: string
      url?: string
    }
    license?: {
      name: string
      url?: string
    }
  }
  servers: Array<{
    url: string
    description: string
    variables?: Record<string, unknown>
  }>
  paths: Record<string, unknown>
  components: {
    schemas?: Record<string, unknown>
    responses?: Record<string, unknown>
    parameters?: Record<string, unknown>
    examples?: Record<string, unknown>
    securitySchemes?: Record<string, unknown>
  }
  security?: Array<Record<string, string[]>>
  tags?: Array<{
    name: string
    description?: string
  }>
}

/**
 * 中间件
 */
export interface Middleware {
  name: string
  priority: number
  before?: (request: Request, metadata: RequestMetadata) => Promise<void>
  after?: (response: Response, metadata: ResponseMetadata) => Promise<Response>
  onError?: (error: Error, request: Request, metadata: RequestMetadata) => Promise<void>
}

/**
 * 插件系统
 */
export interface Plugin {
  name: string
  version: string
  description: string
  author: string
  enabled: boolean
  config: Record<string, unknown>
  hooks: {
    beforeRequest?: (request: Request, metadata: RequestMetadata) => Promise<void>
    afterResponse?: (response: Response, metadata: ResponseMetadata) => Promise<Response>
    onError?: (error: Error, request: Request, metadata: RequestMetadata) => Promise<void>
    onServiceRegister?: (service: ServiceDefinition) => Promise<void>
    onServiceUnregister?: (serviceId: string) => Promise<void>
  }
}

/**
 * API版本管理
 */
export interface APIVersion {
  version: string
  status: 'active' | 'deprecated' | 'experimental'
  releaseDate: Date
  deprecationDate?: Date
  sunsetDate?: Date
  migrationGuide?: string
  changelog: string[]
  supportedUntil?: Date
  breakingChanges: boolean
}

/**
 * 限流策略
 */
export interface ThrottlingPolicy {
  id: string
  name: string
  description: string
  rules: ThrottlingRule[]
  priority: number
  enabled: boolean
  createdAt: Date
  updatedAt: Date
}

/**
 * 限流规则
 */
export interface ThrottlingRule {
  identifier: string
  limit: number
  windowMs: number
  strategy: 'fixed' | 'sliding' | 'token_bucket'
  keyGenerator?: (request: Request) => string
  conditions?: RouteCondition[]
}

/**
 * 安全策略
 */
export interface SecurityPolicy {
  id: string
  name: string
  rules: SecurityRule[]
  enabled: boolean
  createdAt: Date
  updatedAt: Date
}

/**
 * 安全规则
 */
export interface SecurityRule {
  type: 'rate_limit' | 'auth' | 'cors' | 'validation' | 'sanitization' | 'encryption'
  conditions?: RouteCondition[]
  config: Record<string, unknown>
  priority: number
}

/**
 * 监控配置
 */
export interface MonitoringConfig {
  enabled: boolean
  metrics: MetricsConfig
  logging: LoggingConfig
  tracing: TracingConfig
  alerting: AlertingConfig
}

/**
 * 指标配置
 */
export interface MetricsConfig {
  enabled: boolean
  interval: number
  prefix: string
  labels: Record<string, string>
  customMetrics?: CustomMetric[]
}

/**
 * 自定义指标
 */
export interface CustomMetric {
  name: string
  type: 'counter' | 'gauge' | 'histogram' | 'summary'
  description: string
  labels?: string[]
  buckets?: number[]
  objectives?: Array<{
    quantile: number
    value: number
  }>
}

/**
 * 日志配置
 */
export interface LoggingConfig {
  enabled: boolean
  level: 'debug' | 'info' | 'warn' | 'error'
  format: 'json' | 'text'
  outputs: LogOutput[]
  requestLogging?: boolean
  responseLogging?: boolean
  errorLogging?: boolean
}

/**
 * 日志输出
 */
export interface LogOutput {
  type: 'console' | 'file' | 'elasticsearch' | 'splunk' | 'syslog'
  config: Record<string, unknown>
  enabled: boolean
  level?: string
}

/**
 * 链路追踪配置
 */
export interface TracingConfig {
  enabled: boolean
  serviceName: string
  sampleRate: number
  exporter: 'jaeger' | 'zipkin' | 'xray' | 'custom'
  config: Record<string, unknown>
}

/**
 * 告警配置
 */
export interface AlertingConfig {
  enabled: boolean
  rules: AlertRule[]
  channels: AlertChannel[]
}

/**
 * 告警规则
 */
export interface AlertRule {
  name: string
  condition: string
  threshold: number
  duration: number
  severity: 'low' | 'medium' | 'high' | 'critical'
  enabled: boolean
  labels?: Record<string, string>
}

/**
 * 告警渠道
 */
export interface AlertChannel {
  type: 'email' | 'slack' | 'webhook' | 'sms' | 'pagerduty'
  config: Record<string, unknown>
  enabled: boolean
  filters?: Record<string, unknown>
}

/**
 * 网关路由处理器
 */
export type GatewayRouteHandler = (request: Request, metadata: RequestMetadata) => Promise<Response>

/**
 * 网关路由方法映射
 */
export type GatewayRouteMethods = {
  GET?: GatewayRouteHandler
  POST?: GatewayRouteHandler
  PUT?: GatewayRouteHandler
  DELETE?: GatewayRouteHandler
  PATCH?: GatewayRouteHandler
  HEAD?: GatewayRouteHandler
  OPTIONS?: GatewayRouteHandler
  ALL?: GatewayRouteHandler
}

/**
 * 网关路由注册表
 */
export type GatewayRouteRegistry = Record<string, GatewayRouteMethods>

/**
 * 速率限制结果
 */
export interface RateLimitResult {
  allowed: boolean
  retryAfter?: number
  limit?: number
  remaining?: number
  reset?: number
}

/**
 * 网关错误
 */
export interface GatewayError {
  message: string
  code?: string
  statusCode?: number
  details?: Record<string, unknown>
  timestamp?: Date
  stack?: string
}

/**
 * 网关服务器
 */
export interface GatewayServer {
  port: number
  hostname: string
  stop: () => void
  reload: () => void
  upgrade: (req: Request, socket: unknown, head: Buffer) => void
}
