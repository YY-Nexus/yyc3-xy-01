/**
 * @file KnowledgeManager.ts
 * @description YYC³ AI小语智能成长守护系统知识管理器，统一管理知识库的所有功能，提供高级接口
 * @author YYC³团队 <admin@0379.email>
 * @version 1.0.0
 */

import { KnowledgeBase } from './KnowledgeBase'
import { EventEmitter } from 'events'
import type {
  KnowledgeItem,
  KnowledgeQuery,
  KnowledgeSearchResult,
  KnowledgeStats,
  KnowledgeCategory,
  KnowledgeTag,
  KnowledgeExtractionConfig,
  KnowledgeExtractionResult,
  KnowledgeSyncConfig,
  KnowledgeSyncResult,
  KnowledgeExportOptions,
  KnowledgeImportOptions,
  RAGConfig,
  AnswerGenerationOptions
} from '../../types/knowledge/common'

/**
 * 知识管理器
 * 提供知识系统的高级管理接口
 */
export class KnowledgeManager extends EventEmitter {
  private knowledgeBase: KnowledgeBase
  private categories: Map<string, KnowledgeCategory> = new Map()
  private tags: Map<string, KnowledgeTag> = new Map()
  private isInitialized = false

  constructor(config: RAGConfig = {}) {
    super()
    this.knowledgeBase = new KnowledgeBase(config)

    this.setupEventHandlers()
  }

  /**
   * 初始化知识管理器
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      console.log('🧠 初始化知识管理器...')

      // 初始化知识库
      await this.knowledgeBase.initialize()

      // 加载分类和标签
      await this.loadCategories()
      await this.loadTags()

      this.isInitialized = true
      console.log('✅ 知识管理器初始化完成')
      this.emit('initialized')

    } catch (error) {
      console.error('❌ 知识管理器初始化失败:', error)
      this.emit('initializationError', error)
      throw error
    }
  }

  /**
   * 添加知识条目
   */
  async addKnowledge(
    item: Omit<KnowledgeItem, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<string> {
    if (!this.isInitialized) {
      throw new Error('知识管理器未初始化')
    }

    // 验证分类是否存在
    if (!this.categories.has(item.category)) {
      throw new Error(`分类 "${item.category}" 不存在`)
    }

    // 处理标签
    const processedTags = await this.processTags(item.tags)

    const id = await this.knowledgeBase.addKnowledge({
      ...item,
      tags: processedTags
    })

    this.emit('knowledgeAdded', { id, item })
    return id
  }

  /**
   * 搜索知识
   */
  async searchKnowledge(query: KnowledgeQuery): Promise<KnowledgeSearchResult> {
    if (!this.isInitialized) {
      throw new Error('知识管理器未初始化')
    }

    return await this.knowledgeBase.searchKnowledge(query)
  }

  getKnowledge(id: string): KnowledgeItem | undefined {
    if (!this.isInitialized) {
      throw new Error('知识管理器未初始化')
    }

    return this.knowledgeBase.getKnowledge(id)
  }

  /**
   * 更新知识条目
   */
  async updateKnowledge(
    id: string,
    updates: Partial<KnowledgeItem>
  ): Promise<boolean> {
    if (!this.isInitialized) {
      throw new Error('知识管理器未初始化')
    }

    const result = await this.knowledgeBase.updateKnowledge(id, updates)

    if (result) {
      this.emit('knowledgeUpdated', { id, updates })
    }

    return result
  }

  /**
   * 删除知识条目
   */
  async removeKnowledge(id: string): Promise<boolean> {
    if (!this.isInitialized) {
      throw new Error('知识管理器未初始化')
    }

    const result = await this.knowledgeBase.removeKnowledge(id)

    if (result) {
      this.emit('knowledgeRemoved', { id })
    }

    return result
  }

  /**
   * 智能问答（RAG）
   */
  async askQuestion(
    question: string,
    context?: Record<string, unknown>
  ): Promise<{
    answer: string
    sources: Array<{
      id: string
      title: string
      snippet: string
      relevanceScore: number
    }>
    confidence: number
  }> {
    if (!this.isInitialized) {
      throw new Error('知识管理器未初始化')
    }

    try {
      // 生成RAG上下文
      const ragContext = await this.knowledgeBase.generateRAGContext(question)

      // 生成答案（这里简化处理，实际会调用LLM）
      const answer = this.generateAnswer(question, ragContext.context, context)

      // 计算置信度
      const confidence = this.calculateConfidence(ragContext.sources.length, ragContext.context.length)

      return {
        answer,
        sources: ragContext.sources,
        confidence
      }

    } catch (error) {
      this.emit('questionAnswerError', { question, error })
      throw error
    }
  }

  /**
   * 批量导入知识
   */
  async importKnowledge(
    data: string,
    options: KnowledgeImportOptions
  ): Promise<{
    success: boolean
    imported: number
    skipped: number
    errors: string[]
  }> {
    if (!this.isInitialized) {
      throw new Error('知识管理器未初始化')
    }

    try {
      const importedIds = await this.knowledgeBase.importKnowledge(data, options.format)

      this.emit('knowledgeImported', {
        count: importedIds.length,
        format: options.format
      })

      return {
        success: true,
        imported: importedIds.length,
        skipped: 0,
        errors: []
      }

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error)
      this.emit('knowledgeImportError', { error: errorMsg })

      return {
        success: false,
        imported: 0,
        skipped: 0,
        errors: [errorMsg]
      }
    }
  }

