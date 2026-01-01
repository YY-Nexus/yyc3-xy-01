/**
 * @file ToolRegistry.ts
 * @description YYC³ AI小语智能成长守护系统工具注册系统，实现动态工具发现、注册和编排功能
 * @author YYC³团队 <admin@0379.email>
 * @version 1.0.0
 */

import { EventEmitter } from 'events'
import { ToolStatus } from '../../types/tools/common'
import type {
  ToolDefinition,
  ToolCapability,
  ToolContext,
  ToolMetrics,
  ToolRegistryConfig,
  ToolExecutionRequest,
  ToolExecutionResult,
  ToolOrchestrationRequest,
  ToolOrchestrationPlan,
  OrchestrationStep
} from '../../types/tools/common'

/**
 * 工具注册表
 * 管理系统中所有可用工具的核心组件
 */
export class ToolRegistry extends EventEmitter {
  private tools: Map<string, ToolDefinition> = new Map()
  private capabilities: Map<string, Set<string>> = new Map()
  private categories: Map<string, Set<string>> = new Map()
  private metrics: Map<string, ToolMetrics> = new Map()
  private dependencies: Map<string, Set<string>> = new Map()
  private config: ToolRegistryConfig

  constructor(config: ToolRegistryConfig = {}) {
    super()
    this.config = {
      maxConcurrentExecutions: 10,
      healthCheckInterval: 30000,
      metricsRetentionDays: 30,
      enableSemanticSearch: true,
      enableAutoOptimization: true,
      enableDependencyResolution: true,
      ...config
    }

    this.initializeHealthCheck()
  }

  /**
   * 注册新工具
   */
  async registerTool(toolDefinition: ToolDefinition): Promise<boolean> {
    try {
      // 验证工具定义
      const validation = await this.validateToolDefinition(toolDefinition)
      if (!validation.isValid) {
        throw new Error(`工具验证失败: ${validation.errors.join(', ')}`)
      }

      // 检查工具名称唯一性
      if (this.tools.has(toolDefinition.name)) {
        throw new Error(`工具名称 "${toolDefinition.name}" 已存在`)
      }

      // 初始化工具状态
      toolDefinition.status = ToolStatus.REGISTERED
      toolDefinition.registeredAt = new Date()
      toolDefinition.version = toolDefinition.version || '1.0.0'
      toolDefinition.updatedAt = new Date()

      // 存储工具定义
      this.tools.set(toolDefinition.name, toolDefinition)

      // 建立能力索引
      if (toolDefinition.capabilities) {
        const capabilityNames = toolDefinition.capabilities.map((cap: ToolCapability) => cap.name)
        const capabilitySet = new Set<string>(capabilityNames)
        this.capabilities.set(toolDefinition.name, capabilitySet)
      }

      // 建立分类索引
      if (toolDefinition.category) {
        if (!this.categories.has(toolDefinition.category)) {
          this.categories.set(toolDefinition.category, new Set())
        }
        this.categories.get(toolDefinition.category)!.add(toolDefinition.name)
      }

      // 建立依赖关系
      if (toolDefinition.dependencies) {
        this.dependencies.set(toolDefinition.name, new Set(toolDefinition.dependencies))
      }

      // 初始化工具指标
      this.metrics.set(toolDefinition.name, {
        executionCount: 0,
        successCount: 0,
        errorCount: 0,
        averageExecutionTime: 0,
        lastExecutedAt: undefined,
        lastStatus: ToolStatus.REGISTERED,
        qualityScore: 1.0
      })

      // 初始化工具
      await this.initializeTool(toolDefinition)

      this.emit('toolRegistered', { tool: toolDefinition })
      console.log(`✅ 工具 "${toolDefinition.name}" 注册成功`)
      return true

    } catch (error) {
      this.emit('toolRegistrationError', {
        tool: toolDefinition,
        error: error instanceof Error ? error.message : String(error)
      })
      return false
    }
  }

  /**
   * 注销工具
   */
  async unregisterTool(toolName: string): Promise<boolean> {
    try {
      const tool = this.tools.get(toolName)
      if (!tool) {
        throw new Error(`工具 "${toolName}" 不存在`)
      }

      // 停止工具
      await this.stopTool(tool)

      // 清理索引
      this.tools.delete(toolName)
      this.capabilities.delete(toolName)
      this.metrics.delete(toolName)
      this.dependencies.delete(toolName)

      // 从分类中移除
      if (tool.category && this.categories.has(tool.category)) {
        this.categories.get(tool.category)!.delete(toolName)
      }

      this.emit('toolUnregistered', { toolName })
      console.log(`✅ 工具 "${toolName}" 注销成功`)
      return true

    } catch (error) {
      this.emit('toolUnregistrationError', {
        toolName,
        error: error instanceof Error ? error.message : String(error)
      })
      return false
    }
  }

