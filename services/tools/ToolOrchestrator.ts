/**
 * @file ToolOrchestrator.ts
 * @description YYC³ AI小语智能成长守护系统工具编排器，管理复杂的多工具工作流程和任务执行
 * @author YYC³团队 <admin@0379.email>
 * @version 1.0.0
 */

import { EventEmitter } from 'events'
import { ToolRegistry } from './ToolRegistry'
import { ToolStatus } from '../../types/tools/common'
import type {
  ToolOrchestrationRequest,
  ToolOrchestrationPlan,
  OrchestrationStep,
  OrchestrationExecutionStatus,
  ToolExecutionRequest,
  ToolExecutionResult
} from '../../types/tools/common'

/**
 * 工具编排器
 * 负责执行复杂的多工具工作流程
 */
export class ToolOrchestrator extends EventEmitter {
  private toolRegistry: ToolRegistry
  private activeExecutions: Map<string, OrchestrationExecutionStatus> = new Map()
  private executionQueue: Array<{
    planId: string
    priority: number
    queuedAt: Date
  }> = []
  private maxConcurrentExecutions: number
  private isRunning = false

  constructor(toolRegistry: ToolRegistry, maxConcurrentExecutions = 5) {
    super()
    this.toolRegistry = toolRegistry
    this.maxConcurrentExecutions = maxConcurrentExecutions
    this.start()
  }

  /**
   * 执行编排计划
   */
  async executePlan(plan: ToolOrchestrationPlan, userId: string, _sessionId?: string): Promise<string> {
    try {
      // 验证计划
      await this.validatePlan(plan)

      // 创建执行状态
      const executionStatus: OrchestrationExecutionStatus = {
        planId: plan.id,
        completedSteps: [],
        failedSteps: [],
        startTime: new Date(),
        progress: 0,
        results: new Map(),
        errors: []
      }

      this.activeExecutions.set(plan.id, executionStatus)

      // 添加到执行队列
      this.executionQueue.push({
        planId: plan.id,
        priority: this.calculatePriority(plan),
        queuedAt: new Date()
      })

      // 按优先级排序队列
      this.executionQueue.sort((a, b) => b.priority - a.priority)

      this.emit('executionQueued', { planId: plan.id, userId })

      // 触发执行处理
      this.processExecutionQueue()

      return plan.id

    } catch (error) {
      this.emit('executionError', {
        planId: plan.id,
        error: error instanceof Error ? error.message : String(error)
      })
      throw error
    }
  }

  /**
   * 获取执行状态
   */
  getExecutionStatus(planId: string): OrchestrationExecutionStatus | undefined {
    return this.activeExecutions.get(planId)
  }

  /**
   * 取消执行
   */
  async cancelExecution(planId: string, reason = '用户取消'): Promise<boolean> {
    const execution = this.activeExecutions.get(planId)
    if (!execution) {
      return false
    }

    // 从队列中移除
    this.executionQueue = this.executionQueue.filter(item => item.planId !== planId)

    // 标记为取消
    execution.endTime = new Date()
    this.emit('executionCancelled', { planId, reason })

    // 清理资源
    this.activeExecutions.delete(planId)
    return true
  }

  /**
   * 重试失败的执行
   */
  async retryExecution(planId: string, retryFailedSteps = true): Promise<string> {
    const execution = this.activeExecutions.get(planId)
    if (!execution) {
      throw new Error(`执行 ${planId} 不存在`)
    }

    // 重新排队执行
    if (retryFailedSteps) {
      execution.failedSteps = []
      execution.errors = []
    }

    this.executionQueue.push({
      planId,
      priority: this.calculatePriority({ id: planId, goal: '', steps: [], estimatedDuration: 0, requiredTools: [], dependencies: [], created_at: new Date(), status: 'pending' }),
      queuedAt: new Date()
    })

    this.emit('executionRetried', { planId })
    this.processExecutionQueue()

    return planId
  }