  /**
   * 导出知识
   */
  async exportKnowledge(options: KnowledgeExportOptions): Promise<{
    data: string
    format: string
    size: number
  }> {
    if (!this.isInitialized) {
      throw new Error('知识管理器未初始化')
    }

    try {
      const data = await this.knowledgeBase.exportKnowledge(options.format)

      this.emit('knowledgeExported', {
        format: options.format,
        size: data.length
      })

      return {
        data,
        format: options.format,
        size: data.length
      }

    } catch (error) {
      this.emit('knowledgeExportError', { format: options.format, error })
      throw error
    }
  }

  /**
   * 提取知识
   */
  async extractKnowledge(config: KnowledgeExtractionConfig): Promise<KnowledgeExtractionResult> {
    if (!this.isInitialized) {
      throw new Error('知识管理器未初始化')
    }

    const startTime = Date.now()

    try {
      // 这里实现知识提取逻辑
      // 根据配置从不同源提取知识

      const extractedItems = await this.performExtraction(config)
      const processingTime = Date.now() - startTime

      // 批量添加提取的知识
      const addedIds = await this.knowledgeBase.addKnowledgeBatch(
        extractedItems.map(item => ({
          title: item.title || '未命名知识',
          content: item.content || '',
          description: item.description,
          category: item.category || 'default',
          tags: item.tags || [],
          metadata: item.metadata || {},
          source: config.textSource,
          relevanceScore: item.relevanceScore || 1.0
        }))
      )

      const result: KnowledgeExtractionResult = {
        extractedItems,
        statistics: {
          totalProcessed: extractedItems.length,
          successfullyExtracted: addedIds.length,
          errors: 0,
          duplicates: 0
        },
        errors: [],
        metadata: {
          processingTime,
          sourceType: config.textSource,
          extractionConfig: config
        }
      }

      this.emit('knowledgeExtracted', result)
      return result

    } catch (error) {
      this.emit('knowledgeExtractionError', { config, error })

      throw error
    }
  }

  /**
   * 创建分类
   */
  async createCategory(category: Omit<KnowledgeCategory, 'id' | 'metadata'>): Promise<string> {
    const id = this.generateCategoryId(category.name)

    const newCategory: KnowledgeCategory = {
      ...category,
      id,
      metadata: {
        created: new Date(),
        updated: new Date(),
        itemCount: 0,
        popularity: 0
      }
    }

    this.categories.set(id, newCategory)
    this.emit('categoryCreated', newCategory)

    return id
  }

