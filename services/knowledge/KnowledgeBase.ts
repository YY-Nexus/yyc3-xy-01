/**
 * @file KnowledgeBase.ts
 * @description YYC³ AI小语智能成长守护系统知识库系统，实现向量存储、检索增强生成(RAG)和知识管理功能
 * @author YYC³团队 <admin@0379.email>
 * @version 1.0.0
 */

import { EventEmitter } from 'events'
import { createHash } from 'crypto'
import type {
  KnowledgeItem,
  KnowledgeQuery,
  KnowledgeSearchResult,
  KnowledgeMetadata,
  VectorStorage,
  RAGConfig,
  EmbeddingModel,
  KnowledgeIndex,
  KnowledgeStats
} from '../types/knowledge/common'

/**
 * 知识库系统
 * 管理结构化和非结构化知识存储与检索
 */
export class KnowledgeBase extends EventEmitter {
  private knowledgeItems: Map<string, KnowledgeItem> = new Map()
  private vectorStorage: VectorStorage
  private embeddingModel: EmbeddingModel
  private knowledgeIndex: KnowledgeIndex
  private config: RAGConfig
  private isInitialized = false

  constructor(config: RAGConfig = {}) {
    super()
    this.config = {
      embeddingDimension: 768,
      similarityThreshold: 0.7,
      maxResults: 10,
      enableCache: true,
      enablePersistence: true,
      updateInterval: 60000, // 1分钟
      batchSize: 100,
      ...config
    }

    // 初始化向量存储
    this.vectorStorage = new InMemoryVectorStorage(this.config.embeddingDimension)

    // 初始化嵌入模型
    this.embeddingModel = new SimpleEmbeddingModel()

    // 初始化知识索引
    this.knowledgeIndex = new BKDTreeIndex(this.config.embeddingDimension)
  }

  /**
   * 初始化知识库
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      console.log('🧠 初始化知识库系统...')

      // 加载持久化数据
      if (this.config.enablePersistence) {
        await this.loadPersistedData()
      }

      // 构建索引
      await this.rebuildIndex()

      // 启动定期更新
      this.startPeriodicUpdate()

      this.isInitialized = true
      console.log('✅ 知识库系统初始化完成')
      this.emit('initialized')

    } catch (error) {
      console.error('❌ 知识库系统初始化失败:', error)
      this.emit('initializationError', error)
      throw error
    }
  }

  /**
   * 添加知识条目
   */
  async addKnowledge(item: Omit<KnowledgeItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      // 生成ID
      const id = this.generateKnowledgeId(item)

      // 创建嵌入向量
      const text = this.concatenateText(item)
      const embedding = await this.embeddingModel.embed(text)

      // 创建完整知识条目
      const knowledgeItem: KnowledgeItem = {
        ...item,
        id,
        embedding,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      // 存储知识条目
      this.knowledgeItems.set(id, knowledgeItem)

      // 添加到向量存储
      await this.vectorStorage.add(id, embedding)

      // 更新索引
      await this.knowledgeIndex.add(id, embedding)

      // 持久化
      if (this.config.enablePersistence) {
        await this.persistKnowledge(knowledgeItem)
      }

      this.emit('knowledgeAdded', { knowledge: knowledgeItem })
      console.log(`✅ 知识条目 "${id}" 添加成功`)

      return id

    } catch (error) {
      this.emit('knowledgeAddError', { item, error })
      throw error
    }
  }

  /**
   * 批量添加知识
   */
  async addKnowledgeBatch(items: Array<Omit<KnowledgeItem, 'id' | 'createdAt' | 'updatedAt'>>): Promise<string[]> {
    const results: string[] = []

    // 分批处理
    for (let i = 0; i < items.length; i += this.config.batchSize) {
      const batch = items.slice(i, i + this.config.batchSize)
      const batchPromises = batch.map(item => this.addKnowledge(item))

      try {
        const batchResults = await Promise.all(batchPromises)
        results.push(...batchResults)
      } catch (error) {
        console.error(`批量添加知识失败 (批次 ${i / this.config.batchSize + 1}):`, error)
        throw error
      }
    }

    this.emit('knowledgeBatchAdded', { count: results.length })
    return results
  }