  /**
   * 获取执行队列状态
   */
  getQueueStatus() {
    return {
      queueLength: this.executionQueue.length,
      activeExecutions: this.activeExecutions.size,
      maxConcurrentExecutions: this.maxConcurrentExecutions,
      queuedExecutions: this.executionQueue.map(item => ({
        planId: item.planId,
        priority: item.priority,
        queuedAt: item.queuedAt
      }))
    }
  }

  /**
   * 清理完成的执行
   */
  cleanupCompletedExecutions(olderThanHours = 24): void {
    const cutoffTime = new Date()
    cutoffTime.setHours(cutoffTime.getHours() - olderThanHours)

    for (const [planId, execution] of this.activeExecutions) {
      if (execution.endTime && execution.endTime < cutoffTime) {
        this.activeExecutions.delete(planId)
        this.emit('executionCleanedUp', { planId })
      }
    }
  }

  /**
   * 启动编排器
   */
  start(): void {
    if (this.isRunning) return

    this.isRunning = true
    console.log('🚀 工具编排器已启动')

    // 启动队列处理循环
    setInterval(() => {
      this.processExecutionQueue()
    }, 1000)

    // 启动清理任务
    setInterval(() => {
      this.cleanupCompletedExecutions()
    }, 60000) // 每分钟清理一次
  }

