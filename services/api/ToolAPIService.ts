/**
 * @file ToolAPIService.ts
 * @description YYC³ AI小语智能成长守护系统工具API服务，提供工具管理相关的HTTP API接口
 * @author YYC³团队 <admin@0379.email>
 * @version 1.0.0
 */

import { ToolManager } from '../tools/ToolManager'
import type {
  ToolDefinition,
  ToolExecutionRequest,
  ToolOrchestrationRequest,
  ToolRegistryConfig
} from '../../types/tools/common'
import type { APIRouteRegistry } from '@/types/api/common'

/**
 * 工具API服务
 * 处理工具管理相关的HTTP请求
 */
export class ToolAPIService {
  private toolManager: ToolManager

  constructor(config: ToolRegistryConfig = {}) {
    this.toolManager = new ToolManager(config)
  }

  /**
   * 初始化API服务
   */
  async initialize(): Promise<void> {
    await this.toolManager.initialize()
  }

  /**
   * 注册API路由
   */
  registerRoutes(): APIRouteRegistry {
    return {
      // 工具注册相关
      '/api/tools': {
        GET: this.handleGetTools.bind(this),
        POST: this.handleRegisterTool.bind(this)
      },

      '/api/tools/categories': {
        GET: this.handleGetCategories.bind(this)
      },

      '/api/tools/capabilities': {
        GET: this.handleGetCapabilities.bind(this)
      },

      '/api/tools/search': {
        POST: this.handleSearchTools.bind(this)
      },

      // 单个工具操作
      '/api/tools/:toolName': {
        GET: this.handleGetTool.bind(this),
        PUT: this.handleUpdateTool.bind(this),
        DELETE: this.handleUnregisterTool.bind(this)
      },

      '/api/tools/:toolName/execute': {
        POST: this.handleExecuteTool.bind(this)
      },

      '/api/tools/:toolName/status': {
        GET: this.handleGetToolStatus.bind(this)
      },

      '/api/tools/:toolName/metrics': {
        GET: this.handleGetToolMetrics.bind(this)
      },

      // 工具编排相关
      '/api/tools/orchestrate': {
        POST: this.handleOrchestrateTools.bind(this)
      },

      '/api/tools/orchestrate/:planId': {
        GET: this.handleGetOrchestrationStatus.bind(this),
        DELETE: this.handleCancelOrchestration.bind(this),
        POST: this.handleRetryOrchestration.bind(this)
      },

      '/api/tools/orchestrate/:planId/recommend': {
        POST: this.handleRecommendTools.bind(this)
      },

      // 系统相关
      '/api/tools/health': {
        GET: this.handleHealthCheck.bind(this)
      },

      '/api/tools/statistics': {
        GET: this.handleGetStatistics.bind(this)
      },

      '/api/tools/batch': {
        POST: this.handleBatchOperations.bind(this)
      }
    }
  }

  // 路由处理器实现
  private async handleGetTools(request: Request): Promise<Response> {
    try {
      const url = new URL(request.url)
      const category = url.searchParams.get('category')
      const status = url.searchParams.get('status')

      let tools = this.toolManager.getTools()

      // 应用过滤器
      if (category) {
        tools = tools.filter(tool => tool.category === category)
      }
      if (status) {
        tools = tools.filter(tool => tool.status === status)
      }

      return Response.json({
        success: true,
        data: tools,
        total: tools.length
      })

    } catch (error) {
      return Response.json({
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      }, { status: 500 })
    }
  }

  private async handleRegisterTool(request: Request): Promise<Response> {
    try {
      const toolDefinition = await request.json() as ToolDefinition

      // 验证必需字段
      if (!toolDefinition.name || !toolDefinition.description) {
        return Response.json({
          success: false,
          error: '工具名称和描述不能为空'
        }, { status: 400 })
      }

      const result = await this.toolManager.registerTool(toolDefinition)

      return Response.json({
        success: result,
        message: result ? '工具注册成功' : '工具注册失败'
      }, { status: result ? 201 : 400 })

    } catch (error) {
      return Response.json({
        success: false,
        error: error instanceof Error ? error.message : '注册工具时发生错误'
      }, { status: 400 })
    }
  }

  private async handleGetCategories(_request: Request): Promise<Response> {
    try {
      const categories = this.toolManager.getToolCategories()

      return Response.json({
        success: true,
        data: categories
      })

    } catch (error) {
      return Response.json({
        success: false,
        error: error instanceof Error ? error.message : '获取分类失败'
      }, { status: 500 })
    }
  }

  private async handleGetCapabilities(_request: Request): Promise<Response> {
    try {
      const capabilities = this.toolManager.getAllCapabilities()

      return Response.json({
        success: true,
        data: capabilities
      })

    } catch (error) {
      return Response.json({
        success: false,
        error: error instanceof Error ? error.message : '获取能力列表失败'
      }, { status: 500 })
    }
  }

