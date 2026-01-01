/**
 * @file APIGateway.ts
 * @description YYC³ AI小语智能成长守护系统API网关，统一管理微服务架构的API路由、负载均衡和请求处理
 * @author YYC³团队 <admin@0379.email>
 * @version 1.0.0
 */

import { Bun } from 'bun'
import { EventEmitter } from 'events'
import type {
  GatewayConfig,
  RouteDefinition,
  ServiceDefinition,
  RequestMetadata,
  ResponseMetadata,
  LoadBalancingStrategy,
  HealthCheck,
  CircuitBreaker,
  RateLimit,
  AuthenticationConfig,
  Metrics,
  ServiceDiscovery,
  GatewayRouteRegistry,
  GatewayRouteHandler,
  RateLimitResult,
  GatewayError,
  GatewayServer,
  ServiceInstance
} from '../types/gateway/common'

/**
 * API网关核心
 * 提供统一的API入口和服务路由管理
 */
export class APIGateway extends EventEmitter {
  private config: GatewayConfig
  private routes: Map<string, RouteDefinition> = new Map()
  private services: Map<string, ServiceDefinition> = new Map()
  private serviceRegistry: ServiceDiscovery
  private loadBalancer: LoadBalancer
  private circuitBreaker: CircuitBreakerManager
  private rateLimiter: RateLimiter
  private authenticator: Authenticator
  private metrics: Metrics
  private isInitialized = false

  constructor(config: GatewayConfig) {
    super()
    this.config = {
      port: process.env.API_GATEWAY_PORT || 1229,
      host: 'localhost',
      maxConnections: 1000,
      requestTimeout: 30000,
      enableMetrics: true,
      enableCircuitBreaker: true,
      enableRateLimit: true,
      enableAuth: true,
      healthCheckInterval: 30000,
      retryAttempts: 3,
      retryDelay: 1000,
      loadBalancingStrategy: 'round_robin',
      ...config
    }

    this.serviceRegistry = new ServiceDiscovery(this.config.serviceDiscovery)
    this.loadBalancer = new LoadBalancer(this.config.loadBalancingStrategy!)
    this.circuitBreaker = new CircuitBreakerManager()
    this.rateLimiter = new RateLimiter()
    this.authenticator = new Authenticator(this.config.authentication!)
    this.metrics = new Metrics()
  }

  /**
   * 初始化API网关
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      console.log('🚪 初始化API网关...')

      // 发现服务
      await this.discoverServices()

      // 初始化路由
      await this.initializeRoutes()

      // 启动健康检查
      this.startHealthChecks()

      // 启动服务
      await this.startServer()

      this.isInitialized = true
      console.log(`✅ API网关已启动在 http://${this.config.host}:${this.config.port}`)
      this.emit('initialized')

    } catch (error) {
      console.error('❌ API网关初始化失败:', error)
      this.emit('initializationError', error)
      throw error
    }
  }

  /**
   * 注册服务
   */
  async registerService(service: ServiceDefinition): Promise<void> {
    try {
      // 验证服务定义
      await this.validateService(service)

      // 注册到服务发现
      await this.serviceRegistry.register(service)

      // 存储服务定义
      this.services.set(service.id, service)

      // 初始化熔断器
      if (this.config.enableCircuitBreaker) {
        await this.circuitBreaker.registerService(service.id)
      }

      // 初始化速率限制
      if (this.config.enableRateLimit) {
        await this.rateLimiter.registerService(service.id, service.rateLimit)
      }

      this.emit('serviceRegistered', { service })
      console.log(`✅ 服务 "${service.name}" 注册成功`)

    } catch (error) {
      this.emit('serviceRegistrationError', { service, error })
      throw error
    }
  }

  /**
   * 获取服务发现实例
   */
  getServiceDiscovery(): ServiceDiscovery {
    return this.serviceRegistry
  }

