/**
 * @file common.ts
 * @description YYC³ AI小语智能成长守护系统知识库系统类型定义，定义知识存储、检索、RAG和知识图谱的类型
 * @author YYC³团队 <admin@0379.email>
 * @version 1.0.0
 */

/**
 * 知识条目
 */
export interface KnowledgeItem {
  id: string
  title: string
  content: string
  description?: string
  category: string
  tags: string[]
  metadata: KnowledgeMetadata
  embedding?: number[] // 向量嵌入
  source: string
  relevanceScore: number
  createdAt: Date
  updatedAt: Date
}

/**
 * 知识元数据
 */
export interface KnowledgeMetadata {
  author?: string
  version?: string
  language?: string
  format?: 'text' | 'markdown' | 'html' | 'json'
  license?: string
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
  estimatedReadTime?: number // 分钟
  references?: string[]
  confidence?: number // 0-1
  verificationStatus?: 'verified' | 'pending' | 'unverified'
  accessLevel?: 'public' | 'restricted' | 'private'
  customFields?: Record<string, unknown>
}

/**
 * 知识查询
 */
export interface KnowledgeQuery {
  text: string
  categories?: string[]
  tags?: string[]
  dateRange?: {
    start: Date
    end: Date
  }
  maxResults?: number
  similarityThreshold?: number
  filters?: {
    author?: string
    language?: string
    format?: string
    difficulty?: string
    verificationStatus?: string
  }
  sortBy?: 'relevance' | 'date' | 'popularity' | 'confidence'
  sortOrder?: 'asc' | 'desc'
}

/**
 * 知识搜索结果
 */
export interface KnowledgeSearchResult {
  query: string
  results: KnowledgeItem[]
  totalFound: number
  searchTime: number
  context: string
  metadata: {
    embeddingModel: string
    similarityThreshold: number
    maxResults: number
    searchStrategy: string
  }
}

/**
 * RAG配置
 */
export interface RAGConfig {
  embeddingDimension?: number
  similarityThreshold?: number
  maxResults?: number
  enableCache?: boolean
  enablePersistence?: boolean
  updateInterval?: number
  batchSize?: number
  storagePath?: string
  indexType?: 'flat' | 'ivf' | 'hnsw' | 'bkd'
  compressionLevel?: 'none' | 'low' | 'medium' | 'high'
  securityLevel?: 'low' | 'medium' | 'high'
}

/**
 * 向量存储接口
 */
export interface VectorStorage {
  add(id: string, vector: number[]): Promise<void>
  remove(id: string): Promise<void>
  update(id: string, vector: number[]): Promise<void>
  get(id: string): Promise<number[] | undefined>
  search(
    queryVector: number[],
    maxResults: number,
    threshold: number
  ): Promise<Array<{ id: string; similarity: number }>>
  size(): Promise<number>
  clear(): Promise<void>
}

/**
 * 嵌入模型接口
 */
export interface EmbeddingModel {
  name: string
  dimension: number
  embed(text: string): Promise<number[]>
  embedBatch(texts: string[]): Promise<number[][]>
}

/**
 * 知识索引接口
 */
export interface KnowledgeIndex {
  add(id: string, vector: number[]): Promise<void>
  remove(id: string): Promise<void>
  update(id: string, vector: number[]): Promise<void>
  clear(): Promise<void>
  search(queryVector: number[], maxResults: number): Promise<string[]>
  rebuild(): Promise<void>
  optimize(): Promise<void>
  getStatistics(): Promise<IndexStatistics>
}

/**
 * 索引统计
 */
export interface IndexStatistics {
  totalItems: number
  indexSize: number
  memoryUsage: number
  buildTime: number
  averageSearchTime: number
  searchCount: number
  lastOptimized?: Date
  fragmentation: number
}

/**
 * 知识统计
 */