  /**
   * 搜索工具
   */
  async searchTools(query: {
    text?: string
    capabilities?: string[]
    category?: string
    tags?: string[]
    semantic?: boolean
  }): Promise<ToolDefinition[]> {
    const results: ToolDefinition[] = []

    for (const tool of this.tools.values()) {
      let matches = true

      // 文本搜索
      if (query.text) {
        const searchText = query.text.toLowerCase()
        const toolText = `${tool.name} ${tool.description}`.toLowerCase()
        matches = matches && toolText.includes(searchText)
      }

      // 能力搜索
      if (query.capabilities && query.capabilities.length > 0) {
        const toolCapabilities = this.capabilities.get(tool.name) || new Set()
        matches = matches && query.capabilities.some(cap => toolCapabilities.has(cap))
      }

      // 分类搜索
      if (query.category) {
        matches = matches && tool.category === query.category
      }

      // 标签搜索
      if (query.tags && query.tags.length > 0) {
        matches = matches && query.tags.some(tag =>
          tool.tags?.includes(tag)
        )
      }

      if (matches) {
        results.push(tool)
      }
    }

    // 语义搜索
    if (query.semantic && this.config.enableSemanticSearch) {
      const semanticResults = await this.performSemanticSearch(query.text || '')
      return this.mergeSearchResults(results, semanticResults)
    }

    return results.sort((a, b) => {
      // 按质量和使用频率排序
      const metricA = this.metrics.get(a.name)
      const metricB = this.metrics.get(b.name)

      const scoreA = (metricA?.qualityScore || 0) * (metricA?.executionCount || 0)
      const scoreB = (metricB?.qualityScore || 0) * (metricB?.executionCount || 0)

      return scoreB - scoreA
    })
  }