  private async handleSearchTools(request: Request): Promise<Response> {
    try {
      const query = await request.json()

      const tools = await this.toolManager.searchTools(query)

      return Response.json({
        success: true,
        data: tools,
        total: tools.length
      })

    } catch (error) {
      return Response.json({
        success: false,
        error: error instanceof Error ? error.message : '搜索工具失败'
      }, { status: 400 })
    }
  }

  private async handleGetTool(request: Request): Promise<Response> {
    try {
      const url = new URL(request.url)
      const toolName = url.pathname.split('/').pop()

      if (!toolName) {
        return Response.json({
          success: false,
          error: '工具名称不能为空'
        }, { status: 400 })
      }

      const tool = this.toolManager.getTool(toolName)

      if (!tool) {
        return Response.json({
          success: false,
          error: '工具不存在'
        }, { status: 404 })
      }

      return Response.json({
        success: true,
        data: tool
      })

    } catch (error) {
      return Response.json({
        success: false,
        error: error instanceof Error ? error.message : '获取工具信息失败'
      }, { status: 500 })
    }
  }

  private async handleUpdateTool(request: Request): Promise<Response> {
    try {
      const url = new URL(request.url)
      const toolName = url.pathname.split('/').pop()
      const updates = await request.json()

      if (!toolName) {
        return Response.json({
          success: false,
          error: '工具名称不能为空'
        }, { status: 400 })
      }

      const result = await this.toolManager.updateTool(toolName, updates)

      return Response.json({
        success: result,
        message: result ? '工具更新成功' : '工具更新失败'
      }, { status: result ? 200 : 400 })

    } catch (error) {
      return Response.json({
        success: false,
        error: error instanceof Error ? error.message : '更新工具失败'
      }, { status: 400 })
    }
  }

  private async handleUnregisterTool(request: Request): Promise<Response> {
    try {
      const url = new URL(request.url)
      const toolName = url.pathname.split('/').pop()

      if (!toolName) {
        return Response.json({
          success: false,
          error: '工具名称不能为空'
        }, { status: 400 })
      }

      const result = await this.toolManager.unregisterTool(toolName)

      return Response.json({
        success: result,
        message: result ? '工具注销成功' : '工具注销失败'
      }, { status: result ? 200 : 400 })

    } catch (error) {
      return Response.json({
        success: false,
        error: error instanceof Error ? error.message : '注销工具失败'
      }, { status: 400 })
    }
  }

  private async handleExecuteTool(request: Request): Promise<Response> {
    try {
      const url = new URL(request.url)
      const toolName = url.pathname.split('/')[3] // 获取 :toolName
      const executionRequest = await request.json() as ToolExecutionRequest

      if (!toolName) {
        return Response.json({
          success: false,
          error: '工具名称不能为空'
        }, { status: 400 })
      }

      // 设置工具名称
      executionRequest.toolName = toolName

      const result = await this.toolManager.executeTool(executionRequest)

      return Response.json({
        success: result.success,
        data: result.data,
        error: result.error,
        metadata: result.metadata
      }, { status: result.success ? 200 : 400 })

    } catch (error) {
      return Response.json({
        success: false,
        error: error instanceof Error ? error.message : '执行工具失败'
      }, { status: 500 })
    }
  }

  private async handleGetToolStatus(request: Request): Promise<Response> {
    try {
      const url = new URL(request.url)
      const toolName = url.pathname.split('/')[3]

      if (!toolName) {
        return Response.json({
          success: false,
          error: '工具名称不能为空'
        }, { status: 400 })
      }

      const status = this.toolManager.getToolStatus(toolName)

      if (!status) {
        return Response.json({
          success: false,
          error: '工具不存在'
        }, { status: 404 })
      }

      return Response.json({
        success: true,
        data: { status }
      })

    } catch (error) {
      return Response.json({
        success: false,
        error: error instanceof Error ? error.message : '获取工具状态失败'
      }, { status: 500 })
    }
  }

  private async handleGetToolMetrics(request: Request): Promise<Response> {
    try {
      const url = new URL(request.url)
      const toolName = url.pathname.split('/')[3]

      if (!toolName) {
        return Response.json({
          success: false,
          error: '工具名称不能为空'
        }, { status: 400 })
      }

      const metrics = this.toolManager.getToolMetrics(toolName)

      if (!metrics) {
        return Response.json({
          success: false,
          error: '工具不存在或无指标数据'
        }, { status: 404 })
      }

      return Response.json({
        success: true,
        data: metrics
      })

    } catch (error) {
      return Response.json({
        success: false,
        error: error instanceof Error ? error.message : '获取工具指标失败'
      }, { status: 500 })
    }
  }

  private async handleOrchestrateTools(request: Request): Promise<Response> {
    try {
      const orchestrationRequest = await request.json() as ToolOrchestrationRequest
      const url = new URL(request.url)
      const userId = url.searchParams.get('userId') || 'anonymous'
      const sessionId = url.searchParams.get('sessionId')

      const planId = await this.toolManager.executeOrchestration(
        orchestrationRequest,
        userId,
        sessionId || undefined
      )

      return Response.json({
        success: true,
        data: { planId },
        message: '编排任务已创建'
      }, { status: 201 })

    } catch (error) {
      return Response.json({
        success: false,
        error: error instanceof Error ? error.message : '创建编排任务失败'
      }, { status: 400 })
    }
  }

