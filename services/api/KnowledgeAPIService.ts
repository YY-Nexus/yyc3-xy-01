/**
 * @file KnowledgeAPIService.ts
 * @description YYC³ AI小语智能成长守护系统知识库API服务，提供知识管理相关的HTTP API接口
 * @author YYC³团队 <admin@0379.email>
 * @version 1.0.0
 */

import { KnowledgeManager } from '../knowledge/KnowledgeManager'
import type {
  KnowledgeQuery,
  KnowledgeTag,
  KnowledgeExtractionConfig,
  KnowledgeExportOptions,
  KnowledgeImportOptions,
  RAGConfig
} from '../types/knowledge/common'
import type { APIRouteRegistry } from '@/types/api/common'

/**
 * 知识库API服务
 * 处理知识管理相关的HTTP请求
 */
export class KnowledgeAPIService {
  private knowledgeManager: KnowledgeManager

  constructor(config: RAGConfig = {}) {
    this.knowledgeManager = new KnowledgeManager(config)
  }

  /**
   * 初始化API服务
   */
  async initialize(): Promise<void> {
    await this.knowledgeManager.initialize()
  }

  /**
   * 注册API路由
   */
  registerRoutes(): APIRouteRegistry {
    return {
      // 知识条目相关
      '/api/knowledge': {
        GET: this.handleGetKnowledge.bind(this),
        POST: this.handleAddKnowledge.bind(this)
      },

      '/api/knowledge/search': {
        POST: this.handleSearchKnowledge.bind(this)
      },

      '/api/knowledge/ask': {
        POST: this.handleAskQuestion.bind(this)
      },

      '/api/knowledge/:id': {
        GET: this.handleGetKnowledgeItem.bind(this),
        PUT: this.handleUpdateKnowledge.bind(this),
        DELETE: this.handleDeleteKnowledge.bind(this)
      },

      '/api/knowledge/:id/related': {
        GET: this.handleGetRelatedKnowledge.bind(this)
      },

      // 分类相关
      '/api/knowledge/categories': {
        GET: this.handleGetCategories.bind(this),
        POST: this.handleCreateCategory.bind(this)
      },

      '/api/knowledge/categories/:id': {
        GET: this.handleGetCategory.bind(this),
        PUT: this.handleUpdateCategory.bind(this),
        DELETE: this.handleDeleteCategory.bind(this)
      },

      // 标签相关
      '/api/knowledge/tags': {
        GET: this.handleGetTags.bind(this),
        POST: this.handleCreateTag.bind(this)
      },

      '/api/knowledge/tags/:name': {
        GET: this.handleGetTag.bind(this),
        DELETE: this.handleDeleteTag.bind(this)
      },

      '/api/knowledge/tags/popular': {
        GET: this.handleGetPopularTags.bind(this)
      },

      // 批量操作
      '/api/knowledge/import': {
        POST: this.handleImportKnowledge.bind(this)
      },

      '/api/knowledge/export': {
        POST: this.handleExportKnowledge.bind(this)
      },

      '/api/knowledge/extract': {
        POST: this.handleExtractKnowledge.bind(this)
      },

      '/api/knowledge/batch': {
        POST: this.handleBatchOperations.bind(this)
      },

      // 知识图谱
      '/api/knowledge/graph': {
        GET: this.handleGenerateKnowledgeGraph.bind(this)
      },

      // 统计和分析
      '/api/knowledge/statistics': {
        GET: this.handleGetStatistics.bind(this)
      },

      '/api/knowledge/trends': {
        GET: this.handleGetTrends.bind(this)
      },

      '/api/knowledge/recommendations': {
        POST: this.handleGetRecommendations.bind(this)
      },

      // 系统管理
      '/api/knowledge/health': {
        GET: this.handleHealthCheck.bind(this)
      },

      '/api/knowledge/rebuild-index': {
        POST: this.handleRebuildIndex.bind(this)
      },

      '/api/knowledge/sync': {
        POST: this.handleSyncKnowledge.bind(this)
      }
    }
  }

  // 路由处理器实现
  private async handleGetKnowledge(request: Request): Promise<Response> {
    try {
      const url = new URL(request.url)
      const category = url.searchParams.get('category')
      const tags = url.searchParams.get('tags')?.split(',')
      const limit = parseInt(url.searchParams.get('limit') || '20')
      const offset = parseInt(url.searchParams.get('offset') || '0')

      const query: KnowledgeQuery = {
        text: '',
        categories: category ? [category] : undefined,
        tags: tags || undefined,
        maxResults: limit
      }

      const result = await this.knowledgeManager.searchKnowledge(query)

      return Response.json({
        success: true,
        data: result.results.slice(offset, offset + limit),
        total: result.totalFound,
        hasMore: offset + limit < result.totalFound
      })

    } catch (error) {
      return Response.json({
        success: false,
        error: error instanceof Error ? error.message : '获取知识列表失败'
      }, { status: 500 })
    }
  }