  /**
   * 注销服务
   */
  async unregisterService(serviceId: string): Promise<void> {
    try {
      const service = this.services.get(serviceId)
      if (!service) {
        throw new Error(`服务 "${serviceId}" 不存在`)
      }

      // 从服务发现中移除
      await this.serviceRegistry.unregister(serviceId)

      // 从存储中移除
      this.services.delete(serviceId)

      // 清理熔断器
      if (this.config.enableCircuitBreaker) {
        await this.circuitBreaker.unregisterService(serviceId)
      }

      this.emit('serviceUnregistered', { serviceId, service })
      console.log(`✅ 服务 "${service.name}" 注销成功`)

    } catch (error) {
      this.emit('serviceUnregistrationError', { serviceId, error })
      throw error
    }
  }

  /**
   * 添加路由
   */
  async addRoute(route: RouteDefinition): Promise<void> {
    try {
      // 验证路由定义
      await this.validateRoute(route)

      // 存储路由
      this.routes.set(route.path, route)

      this.emit('routeAdded', { route })
      console.log(`✅ 路由 "${route.path}" 添加成功`)

    } catch (error) {
      this.emit('routeAdditionError', { route, error })
      throw error
    }
  }

  /**
   * 移除路由
   */
  async removeRoute(path: string): Promise<void> {
    try {
      if (!this.routes.has(path)) {
        throw new Error(`路由 "${path}" 不存在`)
      }

      this.routes.delete(path)
      this.emit('routeRemoved', { path })
      console.log(`✅ 路由 "${path}" 移除成功`)

    } catch (error) {
      this.emit('routeRemovalError', { path, error })
      throw error
    }
  }

  /**
   * 获取服务列表
   */
  getServices(): ServiceDefinition[] {
    return Array.from(this.services.values())
  }

  /**
   * 获取路由列表
   */
  getRoutes(): RouteDefinition[] {
    return Array.from(this.routes.values())
  }

  /**
   * 获取服务健康状态
   */
  async getServiceHealth(): Promise<Record<string, HealthCheck>> {
    const healthStatus: Record<string, HealthCheck> = {}

    for (const [serviceId, service] of this.services) {
      try {
        const health = await this.checkServiceHealth(service)
        healthStatus[serviceId] = health
      } catch (error) {
        healthStatus[serviceId] = {
          serviceId,
          status: 'unhealthy',
          lastCheck: new Date(),
          error: error instanceof Error ? error.message : String(error)
        }
      }
    }

    return healthStatus
  }

  /**
   * 获取指标
   */
  getMetrics(): Metrics {
    return this.metrics
  }

  /**
   * 关闭API网关
   */
  async shutdown(): Promise<void> {
    if (!this.isInitialized) return

    try {
      console.log('🛑 关闭API网关...')

      // 停止健康检查
      if (this.healthCheckInterval) {
        clearInterval(this.healthCheckInterval)
      }

      // 停止服务器
      if (this.server) {
        this.server.stop()
      }

      // 清理资源
      this.routes.clear()
      this.services.clear()
      await this.serviceRegistry.cleanup()

      this.isInitialized = false
      console.log('✅ API网关已关闭')
      this.emit('shutdown')

    } catch (error) {
      console.error('❌ 关闭API网关时出错:', error)
      throw error
    }
  }

  // 私有方法实现
  private async discoverServices(): Promise<void> {
    console.log('🔍 发现微服务...')

    // 自动发现环境中的服务
    const discoveredServices = await this.serviceRegistry.discover()

    for (const service of discoveredServices) {
      await this.registerService(service)
    }
  }

  private async initializeRoutes(): Promise<void> {
    console.log('🛣️ 初始化路由...')

    // 添加默认路由
    await this.addDefaultRoutes()

    // 为每个服务自动生成路由
    for (const service of this.services.values()) {
      await this.generateServiceRoutes(service)
    }
  }