  /**
   * 搜索知识
   */
  async searchKnowledge(query: KnowledgeQuery): Promise<KnowledgeSearchResult> {
    try {
      const startTime = Date.now()

      // 生成查询嵌入
      const queryEmbedding = await this.embeddingModel.embed(query.text)

      // 向量相似度搜索
      const similarItems = await this.vectorStorage.search(
        queryEmbedding,
        query.maxResults || this.config.maxResults,
        query.similarityThreshold || this.config.similarityThreshold
      )

      // 获取完整的知识条目
      const results = similarItems
        .map(item => this.knowledgeItems.get(item.id))
        .filter((item): item is KnowledgeItem => item !== undefined)
        .filter(item => {
          // 应用额外过滤
          if (query.categories && !query.categories.includes(item.category)) {
            return false
          }
          if (query.tags && !query.tags.some(tag => item.tags.includes(tag))) {
            return false
          }
          if (query.dateRange) {
            const itemDate = item.updatedAt
            if (itemDate < query.dateRange.start || itemDate > query.dateRange.end) {
              return false
            }
          }
          return true
        })
        .slice(0, query.maxResults || this.config.maxResults)

      // 计算搜索时间
      const searchTime = Date.now() - startTime

      // 生成上下文信息
      const context = this.generateSearchContext(results, query)

      this.emit('knowledgeSearched', { query, resultCount: results.length, searchTime })

      return {
        query: query.text,
        results,
        totalFound: results.length,
        searchTime,
        context,
        metadata: {
          embeddingModel: this.embeddingModel.name,
          similarityThreshold: query.similarityThreshold || this.config.similarityThreshold,
          maxResults: query.maxResults || this.config.maxResults
        }
      }

    } catch (error) {
      this.emit('knowledgeSearchError', { query, error })
      throw error
    }
  }

  /**
   * 获取知识条目
   */
  getKnowledge(id: string): KnowledgeItem | undefined {
    return this.knowledgeItems.get(id)
  }

  /**
   * 获取所有知识条目
   */
  getAllKnowledgeItems(): KnowledgeItem[] {
    return Array.from(this.knowledgeItems.values())
  }

  /**
   * 根据条件获取知识条目
   */
  getKnowledgeItemsByFilter(filters: {
    minRelevanceScore?: number
    category?: string
    tags?: string[]
  } = {}): KnowledgeItem[] {
    let items = Array.from(this.knowledgeItems.values())

    if (filters.minRelevanceScore !== undefined) {
      items = items.filter(item => item.relevanceScore >= filters.minRelevanceScore!)
    }

    if (filters.category) {
      items = items.filter(item => item.category === filters.category)
    }

    if (filters.tags && filters.tags.length > 0) {
      items = items.filter(item =>
        filters.tags!.some(tag => item.tags.includes(tag))
      )
    }

    return items
  }

  /**
   * 更新知识条目
   */
  async updateKnowledge(
    id: string,
    updates: Partial<KnowledgeItem>
  ): Promise<boolean> {
    try {
      const existingItem = this.knowledgeItems.get(id)
      if (!existingItem) {
        throw new Error(`知识条目 "${id}" 不存在`)
      }

      // 重新生成嵌入向量（如果内容发生变化）
      let embedding = existingItem.embedding
      if (updates.content || updates.title || updates.description) {
        const updatedText = this.concatenateText({ ...existingItem, ...updates })
        embedding = await this.embeddingModel.embed(updatedText)
      }

      // 更新知识条目
      const updatedItem: KnowledgeItem = {
        ...existingItem,
        ...updates,
        id, // 确保ID不变
        embedding,
        updatedAt: new Date()
      }

      // 更新存储
      this.knowledgeItems.set(id, updatedItem)
      await this.vectorStorage.update(id, embedding)
      await this.knowledgeIndex.update(id, embedding)

      // 持久化
      if (this.config.enablePersistence) {
        await this.persistKnowledge(updatedItem)
      }

      this.emit('knowledgeUpdated', { knowledge: updatedItem })
      return true

    } catch (error) {
      this.emit('knowledgeUpdateError', { id, error })
      return false
    }
  }