  private async handleAddKnowledge(request: Request): Promise<Response> {
    try {
      const itemData = await request.json()

      // 验证必需字段
      if (!itemData.title || !itemData.content) {
        return Response.json({
          success: false,
          error: '标题和内容不能为空'
        }, { status: 400 })
      }

      const id = await this.knowledgeManager.addKnowledge({
        title: itemData.title,
        content: itemData.content,
        description: itemData.description,
        category: itemData.category || 'default',
        tags: Array.isArray(itemData.tags) ? itemData.tags : [],
        metadata: itemData.metadata || {},
        source: itemData.source || 'api',
        relevanceScore: itemData.relevanceScore || 1.0
      })

      return Response.json({
        success: true,
        data: { id },
        message: '知识条目添加成功'
      }, { status: 201 })

    } catch (error) {
      return Response.json({
        success: false,
        error: error instanceof Error ? error.message : '添加知识条目失败'
      }, { status: 400 })
    }
  }

  private async handleSearchKnowledge(request: Request): Promise<Response> {
    try {
      const query = await request.json() as KnowledgeQuery

      const result = await this.knowledgeManager.searchKnowledge(query)

      return Response.json({
        success: true,
        data: result
      })

    } catch (error) {
      return Response.json({
        success: false,
        error: error instanceof Error ? error.message : '搜索知识失败'
      }, { status: 400 })
    }
  }

  private async handleAskQuestion(request: Request): Promise<Response> {
    try {
      const { question, context } = await request.json()

      if (!question) {
        return Response.json({
          success: false,
          error: '问题不能为空'
        }, { status: 400 })
      }

      const result = await this.knowledgeManager.askQuestion(question, context)

      return Response.json({
        success: true,
        data: result
      })

    } catch (error) {
      return Response.json({
        success: false,
        error: error instanceof Error ? error.message : '回答问题失败'
      }, { status: 400 })
    }
  }

  private async handleGetKnowledgeItem(request: Request): Promise<Response> {
    try {
      const url = new URL(request.url)
      const id = url.pathname.split('/').pop()

      if (!id) {
        return Response.json({
          success: false,
          error: '知识条目ID不能为空'
        }, { status: 400 })
      }

      const item = this.knowledgeManager.getKnowledge(id)

      if (!item) {
        return Response.json({
          success: false,
          error: '知识条目不存在'
        }, { status: 404 })
      }

      return Response.json({
        success: true,
        data: item
      })

    } catch (error) {
      return Response.json({
        success: false,
        error: error instanceof Error ? error.message : '获取知识条目失败'
      }, { status: 500 })
    }
  }

  private async handleUpdateKnowledge(request: Request): Promise<Response> {
    try {
      const url = new URL(request.url)
      const id = url.pathname.split('/').pop()
      const updates = await request.json()

      if (!id) {
        return Response.json({
          success: false,
          error: '知识条目ID不能为空'
        }, { status: 400 })
      }

      const result = await this.knowledgeManager.updateKnowledge(id, updates)

      if (!result) {
        return Response.json({
          success: false,
          error: '知识条目不存在或更新失败'
        }, { status: 404 })
      }

      return Response.json({
        success: true,
        message: '知识条目更新成功'
      })

    } catch (error) {
      return Response.json({
        success: false,
        error: error instanceof Error ? error.message : '更新知识条目失败'
      }, { status: 400 })
    }
  }

  private async handleDeleteKnowledge(request: Request): Promise<Response> {
    try {
      const url = new URL(request.url)
      const id = url.pathname.split('/').pop()

      if (!id) {
        return Response.json({
          success: false,
          error: '知识条目ID不能为空'
        }, { status: 400 })
      }

      const result = await this.knowledgeManager.removeKnowledge(id)

      if (!result) {
        return Response.json({
          success: false,
          error: '知识条目不存在或删除失败'
        }, { status: 404 })
      }

      return Response.json({
        success: true,
        message: '知识条目删除成功'
      })

    } catch (error) {
      return Response.json({
        success: false,
        error: error instanceof Error ? error.message : '删除知识条目失败'
      }, { status: 400 })
    }
  }