  private async addDefaultRoutes(): Promise<void> {
    const defaultRoutes: RouteDefinition[] = [
      {
        path: '/health',
        method: 'GET',
        serviceId: 'gateway',
        handler: this.handleHealthCheck.bind(this),
        middleware: [],
        timeout: 5000
      },
      {
        path: '/metrics',
        method: 'GET',
        serviceId: 'gateway',
        handler: this.handleMetrics.bind(this),
        middleware: [],
        timeout: 5000
      },
      {
        path: '/services',
        method: 'GET',
        serviceId: 'gateway',
        handler: this.handleServices.bind(this),
        middleware: [],
        timeout: 5000
      }
    ]

    for (const route of defaultRoutes) {
      await this.addRoute(route)
    }
  }

  private async generateServiceRoutes(service: ServiceDefinition): Promise<void> {
    // 为服务生成RESTful路由
    const basePath = service.basePath || `/api/${service.name.toLowerCase()}`

    const serviceRoutes: RouteDefinition[] = [
      {
        path: `${basePath}/*`,
        method: 'ALL',
        serviceId: service.id,
        handler: this.handleServiceRequest.bind(this, service.id),
        middleware: this.getServiceMiddleware(service),
        timeout: service.timeout || this.config.requestTimeout
      }
    ]

    for (const route of serviceRoutes) {
      await this.addRoute(route)
    }
  }

  private getServiceMiddleware(service: ServiceDefinition): Array<string> {
    const middleware: string[] = []

    if (service.authentication) {
      middleware.push('authentication')
    }

    if (service.rateLimit) {
      middleware.push('rateLimit')
    }

    if (service.circuitBreaker) {
      middleware.push('circuitBreaker')
    }

    return middleware
  }

  private startHealthChecks(): void {
    if (this.config.healthCheckInterval > 0) {
      this.healthCheckInterval = setInterval(async () => {
        await this.performHealthChecks()
      }, this.config.healthCheckInterval)
    }
  }

  private async performHealthChecks(): Promise<void> {
    const healthStatus = await this.getServiceHealth()

    for (const [serviceId, health] of Object.entries(healthStatus)) {
      if (health.status === 'unhealthy') {
        this.emit('serviceUnhealthy', { serviceId, health })
      }
    }
  }

  private async startServer(): Promise<void> {
    const routes: GatewayRouteRegistry = {}

    // 注册所有路由
    for (const [path, route] of this.routes) {
      routes[path] = {
        [route.method]: this.createRouteHandler(route)
      }
    }

    // 创建服务器
    this.server = Bun.serve({
      port: this.config.port,
      hostname: this.config.host,
      routes,
      error: this.handleError.bind(this),
      development: {
        hmr: true,
        console: true
      }
    })
  }

  private createRouteHandler(route: RouteDefinition): GatewayRouteHandler {
    return async (request: Request): Promise<Response> => {
      const startTime = Date.now()
      const requestId = this.generateRequestId()

      try {
        // 创建请求元数据
        const metadata: RequestMetadata = {
          requestId,
          path: new URL(request.url).pathname,
          method: request.method,
          startTime,
          userAgent: request.headers.get('user-agent') || '',
          ip: this.getClientIP(request),
          headers: Object.fromEntries(request.headers.entries())
        }

        // 记录请求指标
        this.metrics.recordRequest(metadata)

        // 执行中间件
        await this.executeMiddleware(route.middleware || [], request, metadata)

        // 检查速率限制
        if (this.config.enableRateLimit) {
          const rateLimitResult = await this.rateLimiter.checkLimit(
            metadata.ip,
            route.serviceId
          )
          if (!rateLimitResult.allowed) {
            return this.createRateLimitResponse(rateLimitResult)
          }
        }

        // 执行路由处理器
        const response = await route.handler(request, metadata)

        // 创建响应元数据
        const responseMetadata: ResponseMetadata = {
          requestId,
          duration: Date.now() - startTime,
          statusCode: response.status,
          serviceId: route.serviceId,
          cacheHit: false,
          error: null
        }

        // 记录响应指标
        this.metrics.recordResponse(responseMetadata)

        return response

      } catch (error) {
        const responseMetadata: ResponseMetadata = {
          requestId,
          duration: Date.now() - startTime,
          statusCode: 500,
          serviceId: route.serviceId,
          cacheHit: false,
          error: error instanceof Error ? error.message : String(error)
        }

        this.metrics.recordResponse(responseMetadata)
        this.emit('requestError', { metadata, error })

        return this.createErrorResponse(error)
      }
    }
  }