  /**
   * 删除知识条目
   */
  async removeKnowledge(id: string): Promise<boolean> {
    try {
      const item = this.knowledgeItems.get(id)
      if (!item) {
        return false
      }

      // 从各个存储中删除
      this.knowledgeItems.delete(id)
      await this.vectorStorage.remove(id)
      await this.knowledgeIndex.remove(id)

      // 持久化（删除持久化文件）
      if (this.config.enablePersistence) {
        await this.removePersistedKnowledge(id)
      }

      this.emit('knowledgeRemoved', { id, item })
      return true

    } catch (error) {
      this.emit('knowledgeRemoveError', { id, error })
      return false
    }
  }

  /**
   * 生成RAG上下文
   */
  async generateRAGContext(query: string, maxContextLength = 2000): Promise<{
    context: string
    sources: Array<{
      id: string
      title: string
      snippet: string
      relevanceScore: number
    }>
  }> {
    try {
      const searchResult = await this.searchKnowledge({
        text: query,
        maxResults: 5,
        similarityThreshold: 0.6
      })

      // 构建上下文
      let context = ''
      const sources: Array<{
        id: string
        title: string
        snippet: string
        relevanceScore: number
      }> = []

      for (const result of searchResult.results) {
        // 生成片段
        const snippet = this.generateSnippet(result.content, query, 200)

        // 添加到上下文
        if (context.length + snippet.length < maxContextLength) {
          context += `${snippet}\n\n`
          sources.push({
            id: result.id,
            title: result.title,
            snippet,
            relevanceScore: 0.8 // 简化的相关性分数
          })
        }
      }

      return {
        context: context.trim(),
        sources
      }

    } catch (error) {
      this.emit('ragContextError', { query, error })
      throw error
    }
  }

  /**
   * 获取知识统计
   */
  getStatistics(): KnowledgeStats {
    const items = Array.from(this.knowledgeItems.values())

    // 按分类统计
    const categoryStats = new Map<string, number>()
    for (const item of items) {
      categoryStats.set(item.category, (categoryStats.get(item.category) || 0) + 1)
    }

    // 按标签统计
    const tagStats = new Map<string, number>()
    for (const item of items) {
      for (const tag of item.tags) {
        tagStats.set(tag, (tagStats.get(tag) || 0) + 1)
      }
    }

    // 时间分布
    const timeDistribution = this.calculateTimeDistribution(items)

    return {
      totalItems: items.length,
      totalCategories: categoryStats.size,
      totalTags: tagStats.size,
      averageEmbeddingCache: this.config.enableCache,
      memoryUsage: this.calculateMemoryUsage(),
      categoryDistribution: Object.fromEntries(categoryStats),
      tagDistribution: Object.fromEntries(tagStats),
      timeDistribution,
      lastUpdated: new Date()
    }
  }

  /**
   * 重建索引
   */
  async rebuildIndex(): Promise<void> {
    console.log('🔄 重建知识库索引...')

    try {
      // 清空现有索引
      await this.knowledgeIndex.clear()

      // 重新添加所有项目
      for (const [id, item] of this.knowledgeItems) {
        if (item.embedding) {
          await this.knowledgeIndex.add(id, item.embedding)
        }
      }

      console.log('✅ 索引重建完成')
      this.emit('indexRebuilt')

    } catch (error) {
      console.error('❌ 索引重建失败:', error)
      this.emit('indexRebuildError', error)
      throw error
    }
  }

  /**
   * 导出知识
   */
  async exportKnowledge(format: 'json' | 'csv' | 'xml' | 'rdf' | 'markdown' | 'pdf' = 'json'): Promise<string> {
    const items = Array.from(this.knowledgeItems.values())

    if (format === 'json') {
      return JSON.stringify(items, null, 2)
    } else if (format === 'csv') {
      return this.exportToCSV(items)
    } else {
      throw new Error(`不支持的导出格式: ${format}`)
    }
  }

  /**
   * 导入知识
   */
  async importKnowledge(data: string, format: 'json' | 'csv' | 'xml' | 'rdf' | 'markdown' = 'json'): Promise<string[]> {
    let items: Array<Omit<KnowledgeItem, 'id' | 'createdAt' | 'updatedAt' | 'embedding'>>

    if (format === 'json') {
      const parsed = JSON.parse(data)
      items = Array.isArray(parsed) ? parsed : [parsed]
    } else if (format === 'csv') {
      items = this.parseCSV(data)
    } else {
      throw new Error(`不支持的导入格式: ${format}`)
    }

    // 清理导入数据
    const cleanedItems = items.map(item => ({
      title: item.title || '',
      content: item.content || '',
      description: item.description || '',
      category: item.category || 'default',
      tags: Array.isArray(item.tags) ? item.tags : [],
      metadata: item.metadata || {},
      source: item.source || 'import',
      relevanceScore: item.relevanceScore || 1.0
    }))

    return await this.addKnowledgeBatch(cleanedItems)
  }