  private async handleGetOrchestrationStatus(request: Request): Promise<Response> {
    try {
      const url = new URL(request.url)
      const planId = url.pathname.split('/').pop()

      if (!planId) {
        return Response.json({
          success: false,
          error: '计划ID不能为空'
        }, { status: 400 })
      }

      const status = this.toolManager.getOrchestrationStatus(planId)

      if (!status) {
        return Response.json({
          success: false,
          error: '编排任务不存在'
        }, { status: 404 })
      }

      return Response.json({
        success: true,
        data: status
      })

    } catch (error) {
      return Response.json({
        success: false,
        error: error instanceof Error ? error.message : '获取编排状态失败'
      }, { status: 500 })
    }
  }

  private async handleCancelOrchestration(request: Request): Promise<Response> {
    try {
      const url = new URL(request.url)
      const planId = url.pathname.split('/').pop()
      const reason = await request.json().then(body => body?.reason).catch(() => undefined)

      if (!planId) {
        return Response.json({
          success: false,
          error: '计划ID不能为空'
        }, { status: 400 })
      }

      const result = await this.toolManager.cancelOrchestration(planId, reason)

      return Response.json({
        success: result,
        message: result ? '编排任务已取消' : '取消编排任务失败'
      }, { status: result ? 200 : 400 })

    } catch (error) {
      return Response.json({
        success: false,
        error: error instanceof Error ? error.message : '取消编排任务失败'
      }, { status: 400 })
    }
  }

  private async handleRetryOrchestration(request: Request): Promise<Response> {
    try {
      const url = new URL(request.url)
      const planId = url.pathname.split('/').pop()
      const retryFailedSteps = await request.json()
        .then(body => body?.retryFailedSteps)
        .catch(() => true)

      if (!planId) {
        return Response.json({
          success: false,
          error: '计划ID不能为空'
        }, { status: 400 })
      }

      const result = await this.toolManager.retryOrchestration(planId, retryFailedSteps)

      return Response.json({
        success: true,
        data: { planId: result },
        message: '编排任务已重新排队'
      })

    } catch (error) {
      return Response.json({
        success: false,
        error: error instanceof Error ? error.message : '重试编排任务失败'
      }, { status: 400 })
    }
  }

  private async handleRecommendTools(request: Request): Promise<Response> {
    try {
      const url = new URL(request.url)
      const planId = url.pathname.split('/')[3] // 获取 :planId
      const { goal, context } = await request.json()

      if (!goal) {
        return Response.json({
          success: false,
          error: '目标不能为空'
        }, { status: 400 })
      }

      const recommendations = await this.toolManager.recommendTools(goal, context)

      return Response.json({
        success: true,
        data: recommendations
      })

    } catch (error) {
      return Response.json({
        success: false,
        error: error instanceof Error ? error.message : '生成工具推荐失败'
      }, { status: 400 })
    }
  }

  private async handleHealthCheck(request: Request): Promise<Response> {
    try {
      await this.toolManager.performHealthCheck()

      return Response.json({
        success: true,
        message: '健康检查完成'
      })

    } catch (error) {
      return Response.json({
        success: false,
        error: error instanceof Error ? error.message : '健康检查失败'
      }, { status: 500 })
    }
  }

  private async handleGetStatistics(request: Request): Promise<Response> {
    try {
      const stats = this.toolManager.getSystemStatistics()

      return Response.json({
        success: true,
        data: stats
      })

    } catch (error) {
      return Response.json({
        success: false,
        error: error instanceof Error ? error.message : '获取统计信息失败'
      }, { status: 500 })
    }
  }

  private async handleBatchOperations(request: Request): Promise<Response> {
    try {
      const batchRequest = await request.json()
      const { operation, tools } = batchRequest

      let result

      switch (operation) {
        case 'register':
          result = await this.toolManager.registerTools(tools)
          break

        case 'unregister':
          const unregisterResults = []
          for (const toolName of tools) {
            try {
              const success = await this.toolManager.unregisterTool(toolName)
              unregisterResults.push({ toolName, success })
            } catch (error) {
              unregisterResults.push({
                toolName,
                success: false,
                error: error instanceof Error ? error.message : String(error)
              })
            }
          }
          result = { results: unregisterResults }
          break

        default:
          return Response.json({
            success: false,
            error: '不支持的批量操作'
          }, { status: 400 })
      }

      return Response.json({
        success: true,
        data: result
      })

    } catch (error) {
      return Response.json({
        success: false,
        error: error instanceof Error ? error.message : '批量操作失败'
      }, { status: 400 })
    }
  }

  /**
   * 关闭API服务
   */
  async shutdown(): Promise<void> {
    await this.toolManager.shutdown()
  }
}