  private async executeMiddleware(
    middleware: string[],
    request: Request,
    metadata: RequestMetadata
  ): Promise<void> {
    for (const middlewareName of middleware) {
      switch (middlewareName) {
        case 'authentication':
          if (this.config.enableAuth) {
            await this.authenticator.authenticate(request, metadata)
          }
          break

        case 'rateLimit':
          if (this.config.enableRateLimit) {
            const rateLimitResult = await this.rateLimiter.checkLimit(
              metadata.ip,
              metadata.path
            )
            if (!rateLimitResult.allowed) {
              throw new Error('Rate limit exceeded')
            }
          }
          break

        case 'circuitBreaker':
          if (this.config.enableCircuitBreaker) {
            // 熔断器检查在服务调用时执行
          }
          break
      }
    }
  }

  private async handleServiceRequest(
    serviceId: string,
    request: Request,
    metadata: RequestMetadata
  ): Promise<Response> {
    const service = this.services.get(serviceId)
    if (!service) {
      throw new Error(`服务 "${serviceId}" 不存在`)
    }

    // 检查熔断器状态
    if (this.config.enableCircuitBreaker) {
      const circuitState = await this.circuitBreaker.getState(serviceId)
      if (circuitState.state === 'open') {
        return this.createCircuitBreakerResponse(circuitState)
      }
    }

    // 获取服务实例
    const instance = await this.loadBalancer.selectInstance(service)
    if (!instance) {
      throw new Error(`服务 "${serviceId}" 没有可用实例`)
    }

    // 转发请求
    const response = await this.forwardRequest(request, instance)

    // 更新熔断器状态
    if (this.config.enableCircuitBreaker) {
      await this.circuitBreaker.recordSuccess(serviceId)
    }

    return response
  }

  private async forwardRequest(
    request: Request,
    instance: ServiceInstance
  ): Promise<Response> {
    const url = new URL(request.url)
    const targetUrl = `${instance.protocol}://${instance.host}:${instance.port}${url.pathname}${url.search}`

    // 转发请求头
    const headers = new Headers()
    for (const [key, value] of request.headers.entries()) {
      headers.set(key, value)
    }

    // 更新Host头
    headers.set('Host', `${instance.host}:${instance.port}`)

    // 转发请求
    const response = await fetch(targetUrl, {
      method: request.method,
      headers,
      body: request.body,
      signal: AbortSignal.timeout(this.config.requestTimeout!)
    })

    return response
  }