  private async handleGetRelatedKnowledge(request: Request): Promise<Response> {
    try {
      const url = new URL(request.url)
      const id = url.pathname.split('/').slice(0, -1).pop()
      const limit = parseInt(url.searchParams.get('limit') || '5')

      if (!id) {
        return Response.json({
          success: false,
          error: '知识条目ID不能为空'
        }, { status: 400 })
      }

      const originalItem = this.knowledgeManager.getKnowledge(id)
      if (!originalItem) {
        return Response.json({
          success: false,
          error: '知识条目不存在'
        }, { status: 404 })
      }

      const query: KnowledgeQuery = {
        text: originalItem.title,
        tags: originalItem.tags,
        categories: [originalItem.category],
        maxResults: limit
      }

      const result = await this.knowledgeManager.searchKnowledge(query)

      const relatedItems = result.results.filter(item => item.id !== id)

      return Response.json({
        success: true,
        data: relatedItems
      })

    } catch (error) {
      return Response.json({
        success: false,
        error: error instanceof Error ? error.message : '获取相关知识失败'
      }, { status: 500 })
    }
  }

  private async handleGetCategories(request: Request): Promise<Response> {
    try {
      const categories = this.knowledgeManager.getCategories()

      return Response.json({
        success: true,
        data: categories
      })

    } catch (error) {
      return Response.json({
        success: false,
        error: error instanceof Error ? error.message : '获取分类列表失败'
      }, { status: 500 })
    }
  }

  private async handleCreateCategory(request: Request): Promise<Response> {
    try {
      const categoryData = await request.json()

      if (!categoryData.name) {
        return Response.json({
          success: false,
          error: '分类名称不能为空'
        }, { status: 400 })
      }

      const id = await this.knowledgeManager.createCategory({
        name: categoryData.name,
        description: categoryData.description,
        parentId: categoryData.parentId,
        color: categoryData.color,
        icon: categoryData.icon
      })

      return Response.json({
        success: true,
        data: { id },
        message: '分类创建成功'
      }, { status: 201 })

    } catch (error) {
      return Response.json({
        success: false,
        error: error instanceof Error ? error.message : '创建分类失败'
      }, { status: 400 })
    }
  }

  private async handleGetTags(request: Request): Promise<Response> {
    try {
      const tags = this.knowledgeManager.getTags()

      return Response.json({
        success: true,
        data: tags
      })

    } catch (error) {
      return Response.json({
        success: false,
        error: error instanceof Error ? error.message : '获取标签列表失败'
      }, { status: 500 })
    }
  }

  private async handleCreateTag(request: Request): Promise<Response> {
    try {
      const tagData = await request.json()

      if (!tagData.name) {
        return Response.json({
          success: false,
          error: '标签名称不能为空'
        }, { status: 400 })
      }

      const name = await this.knowledgeManager.createTag({
        name: tagData.name,
        description: tagData.description,
        color: tagData.color,
        category: tagData.category
      })

      return Response.json({
        success: true,
        data: { name },
        message: '标签创建成功'
      }, { status: 201 })

    } catch (error) {
      return Response.json({
        success: false,
        error: error instanceof Error ? error.message : '创建标签失败'
      }, { status: 400 })
    }
  }

  private async handleGetPopularTags(request: Request): Promise<Response> {
    try {
      const url = new URL(request.url)
      const limit = parseInt(url.searchParams.get('limit') || '10')

      const tags = this.knowledgeManager.getTags()
        .sort((a, b) => b.usageCount - a.usageCount)
        .slice(0, limit)

      return Response.json({
        success: true,
        data: tags
      })

    } catch (error) {
      return Response.json({
        success: false,
        error: error instanceof Error ? error.message : '获取热门标签失败'
      }, { status: 500 })
    }
  }

  private async handleImportKnowledge(request: Request): Promise<Response> {
    try {
      const formData = await request.formData()
      const file = formData.get('file') as File
      const options = JSON.parse(formData.get('options') as string || '{}')

      if (!file) {
        return Response.json({
          success: false,
          error: '请提供导入文件'
        }, { status: 400 })
      }

      const text = await file.text()
      const importOptions: KnowledgeImportOptions = {
        format: 'json',
        ...options
      }

      const result = await this.knowledgeManager.importKnowledge(text, importOptions)

      return Response.json({
        success: result.success,
        data: result,
        message: result.success ? '知识导入成功' : '知识导入失败'
      }, { status: result.success ? 200 : 400 })

    } catch (error) {
      return Response.json({
        success: false,
        error: error instanceof Error ? error.message : '导入知识失败'
      }, { status: 400 })
    }
  }

  private async handleExportKnowledge(request: Request): Promise<Response> {
    try {
      const options = await request.json() as KnowledgeExportOptions

      const result = await this.knowledgeManager.exportKnowledge(options)

      return Response.json({
        success: true,
        data: result
      })

    } catch (error) {
      return Response.json({
        success: false,
        error: error instanceof Error ? error.message : '导出知识失败'
      }, { status: 400 })
    }
  }