  /**
   * 停止编排器
   */
  async stop(): Promise<void> {
    if (!this.isRunning) return

    this.isRunning = false

    // 等待所有活动执行完成或超时
    const timeout = 30000 // 30秒
    const startTime = Date.now()

    while (this.activeExecutions.size > 0 && Date.now() - startTime < timeout) {
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    // 强制取消剩余执行
    for (const planId of this.activeExecutions.keys()) {
      await this.cancelExecution(planId, '系统关闭')
    }

    console.log('🛑 工具编排器已停止')
  }

  // 私有方法实现
  private async validatePlan(plan: ToolOrchestrationPlan): Promise<void> {
    if (!plan.steps || plan.steps.length === 0) {
      throw new Error('执行计划必须包含至少一个步骤')
    }

    // 检查所有必需的工具是否可用
    for (const step of plan.steps) {
      const toolStatus = this.toolRegistry.getToolStatus(step.toolName)
      if (toolStatus !== ToolStatus.READY) {
        throw new Error(`工具 "${step.toolName}" 不可用，状态: ${toolStatus}`)
      }
    }

    // 检查循环依赖
    if (this.hasCircularDependencies(plan.steps)) {
      throw new Error('执行计划包含循环依赖')
    }
  }

  private calculatePriority(plan: ToolOrchestrationPlan): number {
    // 基础优先级
    let priority = 50

    // 根据步骤数量调整
    priority += Math.min(plan.steps.length * 5, 50)

    // 根据预计执行时间调整（越短越优先）
    priority += Math.max(100 - plan.estimatedDuration / 10000, -50)

    // 根据工具状态调整
    const readyTools = plan.requiredTools.filter((tool: string) =>
      this.toolRegistry.getToolStatus(tool) === ToolStatus.READY
    )
    priority += (readyTools.length / plan.requiredTools.length) * 30

    return Math.round(priority)
  }

  private async processExecutionQueue(): Promise<void> {
    if (!this.isRunning) return

    // 检查并发执行限制
    const activeCount = Array.from(this.activeExecutions.values())
      .filter(exec => !exec.endTime).length

    if (activeCount >= this.maxConcurrentExecutions) {
      return
    }

    // 从队列中取出下一个执行任务
    const nextExecution = this.executionQueue.shift()
    if (!nextExecution) return

    const execution = this.activeExecutions.get(nextExecution.planId)
    if (!execution || execution.endTime) return

    try {
      await this.executePlanSteps(nextExecution.planId, execution)
    } catch (error) {
      this.emit('executionError', {
        planId: nextExecution.planId,
        error: error instanceof Error ? error.message : String(error)
      })
    }
  }

  private async executePlanSteps(
    planId: string,
    execution: OrchestrationExecutionStatus
  ): Promise<void> {
    // 获取执行计划（这里简化处理，实际应该从某个地方获取）
    const steps: OrchestrationStep[] = [] // 这里应该从存储中获取计划

    for (const step of steps) {
      // 检查依赖是否满足
      if (!this.areDependenciesSatisfied(step, execution)) {
        continue
      }

      try {
        this.emit('stepStarted', { planId, stepId: step.id })

        // 执行工具
        const result = await this.executeStep(step, execution.userId)

        // 记录结果
        execution.results.set(step.id, result)
        execution.completedSteps.push(step.id)

        // 更新进度
        execution.progress = execution.completedSteps.length / steps.length * 100

        this.emit('stepCompleted', { planId, stepId: step.id, result })

      } catch (error) {
        execution.failedSteps.push(step.id)
        execution.errors.push({
          step: step.id,
          error: error instanceof Error ? error.message : String(error),
          timestamp: new Date()
        })

        this.emit('stepFailed', {
          planId,
          stepId: step.id,
          error: error instanceof Error ? error.message : String(error)
        })

        // 检查是否应该停止执行
        if (step.retryPolicy?.maxRetries === 0) {
          break
        }
      }
    }

    // 标记执行完成
    execution.endTime = new Date()
    this.emit('executionCompleted', { planId, execution })
  }

  private areDependenciesSatisfied(
    step: OrchestrationStep,
    execution: OrchestrationExecutionStatus
  ): boolean {
    return step.dependencies.every((dep: string) =>
      execution.completedSteps.includes(dep) ||
      execution.results.has(dep)
    )
  }

  private async executeStep(
    step: OrchestrationStep,
    userId: string
  ): Promise<ToolExecutionResult> {
    const request: ToolExecutionRequest = {
      toolName: step.toolName,
      parameters: step.parameters,
      userId,
      timeout: step.estimatedDuration
    }

    return await this.toolRegistry.executeTool(request)
  }

  private hasCircularDependencies(steps: OrchestrationStep[]): boolean {
    const visited = new Set<string>()
    const recursionStack = new Set<string>()

    const hasCycle = (stepId: string): boolean => {
      if (recursionStack.has(stepId)) return true
      if (visited.has(stepId)) return false

      visited.add(stepId)
      recursionStack.add(stepId)

      const step = steps.find(s => s.id === stepId)
      if (step) {
        for (const dep of step.dependencies) {
          if (hasCycle(dep)) return true
        }
      }

      recursionStack.delete(stepId)
      return false
    }

    return steps.some(step => hasCycle(step.id))
  }

  /**
   * 获取性能统计
   */
  getPerformanceStats() {
    const allExecutions = Array.from(this.activeExecutions.values())
    const completedExecutions = allExecutions.filter(exec => exec.endTime)
    const activeExecutions = allExecutions.filter(exec => !exec.endTime)

    if (completedExecutions.length === 0) {
      return {
        totalExecutions: allExecutions.length,
        activeExecutions: activeExecutions.length,
        averageExecutionTime: 0,
        successRate: 0,
        queueLength: this.executionQueue.length
      }
    }

    const totalExecutionTime = completedExecutions.reduce((sum, exec) => {
      return sum + (exec.endTime!.getTime() - exec.startTime.getTime())
    }, 0)

    const successfulExecutions = completedExecutions.filter(exec => exec.failedSteps.length === 0)

    return {
      totalExecutions: allExecutions.length,
      activeExecutions: activeExecutions.length,
      averageExecutionTime: totalExecutionTime / completedExecutions.length,
      successRate: successfulExecutions.length / completedExecutions.length,
      queueLength: this.executionQueue.length,
      averageQueueTime: this.calculateAverageQueueTime()
    }
  }

  private calculateAverageQueueTime(): number {
    if (this.executionQueue.length === 0) return 0

    const totalTime = this.executionQueue.reduce((sum, item) => {
      return sum + (Date.now() - item.queuedAt.getTime())
    }, 0)

    return totalTime / this.executionQueue.length
  }
}