  private async handleHealthCheck(request: Request, metadata: RequestMetadata): Promise<Response> {
    const health = await this.getServiceHealth()

    return Response.json({
      status: 'healthy',
      timestamp: new Date(),
      services: health,
      gateway: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: '1.0.0'
      }
    })
  }

  private async handleMetrics(request: Request, metadata: RequestMetadata): Promise<Response> {
    const metrics = this.getMetrics()

    return Response.json({
      metrics,
      timestamp: new Date()
    })
  }

  private async handleServices(request: Request, metadata: RequestMetadata): Promise<Response> {
    const services = this.getServices()

    return Response.json({
      services,
      total: services.length,
      timestamp: new Date()
    })
  }

  private createRateLimitResponse(rateLimitResult: RateLimitResult): Response {
    return Response.json({
      error: 'Rate limit exceeded',
      retryAfter: rateLimitResult.retryAfter
    }, { status: 429 })
  }

  private createCircuitBreakerResponse(circuitState: CircuitBreaker): Response {
    return Response.json({
      error: 'Service temporarily unavailable',
      state: circuitState.state
    }, { status: 503 })
  }

  private createErrorResponse(error: Error | GatewayError): Response {
    return Response.json({
      error: 'Internal server error',
      message: error.message || 'Unknown error',
      timestamp: new Date()
    }, { status: 500 })
  }

  private handleError(error: Error): Response {
    console.error('Gateway error:', error)
    return this.createErrorResponse(error)
  }

  private async checkServiceHealth(service: ServiceDefinition): Promise<HealthCheck> {
    try {
      const healthUrl = `${service.protocol}://${service.host}:${service.port}/health`
      const response = await fetch(healthUrl, {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      })

      return {
        serviceId: service.id,
        status: response.ok ? 'healthy' : 'unhealthy',
        lastCheck: new Date(),
        responseTime: 0, // 可以计算实际响应时间
        details: response.ok ? undefined : `HTTP ${response.status}`
      }
    } catch (error) {
      return {
        serviceId: service.id,
        status: 'unhealthy',
        lastCheck: new Date(),
        error: error instanceof Error ? error.message : String(error)
      }
    }
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private getClientIP(request: Request): string {
    return request.headers.get('x-forwarded-for') ||
           request.headers.get('x-real-ip') ||
           'unknown'
  }

  private async validateService(service: ServiceDefinition): Promise<void> {
    if (!service.id || !service.name || !service.host || !service.port) {
      throw new Error('服务定义缺少必需字段')
    }
  }

  private async validateRoute(route: RouteDefinition): Promise<void> {
    if (!route.path || !route.method || !route.serviceId) {
      throw new Error('路由定义缺少必需字段')
    }
  }

  private server?: GatewayServer
  private healthCheckInterval?: NodeJS.Timeout
}

// 辅助类实现
class ServiceDiscovery extends EventEmitter {
  private services: Map<string, ServiceDefinition> = new Map()
  private healthStatus: Map<string, 'healthy' | 'unhealthy' | 'unknown'> = new Map()
  private lastHealthCheck: Map<string, Date> = new Map()
  private discoveryInterval?: NodeJS.Timeout
  private isInitialized = false

  constructor(private config?: { discoveryInterval?: number; healthCheckTimeout?: number }) {
    super()
    this.config = {
      discoveryInterval: 30000, // 30秒
      healthCheckTimeout: 5000, // 5秒
      ...config
    }
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return

    console.log('🔍 初始化服务发现系统...')
    
    // 启动定期服务发现
    this.startPeriodicDiscovery()
    
    // 执行初始服务发现
    await this.discover()
    
    this.isInitialized = true
    console.log('✅ 服务发现系统初始化完成')
  }

  async register(service: ServiceDefinition): Promise<void> {
    console.log(`📝 注册服务: ${service.name} (${service.id})`)
    
    // 设置注册时间
    service.registeredAt = new Date()
    
    // 添加到服务注册表
    this.services.set(service.id, service)
    
    // 初始化健康状态
    this.healthStatus.set(service.id, 'unknown')
    
    // 立即执行健康检查
    await this.performHealthCheck(service.id)
    
    console.log(`✅ 服务 ${service.name} 注册成功`)
  }

  async unregister(serviceId: string): Promise<void> {
    const service = this.services.get(serviceId)
    if (service) {
      console.log(`🗑️ 注销服务: ${service.name} (${serviceId})`)
      this.services.delete(serviceId)
      this.healthStatus.delete(serviceId)
      this.lastHealthCheck.delete(serviceId)
      console.log(`✅ 服务 ${service.name} 注销成功`)
    }
  }