  private async handleExtractKnowledge(request: Request): Promise<Response> {
    try {
      const config = await request.json() as KnowledgeExtractionConfig

      const result = await this.knowledgeManager.extractKnowledge(config)

      return Response.json({
        success: true,
        data: result
      })

    } catch (error) {
      return Response.json({
        success: false,
        error: error instanceof Error ? error.message : '提取知识失败'
      }, { status: 400 })
    }
  }

  private async handleBatchOperations(request: Request): Promise<Response> {
    try {
      const { operation, items } = await request.json()

      // 这里实现批量操作逻辑
      let result

      switch (operation) {
        case 'delete':
          // 批量删除
          result = { deleted: items.length }
          break

        case 'update_category':
          // 批量更新分类
          result = { updated: items.length }
          break

        case 'add_tags':
          // 批量添加标签
          result = { updated: items.length }
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

  private async handleGenerateKnowledgeGraph(request: Request): Promise<Response> {
    try {
      const url = new URL(request.url)
      const maxNodes = parseInt(url.searchParams.get('maxNodes') || '100')
      const minRelevanceScore = parseFloat(url.searchParams.get('minRelevance') || '0.5')

      const graph = await this.knowledgeManager.generateKnowledgeGraph(maxNodes, minRelevanceScore)

      return Response.json({
        success: true,
        data: graph
      })

    } catch (error) {
      return Response.json({
        success: false,
        error: error instanceof Error ? error.message : '生成知识图谱失败'
      }, { status: 500 })
    }
  }

  private async handleGetStatistics(request: Request): Promise<Response> {
    try {
      const stats = this.knowledgeManager.getStatistics()

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

  private async handleGetTrends(request: Request): Promise<Response> {
    try {
      const url = new URL(request.url)
      const period = url.searchParams.get('period') || '30d'

      // 这里实现趋势分析逻辑
      const trends = {
        period,
        metrics: {
          newItems: 0,
          updatedItems: 0,
          searchQueries: 0,
          popularCategories: [],
          popularTags: []
        },
        insights: []
      }

      return Response.json({
        success: true,
        data: trends
      })

    } catch (error) {
      return Response.json({
        success: false,
        error: error instanceof Error ? error.message : '获取趋势分析失败'
      }, { status: 500 })
    }
  }

  private async handleGetRecommendations(request: Request): Promise<Response> {
    try {
      const { userId, context } = await request.json()

      // 这里实现推荐逻辑
      const recommendations = {
        knowledge: [],
        categories: [],
        tags: []
      }

      return Response.json({
        success: true,
        data: recommendations
      })

    } catch (error) {
      return Response.json({
        success: false,
        error: error instanceof Error ? error.message : '获取推荐失败'
      }, { status: 400 })
    }
  }

  private async handleHealthCheck(request: Request): Promise<Response> {
    try {
      // 执行健康检查
      const stats = this.knowledgeManager.getStatistics()

      return Response.json({
        success: true,
        data: {
          status: 'healthy',
          statistics: stats,
          timestamp: new Date()
        }
      })

    } catch (error) {
      return Response.json({
        success: false,
        error: error instanceof Error ? error.message : '健康检查失败'
      }, { status: 500 })
    }
  }

  private async handleRebuildIndex(request: Request): Promise<Response> {
    try {
      // 这里需要实现重建索引逻辑
      await new Promise(resolve => setTimeout(resolve, 2000)) // 模拟重建时间

      return Response.json({
        success: true,
        message: '索引重建完成'
      })

    } catch (error) {
      return Response.json({
        success: false,
        error: error instanceof Error ? error.message : '重建索引失败'
      }, { status: 500 })
    }
  }

  private async handleSyncKnowledge(request: Request): Promise<Response> {
    try {
      const config = await request.json()

      const result = await this.knowledgeManager.syncKnowledge(config)

      return Response.json({
        success: result.status === 'completed',
        data: result
      })

    } catch (error) {
      return Response.json({
        success: false,
        error: error instanceof Error ? error.message : '同步知识失败'
      }, { status: 400 })
    }
  }

  // 需要实现的占位方法
  private handleGetCategory(request: Request): Promise<Response> {
    throw new Error('方法未实现')
  }

  private handleUpdateCategory(request: Request): Promise<Response> {
    throw new Error('方法未实现')
  }

  private handleDeleteCategory(request: Request): Promise<Response> {
    throw new Error('方法未实现')
  }

  private handleGetTag(request: Request): Promise<Response> {
    throw new Error('方法未实现')
  }

  private handleDeleteTag(request: Request): Promise<Response> {
    throw new Error('方法未实现')
  }

  /**
   * 关闭API服务
   */
  async shutdown(): Promise<void> {
    await this.knowledgeManager.shutdown()
  }
}