  /**
   * 执行工具
   */
  async executeTool(request: ToolExecutionRequest): Promise<ToolExecutionResult> {
    const tool = this.tools.get(request.toolName)
    if (!tool) {
      throw new Error(`工具 "${request.toolName}" 不存在`)
    }

    if (tool.status !== ToolStatus.READY) {
      throw new Error(`工具 "${request.toolName}" 状态不可用: ${tool.status}`)
    }

    const startTime = Date.now()
    const metrics = this.metrics.get(request.toolName)!
    metrics.executionCount++

    try {
      // 准备执行上下文
      const context: ToolContext = {
        toolName: request.toolName,
        executionId: this.generateExecutionId(),
        parameters: request.parameters,
        userId: request.userId,
        sessionId: request.sessionId,
        metadata: {
          ...request.metadata,
          startedAt: new Date(),
          timeout: request.timeout || tool.timeout || 30000
        }
      }

      this.emit('toolExecutionStarted', { tool: tool.name, context })

      // 执行工具
      const result = await this.performToolExecution(tool, context)

      // 更新指标
      const executionTime = Date.now() - startTime
      metrics.successCount++
      metrics.lastExecutedAt = new Date()
      metrics.lastStatus = ToolStatus.READY
      metrics.averageExecutionTime =
        (metrics.averageExecutionTime * (metrics.executionCount - 1) + executionTime) / metrics.executionCount

      // 计算质量分数
      metrics.qualityScore = await this.calculateQualityScore(tool.name)

      this.emit('toolExecutionCompleted', {
        tool: tool.name,
        context,
        result,
        executionTime
      })

      return {
        success: true,
        data: result,
        metadata: {
          executionTime,
          toolVersion: tool.version,
          executedAt: new Date()
        }
      }

    } catch (error) {
      metrics.errorCount++
      metrics.lastStatus = ToolStatus.ERROR

      this.emit('toolExecutionError', {
        tool: tool.name,
        error: error instanceof Error ? error.message : String(error)
      })

      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        metadata: {
          executionTime: Date.now() - startTime,
          toolVersion: tool.version,
          executedAt: new Date()
        }
      }
    }
  }

  /**
   * 工具编排
   */
  async orchestrateTools(request: ToolOrchestrationRequest): Promise<ToolOrchestrationPlan> {
    const plan: ToolOrchestrationPlan = {
      id: this.generatePlanId(),
      goal: request.goal,
      steps: [],
      estimatedDuration: 0,
      requiredTools: [],
      dependencies: [],
      created_at: new Date(),
      status: 'pending'
    }

    try {
      // 分析目标并搜索相关工具
      const relevantTools = await this.searchTools({
        text: request.goal,
        capabilities: request.requiredCapabilities,
        semantic: true
      })

      // 过滤可用工具
      const availableTools = relevantTools.filter(tool =>
        tool.status === ToolStatus.READY &&
        (!request.preferredTools || request.preferredTools.includes(tool.name))
      )

      // 生成执行计划
      plan.steps = await this.generateExecutionSteps(request.goal, availableTools)
      plan.requiredTools = plan.steps.map((step: OrchestrationStep) => step.toolName)
      plan.dependencies = await this.resolveDependencies(plan.requiredTools)
      plan.estimatedDuration = this.estimateExecutionDuration(plan.steps)

      // 验证计划可行性
      const validation = await this.validateExecutionPlan(plan)
      if (!validation.isValid) {
        throw new Error(`执行计划不可行: ${validation.errors.join(', ')}`)
      }

      this.emit('orchestrationPlanCreated', { plan })
      return plan

    } catch (error) {
      this.emit('orchestrationError', {
        request,
        error: error instanceof Error ? error.message : String(error)
      })
      throw error
    }
  }

  /**
   * 获取工具状态
   */
  getToolStatus(toolName: string): ToolStatus | undefined {
    return this.tools.get(toolName)?.status
  }

  /**
   * 获取所有工具列表
   */
  getAllTools(): ToolDefinition[] {
    return Array.from(this.tools.values())
  }

  /**
   * 获取工具分类
   */
  getToolCategories(): string[] {
    return Array.from(this.categories.keys())
  }

  /**
   * 获取所有能力
   */
  getAllCapabilities(): string[] {
    const allCapabilities = new Set<string>()
    for (const capabilities of this.capabilities.values()) {
      for (const capability of capabilities) {
        allCapabilities.add(capability)
      }
    }
    return Array.from(allCapabilities)
  }

  /**
   * 获取工具指标
   */
  getToolMetrics(toolName: string): ToolMetrics | undefined {
    return this.metrics.get(toolName)
  }

  /**
   * 执行健康检查
   */
  async performHealthCheck(): Promise<void> {
    for (const [toolName, tool] of this.tools) {
      try {
        if (tool.status === ToolStatus.READY || tool.status === ToolStatus.ERROR) {
          // 执行健康检查
          const isHealthy = await this.checkToolHealth(tool)
          const newStatus = isHealthy ? ToolStatus.READY : ToolStatus.ERROR

          if (tool.status !== newStatus) {
            tool.status = newStatus
            tool.updatedAt = new Date()
            this.emit('toolStatusChanged', { toolName, status: newStatus })
          }
        }
      } catch (error) {
        tool.status = ToolStatus.ERROR
        tool.updatedAt = new Date()
        this.emit('toolHealthCheckError', { toolName, error })
      }
    }
  }

  // 私有方法实现
  private async validateToolDefinition(tool: ToolDefinition): Promise<{
    isValid: boolean
    errors: string[]
  }> {
    const errors: string[] = []

    if (!tool.name || tool.name.trim() === '') {
      errors.push('工具名称不能为空')
    }

    if (!tool.description) {
      errors.push('工具描述不能为空')
    }

    if (!tool.entryPoint) {
      errors.push('工具入口点不能为空')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  private async initializeTool(tool: ToolDefinition): Promise<void> {
    try {
      // 这里可以实现工具的具体初始化逻辑
      // 例如加载模块、验证依赖等
      tool.status = ToolStatus.READY
    } catch (error) {
      tool.status = ToolStatus.ERROR
      throw error
    }
  }

  private async stopTool(tool: ToolDefinition): Promise<void> {
    try {
      // 工具停止逻辑
      tool.status = ToolStatus.STOPPED
    } catch (error) {
      tool.status = ToolStatus.ERROR
      throw error
    }
  }

  private async performSemanticSearch(_query: string): Promise<ToolDefinition[]> {
    // 简化的语义搜索实现
    // 在实际应用中，这里会使用向量数据库或嵌入模型
    return []
  }

  private mergeSearchResults(
    directResults: ToolDefinition[],
    semanticResults: ToolDefinition[]
  ): ToolDefinition[] {
    const merged = new Map<string, ToolDefinition>()

    directResults.forEach(tool => merged.set(tool.name, tool))
    semanticResults.forEach(tool => {
      if (!merged.has(tool.name)) {
        merged.set(tool.name, tool)
      }
    })

    return Array.from(merged.values())
  }

  private async performToolExecution(
    tool: ToolDefinition,
    context: ToolContext
  ): Promise<ToolExecutionResult> {
    // 这里是工具执行的核心逻辑
    // 在实际应用中，这里会调用具体的工具实现

    // 简单的模拟实现
    await new Promise(resolve => setTimeout(resolve, 1000))

    return {
      success: true,
      data: {
        message: `工具 "${tool.name}" 执行完成`,
        parameters: context.parameters,
        timestamp: new Date()
      },
      metadata: {
        executionTime: 1000,
        toolVersion: tool.version,
        executedAt: new Date()
      }
    }
  }

  private async calculateQualityScore(toolName: string): Promise<number> {
    const metrics = this.metrics.get(toolName)
    if (!metrics || metrics.executionCount === 0) return 1.0

    const successRate = metrics.successCount / metrics.executionCount
    const avgTimeFactor = Math.max(0, 1 - (metrics.averageExecutionTime / 60000)) // 1分钟为基准

    return (successRate * 0.7 + avgTimeFactor * 0.3)
  }

  private async generateExecutionSteps(
    _goal: string,
    tools: ToolDefinition[]
  ): Promise<OrchestrationStep[]> {
    // 简化的步骤生成逻辑
    return tools.slice(0, 5).map((tool, index) => ({
      id: `step-${index + 1}`,
      toolName: tool.name,
      description: `使用 ${tool.name} 处理`,
      estimatedDuration: tool.timeout || 30000,
      dependencies: []
    }))
  }

  private async resolveDependencies(toolNames: string[]): Promise<string[]> {
    const allDependencies = new Set<string>()

    for (const toolName of toolNames) {
      const deps = this.dependencies.get(toolName)
      if (deps) {
        deps.forEach(dep => allDependencies.add(dep))
      }
    }

    return Array.from(allDependencies)
  }

  private estimateExecutionDuration(steps: OrchestrationStep[]): number {
    return steps.reduce((total, step) => total + step.estimatedDuration, 0)
  }

  private async validateExecutionPlan(plan: ToolOrchestrationPlan): Promise<{
    isValid: boolean
    errors: string[]
  }> {
    const errors: string[] = []

    // 检查工具可用性
    for (const toolName of plan.requiredTools) {
      const tool = this.tools.get(toolName)
      if (!tool) {
        errors.push(`工具 "${toolName}" 不存在`)
      } else if (tool.status !== ToolStatus.READY) {
        errors.push(`工具 "${toolName}" 状态不可用: ${tool.status}`)
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  private async checkToolHealth(_tool: ToolDefinition): Promise<boolean> {
    try {
      // 简化的健康检查
      // 在实际应用中，这里会执行具体的健康检查逻辑
      return true
    } catch {
      return false
    }
  }

  private generateExecutionId(): string {
    return `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private generatePlanId(): string {
    return `plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private initializeHealthCheck(): void {
    if (this.config && this.config.healthCheckInterval > 0) {
      setInterval(() => {
        this.performHealthCheck().catch(error => {
          console.error('健康检查失败:', error)
        })
      }, this.config.healthCheckInterval)
    }
  }

  /**
   * 获取系统统计信息
   */
  getStatistics() {
    const tools = Array.from(this.tools.values())
    const metrics = Array.from(this.metrics.values())

    return {
      totalTools: tools.length,
      readyTools: tools.filter(t => t.status === ToolStatus.READY).length,
      errorTools: tools.filter(t => t.status === ToolStatus.ERROR).length,
      totalExecutions: metrics.reduce((sum, m) => sum + m.executionCount, 0),
      totalErrors: metrics.reduce((sum, m) => sum + m.errorCount, 0),
      averageQualityScore: metrics.reduce((sum, m) => sum + m.qualityScore, 0) / metrics.length || 0,
      categories: this.categories.size,
      capabilities: this.getAllCapabilities().length
    }
  }

  /**
   * 清理过期的指标数据
   */
  async cleanupExpiredMetrics(): Promise<void> {
    const cutoffDate = new Date()
    if (this.config && this.config.metricsRetentionDays) {
      cutoffDate.setDate(cutoffDate.getDate() - this.config.metricsRetentionDays)
    }

    // 实现指标清理逻辑
    this.emit('metricsCleanedUp', { cutoffDate })
  }
}