  async discover(): Promise<ServiceDefinition[]> {
    console.log('🔍 执行服务发现...')
    
    try {
      // 1. 发现本地服务（通过环境变量或配置文件）
      await this.discoverLocalServices()
      
      // 2. 发现网络服务（通过服务注册中心）
      await this.discoverNetworkServices()
      
      // 3. 发现动态服务（通过服务自注册）
      await this.discoverDynamicServices()
      
      // 4. 清理不健康的服务
      await this.cleanupUnhealthyServices()
      
      const services = Array.from(this.services.values())
      console.log(`✅ 服务发现完成，发现 ${services.length} 个服务`)
      
      return services
      
    } catch (error) {
      console.error('❌ 服务发现失败:', error)
      return []
    }
  }

  async getService(serviceId: string): Promise<ServiceDefinition | undefined> {
    const service = this.services.get(serviceId)
    
    // 检查服务健康状态
    if (service && this.healthStatus.get(serviceId) === 'healthy') {
      return service
    }
    
    return undefined
  }

  async getHealthyServices(): Promise<ServiceDefinition[]> {
    const healthyServices: ServiceDefinition[] = []
    
    for (const [serviceId, service] of this.services) {
      if (this.healthStatus.get(serviceId) === 'healthy') {
        healthyServices.push(service)
      }
    }
    
    return healthyServices
  }

  async performHealthCheck(serviceId?: string): Promise<void> {
    if (serviceId) {
      // 检查单个服务
      await this.checkServiceHealth(serviceId)
    } else {
      // 检查所有服务
      const checkPromises = Array.from(this.services.keys()).map(id => 
        this.checkServiceHealth(id)
      )
      await Promise.allSettled(checkPromises)
    }
  }

  async getServiceHealth(serviceId: string): Promise<{
    status: 'healthy' | 'unhealthy' | 'unknown'
    lastCheck: Date
    details?: string
  }> {
    return {
      status: this.healthStatus.get(serviceId) || 'unknown',
      lastCheck: this.lastHealthCheck.get(serviceId) || new Date(),
      details: this.getServiceHealthDetails(serviceId)
    }
  }

  async getAllServicesHealth(): Promise<Map<string, {
    status: 'healthy' | 'unhealthy' | 'unknown'
    lastCheck: Date
    details?: string
  }>> {
    const healthMap = new Map()
    
    for (const serviceId of this.services.keys()) {
      healthMap.set(serviceId, await this.getServiceHealth(serviceId))
    }
    
    return healthMap
  }

  async cleanup(): Promise<void> {
    console.log('🧹 清理服务发现系统...')
    
    // 停止定期发现
    if (this.discoveryInterval) {
      clearInterval(this.discoveryInterval)
      this.discoveryInterval = undefined
    }
    
    // 清理所有数据
    this.services.clear()
    this.healthStatus.clear()
    this.lastHealthCheck.clear()
    
    console.log('✅ 服务发现系统清理完成')
  }

  // 私有方法
  private startPeriodicDiscovery(): void {
    if (this.config?.discoveryInterval && this.config.discoveryInterval > 0) {
      this.discoveryInterval = setInterval(async () => {
        try {
          await this.discover()
        } catch (error) {
          console.error('❌ 定期服务发现失败:', error)
        }
      }, this.config.discoveryInterval)
      
      console.log(`⏰ 启动定期服务发现，间隔 ${this.config.discoveryInterval}ms`)
    }
  }

  private async discoverLocalServices(): Promise<void> {
    // 从环境变量发现本地服务
    const localServices = this.parseLocalServicesFromEnv()
    
    for (const service of localServices) {
      if (!this.services.has(service.id)) {
        await this.register(service)
      }
    }
  }

  private async discoverNetworkServices(): Promise<void> {
    // 从服务注册中心发现服务（如Consul、Etcd等）
    // 这里简化实现，实际可以集成Consul客户端
    try {
      const networkServices = await this.queryServiceRegistry()
      
      for (const service of networkServices) {
        if (!this.services.has(service.id)) {
          await this.register(service)
        }
      }
    } catch (error) {
      console.warn('⚠️ 网络服务发现失败:', error)
    }
  }