  /**
   * 关闭知识库
   */
  async shutdown(): Promise<void> {
    if (!this.isInitialized) return

    try {
      // 停止定期更新
      if (this.updateInterval) {
        clearInterval(this.updateInterval)
      }

      // 持久化所有数据
      if (this.config.enablePersistence) {
        await this.persistAllData()
      }

      this.isInitialized = false
      console.log('✅ 知识库系统已关闭')
      this.emit('shutdown')

    } catch (error) {
      console.error('❌ 关闭知识库系统时出错:', error)
      throw error
    }
  }

  // 私有方法实现
  private generateKnowledgeId(item: Omit<KnowledgeItem, 'id' | 'createdAt' | 'updatedAt'>): string {
    const content = `${item.title}${item.content}${item.category}${Date.now()}`
    return createHash('sha256').update(content).digest('hex').substring(0, 16)
  }

  private concatenateText(item: { title?: string; content?: string; description?: string }): string {
    const parts = []
    if (item.title) parts.push(item.title)
    if (item.description) parts.push(item.description)
    if (item.content) parts.push(item.content)
    return parts.join(' ')
  }

  private generateSearchContext(results: KnowledgeItem[], query: KnowledgeQuery): string {
    if (results.length === 0) {
      return '未找到相关知识。'
    }

    const contextParts = [`基于查询 "${query.text}" 找到 ${results.length} 个相关知识条目:`]

    for (let i = 0; i < Math.min(3, results.length); i++) {
      const item = results[i]
      contextParts.push(`${i + 1}. ${item.title}: ${item.description || item.content.substring(0, 100)}...`)
    }

    return contextParts.join('\n')
  }

  private generateSnippet(content: string, query: string, maxLength: number): string {
    const lowerQuery = query.toLowerCase()
    const lowerContent = content.toLowerCase()

    const queryIndex = lowerContent.indexOf(lowerQuery)
    if (queryIndex === -1) {
      return content.substring(0, maxLength)
    }

    const start = Math.max(0, queryIndex - 50)
    const end = Math.min(content.length, queryIndex + query.length + 50)

    let snippet = content.substring(start, end)
    if (start > 0) snippet = '...' + snippet
    if (end < content.length) snippet += '...'

    return snippet
  }

  private calculateTimeDistribution(items: KnowledgeItem[]): Record<string, number> {
    const distribution: Record<string, number> = {
      today: 0,
      week: 0,
      month: 0,
      year: 0,
      older: 0
    }

    const now = new Date()
    for (const item of items) {
      const diff = now.getTime() - item.updatedAt.getTime()
      const days = diff / (1000 * 60 * 60 * 24)

      if (days < 1) distribution.today++
      else if (days < 7) distribution.week++
      else if (days < 30) distribution.month++
      else if (days < 365) distribution.year++
      else distribution.older++
    }

    return distribution
  }

  private calculateMemoryUsage(): number {
    // 简化的内存使用计算
    let totalSize = 0
    for (const item of this.knowledgeItems.values()) {
      totalSize += JSON.stringify(item).length
    }
    return totalSize
  }

  private exportToCSV(items: KnowledgeItem[]): string {
    const headers = ['id', 'title', 'description', 'category', 'tags', 'createdAt', 'updatedAt']
    const rows = items.map(item => [
      item.id,
      item.title,
      item.description,
      item.category,
      item.tags.join(';'),
      item.createdAt.toISOString(),
      item.updatedAt.toISOString()
    ])

    return [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n')
  }

  private parseCSV(data: string): Array<Omit<KnowledgeItem, 'id' | 'createdAt' | 'updatedAt' | 'embedding'>> {
    const lines = data.split('\n').filter(line => line.trim())
    if (lines.length < 2) {
      return []
    }

    const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim())
    const items: Array<Omit<KnowledgeItem, 'id' | 'createdAt' | 'updatedAt' | 'embedding'>> = []

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.replace(/"/g, '').trim())
      const item: Record<string, unknown> = {}

      for (let j = 0; j < headers.length && j < values.length; j++) {
        if (headers[j] === 'tags') {
          item[headers[j]] = values[j].split(';').map(t => t.trim())
        } else {
          item[headers[j]] = values[j]
        }
      }

      items.push(item as Omit<KnowledgeItem, 'id' | 'createdAt' | 'updatedAt' | 'embedding'>)
    }

    return items
  }