export interface KnowledgeStats {
  totalItems: number
  totalCategories: number
  totalTags: number
  averageEmbeddingCache: boolean
  memoryUsage: number
  categoryDistribution: Record<string, number>
  tagDistribution: Record<string, number>
  timeDistribution: Record<string, number>
  lastUpdated: Date
}

/**
 * 知识类别定义
 */
export interface KnowledgeCategory {
  id: string
  name: string
  description: string
  parentId?: string
  color?: string
  icon?: string
  metadata?: {
    created: Date
    updated: Date
    itemCount: number
    popularity: number
  }
}

/**
 * 知识标签定义
 */
export interface KnowledgeTag {
  name: string
  description?: string
  color?: string
  category?: string
  usageCount: number
  relatedTags: string[]
  createdAt: Date
}

/**
 * 知识版本控制
 */
export interface KnowledgeVersion {
  itemId: string
  version: string
  changes: KnowledgeChange[]
  author: string
  timestamp: Date
  comment?: string
  metadata?: Record<string, unknown>
}

/**
 * 知识变更记录
 */
export interface KnowledgeChange {
  field: string
  oldValue: unknown
  newValue: unknown
  type: 'create' | 'update' | 'delete'
}

/**
 * 知识引用关系
 */
export interface KnowledgeReference {
  sourceId: string
  targetId: string
  type: 'cite' | 'relate' | 'depend' | 'extend' | 'contradict'
  strength: number // 0-1
  description?: string
  createdAt: Date
  verified?: boolean
}

/**
 * 知识访问日志
 */
export interface KnowledgeAccessLog {
  id: string
  itemId: string
  userId: string
  action: 'view' | 'edit' | 'delete' | 'export' | 'search'
  timestamp: Date
  context?: {
    query?: string
    searchResults?: number
    duration?: number
    ip?: string
    userAgent?: string
  }
}

/**
 * 知识图谱节点
 */
export interface KnowledgeGraph {
  nodes: Array<{
    id: string
    label: string
    type: string
    properties: Record<string, unknown>
    position?: { x: number; y: number }
    color?: string
    size?: number
  }>
  edges: Array<{
    source: string
    target: string
    type: string
    weight: number
    properties?: Record<string, unknown>
    label?: string
  }>
  metadata: {
    nodeCount: number
    edgeCount: number
    lastUpdated: Date
    layoutAlgorithm: string
  }
}

/**
 * 知识抽取配置
 */
export interface KnowledgeExtractionConfig {
  textSource: 'file' | 'url' | 'database' | 'api'
  extractionMethod: 'regex' | 'nlp' | 'ml' | 'hybrid'
  fields: Array<{
    name: string
    type: string
    required: boolean
    pattern?: string
    validation?: Record<string, unknown>
  }>
  preprocessing?: {
    cleanText: boolean
    removeDuplicates: boolean
    normalizeWhitespace: boolean
  }
  postprocessing?: {
    generateSummary: boolean
    extractKeywords: boolean
    generateTags: boolean
  }
}

/**
 * 知识抽取结果
 */
export interface KnowledgeExtractionResult {
  extractedItems: Partial<KnowledgeItem>[]
  statistics: {
    totalProcessed: number
    successfullyExtracted: number
    errors: number
    duplicates: number
  }
  errors: Array<{
    error: string
    context?: string
    timestamp: Date
  }>
  metadata: {
    processingTime: number
    sourceType: string
    extractionConfig: KnowledgeExtractionConfig
  }
}

/**
 * 知识质量评估
 */
export interface KnowledgeQualityAssessment {
  itemId: string
  overallScore: number // 0-1
  dimensions: {
    accuracy: number
    completeness: number
    consistency: number
    relevance: number
    timeliness: number
  }
  issues: Array<{
    type: 'error' | 'warning' | 'info'
    category: string
    description: string
    severity: number
    suggestion?: string
  }>
  recommendations: string[]
  assessedAt: Date
  assessedBy: string
}

/**
 * 知识同步配置
 */