  private async discoverDynamicServices(): Promise<void> {
    // 发现动态注册的服务
    // 这里可以通过HTTP端点或消息队列接收服务注册
    try {
      const dynamicServices = await this.queryDynamicServices()
      
      for (const service of dynamicServices) {
        const existingService = this.services.get(service.id)
        
        if (!existingService) {
          // 新服务，直接注册
          await this.register(service)
        } else if (existingService.version !== service.version) {
          // 服务版本更新，更新注册信息
          console.log(`🔄 更新服务: ${service.name} (${service.id})`)
          this.services.set(service.id, { ...service, registeredAt: existingService.registeredAt })
          await this.performHealthCheck(service.id)
        }
      }
    } catch (error) {
      console.warn('⚠️ 动态服务发现失败:', error)
    }
  }

  private async cleanupUnhealthyServices(): Promise<void> {
    const now = new Date()
    const unhealthyThreshold = 5 * 60 * 1000 // 5分钟
    
    for (const [serviceId, lastCheck] of this.lastHealthCheck) {
      const timeSinceLastCheck = now.getTime() - lastCheck.getTime()
      
      if (timeSinceLastCheck > unhealthyThreshold) {
        const healthStatus = this.healthStatus.get(serviceId)
        if (healthStatus === 'unhealthy') {
          console.warn(`⚠️ 移除长期不健康的服务: ${serviceId}`)
          await this.unregister(serviceId)
        }
      }
    }
  }

  private async checkServiceHealth(serviceId: string): Promise<void> {
    const service = this.services.get(serviceId)
    if (!service) return
    
    try {
      const healthCheckUrl = `${service.protocol || 'http'}://${service.host}:${service.port}${service.healthCheckPath || '/health'}`
      
      // 执行健康检查
      const response = await fetch(healthCheckUrl, {
        method: 'GET',
        timeout: this.config?.healthCheckTimeout || 5000
      })
      
      const isHealthy = response.ok
      
      this.healthStatus.set(serviceId, isHealthy ? 'healthy' : 'unhealthy')
      this.lastHealthCheck.set(serviceId, new Date())
      
      if (isHealthy) {
        console.log(`✅ 服务 ${service.name} 健康检查通过`)
      } else {
        console.warn(`⚠️ 服务 ${service.name} 健康检查失败: ${response.status}`)
      }
      
    } catch (error) {
      this.healthStatus.set(serviceId, 'unhealthy')
      this.lastHealthCheck.set(serviceId, new Date())
      console.warn(`⚠️ 服务 ${service.name} 健康检查异常:`, error)
    }
  }

  private getServiceHealthDetails(serviceId: string): string {
    const service = this.services.get(serviceId)
    if (!service) return '服务不存在'
    
    const healthStatus = this.healthStatus.get(serviceId)
    const lastCheck = this.lastHealthCheck.get(serviceId)
    
    return `状态: ${healthStatus}, 最后检查: ${lastCheck?.toLocaleString()}, 端点: ${service.host}:${service.port}`
  }

  private parseLocalServicesFromEnv(): ServiceDefinition[] {
    const services: ServiceDefinition[] = []
    
    // 从环境变量解析本地服务配置
    // 格式: SERVICE_NAME_ID=host:port:basePath:healthCheckPath
    const serviceEnvPrefix = 'SERVICE_'
    
    for (const [key, value] of Object.entries(process.env)) {
      if (key.startsWith(serviceEnvPrefix) && value) {
        try {
          const parts = value.split(':')
          if (parts.length >= 2) {
            const service: ServiceDefinition = {
              id: key.substring(serviceEnvPrefix.length).toLowerCase(),
              name: key.substring(serviceEnvPrefix.length).replace(/_/g, ' '),
              host: parts[0],
              port: parseInt(parts[1], 10),
              protocol: 'http',
              basePath: parts[2] || '',
              healthCheckPath: parts[3] || '/health',
              version: '1.0.0'
            }
            
            services.push(service)
          }
        } catch (error) {
          console.warn(`⚠️ 解析服务环境变量失败 ${key}:`, error)
        }
      }
    }
    
    return services
  }