  /**
   * 获取分类列表
   */
  getCategories(): KnowledgeCategory[] {
    return Array.from(this.categories.values())
  }

  /**
   * 创建标签
   */
  async createTag(tag: Omit<KnowledgeTag, 'createdAt' | 'usageCount' | 'relatedTags'>): Promise<string> {
    const newTag: KnowledgeTag = {
      ...tag,
      usageCount: 0,
      relatedTags: [],
      createdAt: new Date()
    }

    this.tags.set(tag.name, newTag)
    this.emit('tagCreated', newTag)

    return tag.name
  }

  /**
   * 获取标签列表
   */
  getTags(): KnowledgeTag[] {
    return Array.from(this.tags.values())
  }

  /**
   * 获取知识统计
   */
  getStatistics(): KnowledgeStats & {
    categories: KnowledgeCategory[]
    tags: KnowledgeTag[]
  } {
    const baseStats = this.knowledgeBase.getStatistics()

    return {
      ...baseStats,
      categories: this.getCategories(),
      tags: this.getTags()
    }
  }

  /**
   * 生成知识图谱
   */
  async generateKnowledgeGraph(
    maxNodes = 100,
    minRelevanceScore = 0.5
  ): Promise<{
    nodes: Array<{
      id: string
      label: string
      type: string
      size: number
      color: string
    }>
    edges: Array<{
      source: string
      target: string
      weight: number
    }>
  }> {
    const items = this.knowledgeBase.getKnowledgeItemsByFilter({ minRelevanceScore })
      .slice(0, maxNodes)

    const nodes = items.map((item: KnowledgeItem) => ({
      id: item.id,
      label: item.title,
      type: item.category,
      size: Math.max(5, item.relevanceScore * 15),
      color: this.getColorByCategory(item.category)
    }))

    const edges: Array<{ source: string; target: string; weight: number }> = []

    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        const item1: KnowledgeItem = items[i]
        const item2: KnowledgeItem = items[j]

        const commonTags = item1.tags.filter((tag: string) => item2.tags.includes(tag))
        const similarity = commonTags.length / Math.max(item1.tags.length, item2.tags.length)

        if (similarity > 0.2) {
          edges.push({
            source: item1.id,
            target: item2.id,
            weight: similarity
          })
        }
      }
    }

    return { nodes, edges }
  }

  /**
   * 同步知识
   */
  async syncKnowledge(config: KnowledgeSyncConfig): Promise<KnowledgeSyncResult> {
    const syncId = this.generateSyncId()
    const startTime = Date.now()

    this.emit('syncStarted', { syncId, config })

    try {
      // 这里实现同步逻辑
      const result: KnowledgeSyncResult = {
        syncId,
        startTime: new Date(startTime),
        endTime: new Date(),
        status: 'completed',
        statistics: {
          itemsProcessed: 0,
          itemsAdded: 0,
          itemsUpdated: 0,
          itemsDeleted: 0,
          itemsSkipped: 0,
          conflicts: 0,
          errors: 0
        },
        conflicts: [],
        errors: []
      }

      this.emit('syncCompleted', result)
      return result

    } catch (error) {
      const result: KnowledgeSyncResult = {
        syncId,
        startTime: new Date(startTime),
        endTime: new Date(),
        status: 'failed',
        statistics: {
          itemsProcessed: 0,
          itemsAdded: 0,
          itemsUpdated: 0,
          itemsDeleted: 0,
          itemsSkipped: 0,
          conflicts: 0,
          errors: 1
        },
        conflicts: [],
        errors: [{
          error: error instanceof Error ? error.message : String(error),
          timestamp: new Date()
        }]
      }

      this.emit('syncFailed', result)
      return result
    }
  }

  /**
   * 关闭知识管理器
   */
  async shutdown(): Promise<void> {
    if (!this.isInitialized) return

    try {
      await this.knowledgeBase.shutdown()
      this.isInitialized = false

      console.log('✅ 知识管理器已关闭')
      this.emit('shutdown')

    } catch (error) {
      console.error('❌ 关闭知识管理器时出错:', error)
      throw error
    }
  }

  // 私有方法实现
  private setupEventHandlers(): void {
    // 转发知识库事件
    this.knowledgeBase.on('knowledgeAdded', (event) => {
      this.emit('knowledgeAdded', event)
    })

    this.knowledgeBase.on('knowledgeRemoved', (event) => {
      this.emit('knowledgeRemoved', event)
    })

    this.knowledgeBase.on('knowledgeSearched', (event) => {
      this.emit('knowledgeSearched', event)
    })
  }

  private async processTags(tags: string[]): Promise<string[]> {
    const processedTags: string[] = []

    for (const tagName of tags) {
      // 清理标签名
      const cleanTag = tagName.trim().toLowerCase()

      if (cleanTag && !processedTags.includes(cleanTag)) {
        processedTags.push(cleanTag)

        // 如果标签不存在，创建它
        if (!this.tags.has(cleanTag)) {
          await this.createTag({
            name: cleanTag,
            description: `自动创建的标签: ${cleanTag}`
          })
        }

        // 更新使用计数
        const tag = this.tags.get(cleanTag)
        if (tag) {
          tag.usageCount++
        }
      }
    }

    return processedTags
  }

  private generateAnswer(
    question: string,
    context: string,
    _options?: AnswerGenerationOptions
  ): string {
    // 简化的答案生成
    // 在实际应用中，这里会调用LLM API
    if (!context || context.trim() === '') {
      return `抱歉，我在知识库中没有找到与问题"${question}"相关的信息。请尝试重新表述问题或提供更多背景信息。`
    }

    return `基于相关知识库，关于问题"${question}"的回答：

${context}

注：这是基于知识库检索生成的答案，建议结合具体情况进行验证。`
  }

  private calculateConfidence(sourceCount: number, contextLength: number): number {
    // 简化的置信度计算
    const sourceScore = Math.min(sourceCount / 3, 1) // 3个以上相关源为满分
    const contextScore = Math.min(contextLength / 1000, 1) // 1000字符以上为满分

    return (sourceScore * 0.6 + contextScore * 0.4)
  }

  private generateCategoryId(name: string): string {
    return name.toLowerCase().replace(/\s+/g, '-')
  }

  private generateSyncId(): string {
    return `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private async loadCategories(): Promise<void> {
    // 加载默认分类
    const defaultCategories = [
      { name: '技术', description: '技术相关知识和文档' },
      { name: '业务', description: '业务流程和规范' },
      { name: '产品', description: '产品设计和功能' },
      { name: '数据', description: '数据分析和管理' },
      { name: '安全', description: '安全策略和规范' }
    ]

    for (const category of defaultCategories) {
      await this.createCategory(category)
    }
  }

  private async loadTags(): Promise<void> {
    // 加载常用标签
    const commonTags = [
      { name: '重要', description: '重要标记' },
      { name: '紧急', description: '紧急处理' },
      { name: '文档', description: '文档类型' },
      { name: '教程', description: '教程指南' },
      { name: 'FAQ', description: '常见问题' }
    ]

    for (const tag of commonTags) {
      await this.createTag(tag)
    }
  }

  private getColorByCategory(category: string): string {
    const colors: Record<string, string> = {
      '技术': '#3b82f6',
      '业务': '#10b981',
      '产品': '#f59e0b',
      '数据': '#8b5cf6',
      '安全': '#ef4444'
    }

    return colors[category] || '#6b7280'
  }

  private async performExtraction(_config: KnowledgeExtractionConfig): Promise<Array<Partial<KnowledgeItem>>> {
    // 简化的知识提取实现
    // 在实际应用中，这里会根据配置执行真正的提取逻辑

    // 模拟提取结果
    return [
      {
        title: '提取的知识示例',
        content: '这是从数据源提取的知识内容',
        description: '提取示例描述',
        category: '技术',
        tags: ['提取', '示例'],
        relevanceScore: 0.8
      }
    ]
  }
}