export interface KnowledgeSyncConfig {
  source: {
    type: 'local' | 'remote' | 'api'
    endpoint?: string
    credentials?: Record<string, string>
    syncMode: 'full' | 'incremental' | 'delta'
  }
  target: {
    type: 'local' | 'remote' | 'api'
    endpoint?: string
    credentials?: Record<string, string>
  }
  schedule: {
    frequency: 'manual' | 'hourly' | 'daily' | 'weekly'
    time?: string
    timezone?: string
  }
  filters?: {
    categories?: string[]
    tags?: string[]
    dateRange?: {
      start: Date
      end: Date
    }
  }
  conflictResolution: 'source_wins' | 'target_wins' | 'merge' | 'manual'
  transformations?: Array<{
    field: string
    operation: 'map' | 'filter' | 'transform' | 'validate'
    parameters: Record<string, unknown>
  }>
}

/**
 * 知识同步结果
 */
export interface KnowledgeSyncResult {
  syncId: string
  startTime: Date
  endTime?: Date
  status: 'running' | 'completed' | 'failed' | 'cancelled'
  statistics: {
    itemsProcessed: number
    itemsAdded: number
    itemsUpdated: number
    itemsDeleted: number
    itemsSkipped: number
    conflicts: number
    errors: number
  }
  conflicts: Array<{
    itemId: string
    type: string
    sourceData: unknown
    targetData: unknown
    resolution?: string
  }>
  errors: Array<{
    error: string
    itemId?: string
    context?: string
    timestamp: Date
  }>
  metadata?: Record<string, unknown>
}

/**
 * 知识搜索建议
 */
export interface KnowledgeSuggestion {
  type: 'query' | 'category' | 'tag' | 'content'
  text: string
  relevance: number
  frequency: number
  context?: string
}

/**
 * 知识趋势分析
 */
export interface KnowledgeTrendAnalysis {
  period: {
    start: Date
    end: Date
  }
  metrics: {
    totalItems: number
    newItems: number
    updatedItems: number
    deletedItems: number
    searchQueries: number
    popularCategories: Array<{
      category: string
      growth: number
      volume: number
    }>
    popularTags: Array<{
      tag: string
      growth: number
      volume: number
    }>
  }
  insights: Array<{
    type: 'trend' | 'anomaly' | 'recommendation'
    description: string
    confidence: number
    impact: 'low' | 'medium' | 'high'
  }>
}

/**
 * 知识导出选项
 */
export interface KnowledgeExportOptions {
  format: 'json' | 'csv' | 'xml' | 'rdf' | 'markdown' | 'pdf'
  filters?: {
    categories?: string[]
    tags?: string[]
    dateRange?: {
      start: Date
      end: Date
    }
    metadata?: Record<string, unknown>
  }
  fields?: string[] // 要包含的字段
  includeEmbeddings?: boolean
  includeMetadata?: boolean
  compression?: 'none' | 'gzip' | 'zip'
  chunkSize?: number // 分批导出的大小
}

/**
 * 知识导入选项
 */
export interface KnowledgeImportOptions {
  format: 'json' | 'csv' | 'xml' | 'rdf' | 'markdown'
  mapping?: Record<string, string> // 字段映射
  validation?: {
    strict: boolean
    requiredFields: string[]
    fieldValidation: Record<string, unknown>
  }
  deduplication?: {
    enabled: boolean
    strategy: 'skip' | 'update' | 'merge'
    keyFields: string[]
  }
  batch?: {
    enabled: boolean
    size: number
    parallel: number
  }
  notifications?: {
    onSuccess: boolean
    onError: boolean
    progress: boolean
  }
}

/**
 * 答案生成选项
 */
export interface AnswerGenerationOptions {
  maxLength?: number
  temperature?: number
  includeSources?: boolean
  format?: 'text' | 'markdown' | 'html'
  language?: string
  style?: 'formal' | 'casual' | 'technical'
}