  private async queryServiceRegistry(): Promise<ServiceDefinition[]> {
    // 查询服务注册中心（如Consul）
    // 这里简化实现，返回空数组
    // 实际实现可以集成Consul、Etcd等服务注册中心
    return []
  }

  private async queryDynamicServices(): Promise<ServiceDefinition[]> {
    // 查询动态服务
    // 这里可以通过HTTP端点或消息队列查询
    // 简化实现，返回空数组
    return []
  }
}

class LoadBalancer {
  constructor(private strategy: LoadBalancingStrategy) {}

  async selectInstance(service: ServiceDefinition): Promise<ServiceInstance> {
    // 简化的负载均衡实现
    return {
      protocol: service.protocol || 'http',
      host: service.host,
      port: service.port,
      weight: 1
    }
  }
}

class CircuitBreakerManager {
  private breakers: Map<string, CircuitBreaker> = new Map()

  async registerService(serviceId: string): Promise<void> {
    this.breakers.set(serviceId, {
      serviceId,
      state: 'closed',
      failureCount: 0,
      successCount: 0,
      lastFailureTime: null,
      timeout: 60000,
      threshold: 5
    })
  }

  async unregisterService(serviceId: string): Promise<void> {
    this.breakers.delete(serviceId)
  }

  async getState(serviceId: string): Promise<CircuitBreaker> {
    return this.breakers.get(serviceId) || {
      serviceId,
      state: 'closed',
      failureCount: 0,
      successCount: 0,
      lastFailureTime: null
    }
  }

  async recordSuccess(serviceId: string): Promise<void> {
    const breaker = this.breakers.get(serviceId)
    if (breaker) {
      breaker.successCount++
      breaker.failureCount = Math.max(0, breaker.failureCount - 1)
      if (breaker.state === 'half_open') {
        breaker.state = 'closed'
      }
    }
  }

  async recordFailure(serviceId: string): Promise<void> {
    const breaker = this.breakers.get(serviceId)
    if (breaker) {
      breaker.failureCount++
      breaker.lastFailureTime = new Date()
      if (breaker.failureCount >= breaker.threshold) {
        breaker.state = 'open'
      }
    }
  }
}

class RateLimiter {
  private limits: Map<string, RateLimit> = new Map()

  async registerService(serviceId: string, rateLimit?: RateLimit): Promise<void> {
    if (rateLimit) {
      this.limits.set(serviceId, rateLimit)
    }
  }

  async checkLimit(identifier: string, serviceId?: string): Promise<{
    allowed: boolean
    retryAfter?: number
  }> {
    // 简化的速率限制实现
    return { allowed: true }
  }
}

class Authenticator {
  constructor(private config: AuthenticationConfig) {}

  async authenticate(request: Request, metadata: RequestMetadata): Promise<void> {
    // 简化的认证实现
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      throw new Error('Missing authorization header')
    }
  }
}

class Metrics {
  private requestCount = 0
  private responseCount = 0
  private errorCount = 0
  private responseTimeSum = 0

  recordRequest(metadata: RequestMetadata): void {
    this.requestCount++
  }

  recordResponse(metadata: ResponseMetadata): void {
    this.responseCount++
    this.responseTimeSum += metadata.duration
    if (metadata.statusCode >= 400) {
      this.errorCount++
    }
  }

  getSummary() {
    return {
      requests: this.requestCount,
      responses: this.responseCount,
      errors: this.errorCount,
      averageResponseTime: this.responseCount > 0 ? this.responseTimeSum / this.responseCount : 0
    }
  }
}