  private startPeriodicUpdate(): void {
    if (this.config.updateInterval > 0) {
      this.updateInterval = setInterval(async () => {
        try {
          await this.performPeriodicUpdate()
        } catch (error) {
          console.error('定期更新失败:', error)
        }
      }, this.config.updateInterval)
    }
  }

  private async performPeriodicUpdate(): Promise<void> {
    // 清理过期数据
    await this.cleanupExpiredData()

    // 优化索引
    await this.optimizeIndex()
  }

  private async cleanupExpiredData(): Promise<void> {
    // 实现数据清理逻辑
    this.emit('dataCleanedUp')
  }

  private async optimizeIndex(): Promise<void> {
    // 实现索引优化逻辑
    this.emit('indexOptimized')
  }

  private async loadPersistedData(): Promise<void> {
    // 实现数据加载逻辑
    console.log('📁 加载持久化数据...')
  }

  private async persistKnowledge(knowledge: KnowledgeItem): Promise<void> {
    // 实现单条数据持久化
  }

  private async persistAllData(): Promise<void> {
    // 实现全部数据持久化
  }

  private async removePersistedKnowledge(id: string): Promise<void> {
    // 实现持久化数据删除
  }

  private updateInterval?: NodeJS.Timeout
}

// 辅助类实现
class InMemoryVectorStorage implements VectorStorage {
  private vectors: Map<string, number[]> = new Map()
  private dimension: number

  constructor(dimension: number) {
    this.dimension = dimension
  }

  async add(id: string, vector: number[]): Promise<void> {
    this.vectors.set(id, vector)
  }

  async remove(id: string): Promise<void> {
    this.vectors.delete(id)
  }

  async update(id: string, vector: number[]): Promise<void> {
    this.vectors.set(id, vector)
  }

  async get(id: string): Promise<number[] | undefined> {
    return this.vectors.get(id)
  }

  async search(
    queryVector: number[],
    maxResults: number,
    threshold: number
  ): Promise<Array<{ id: string; similarity: number }>> {
    const results: Array<{ id: string; similarity: number }> = []

    for (const [id, vector] of this.vectors) {
      const similarity = this.cosineSimilarity(queryVector, vector)
      if (similarity >= threshold) {
        results.push({ id, similarity })
      }
    }

    return results
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, maxResults)
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0

    let dotProduct = 0
    let normA = 0
    let normB = 0

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i]
      normA += a[i] * a[i]
      normB += b[i] * b[i]
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
  }
}

class SimpleEmbeddingModel implements EmbeddingModel {
  name = 'simple-embedding'

  async embed(text: string): Promise<number[]> {
    // 简化的嵌入实现
    // 在实际应用中，这里会使用真实的嵌入模型
    const dimension = 768
    const embedding = new Array(dimension)

    // 基于文本哈希生成伪嵌入向量
    for (let i = 0; i < dimension; i++) {
      const hash = this.simpleHash(text + i)
      embedding[i] = (hash % 20000 - 10000) / 10000 // 归一化到 [-1, 1]
    }

    return embedding
  }

  private simpleHash(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // 转换为32位整数
    }
    return hash
  }
}

class BKDTreeIndex implements KnowledgeIndex {
  private dimension: number

  constructor(dimension: number) {
    this.dimension = dimension
  }

  async add(id: string, vector: number[]): Promise<void> {
    // BKD树索引实现
  }

  async remove(id: string): Promise<void> {
    // BKD树删除实现
  }

  async update(id: string, vector: number[]): Promise<void> {
    // BKD树更新实现
  }

  async clear(): Promise<void> {
    // 清空索引
  }

  async search(queryVector: number[], maxResults: number): Promise<string[]> {
    // BKD树搜索实现
    return []
  }
}
