/**
 * @file ai.ts
 * @description YYC³ AI小语智能成长守护系统AI核心类型定义，定义AI上下文、情绪状态、工具和响应相关的类型
 * @author YYC³团队 <admin@0379.email>
 * @version 1.0.0
 */

// ===== AI上下文类型 =====

export interface AIContext {
  currentPage: string
  userActivity: string
  recentActions: string[]
  emotionState?: EmotionState
  userId?: string
  timestamp?: string
}

// ===== 情绪状态类型 =====

export interface EmotionState {
  primary: "happy" | "calm" | "excited" | "frustrated" | "sad"
  intensity: number
  valence: number
  arousal: number
  secondary?: string
  confidence?: number
}

// ===== AI工具类型 =====

export interface AIToolParameter {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array'
  description: string
  required: boolean
  default?: unknown
  enum?: unknown[]
}

export interface AITool {
  name: string
  description: string
  parameters: Record<string, AIToolParameter>
  execute: (params: Record<string, unknown>) => Promise<unknown>
  enabled?: boolean
  category?: string
}

// ===== AI响应类型 =====

export interface AIResponse {
  content: string
  actions?: AIAction[]
  suggestions?: string[]
  emotionFeedback?: EmotionState
  metadata?: AIMetadata
  confidence?: number
  timestamp?: string
}

export interface AIMetadata {
  model: string
  tokensUsed?: number
  processingTime?: number
  requestId?: string
}

// ===== AI动作类型 =====

export interface AIAction {
  type: "navigate" | "execute" | "notify" | "update" | "delete"
  target: string
  params?: Record<string, unknown>
  priority?: 'low' | 'medium' | 'high'
}

// ===== AI对话类型 =====

export interface AIMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
  metadata?: Record<string, unknown>
}

export interface AIConversation {
  id: string
  userId: string
  messages: AIMessage[]
  context?: AIContext
  createdAt: string
  updatedAt: string
  status: 'active' | 'archived' | 'deleted'
}

// ===== AI配置类型 =====

export interface AIConfig {
  model: string
  temperature?: number
  maxTokens?: number
  topP?: number
  frequencyPenalty?: number
  presencePenalty?: number
  systemPrompt?: string
  tools?: AITool[]
}

// ===== AI错误类型 =====

export interface AIError {
  code: string
  message: string
  details?: Record<string, unknown>
  timestamp: string
}

// ===== AI流式响应类型 =====

export interface AIStreamChunk {
  content: string
  done: boolean
  metadata?: Record<string, unknown>
}

export type AIStreamCallback = (chunk: AIStreamChunk) => void

// ===== AI工具执行结果类型 =====

export interface AIToolExecutionResult {
  toolName: string
  success: boolean
  result?: unknown
  error?: string
  executionTime: number
}

// ===== AI分析类型 =====

export interface AIAnalysis {
  type: 'sentiment' | 'intent' | 'entity' | 'keyword'
  result: unknown
  confidence: number
  timestamp: string
}

// ===== AI建议类型 =====

export interface AISuggestion {
  id: string
  content: string
  category: string
  priority: 'low' | 'medium' | 'high'
  reason?: string
  applicable?: boolean
}

// ===== AI知识库类型 =====

export interface AIKnowledgeEntry {
  id: string
  title: string
  content: string
  category: string
  tags: string[]
  embedding?: number[]
  createdAt: string
  updatedAt: string
  relevanceScore?: number
}

// ===== AI搜索类型 =====

export interface AISearchQuery {
  query: string
  filters?: Record<string, unknown>
  limit?: number
  threshold?: number
}

export interface AISearchResult {
  entries: AIKnowledgeEntry[]
  total: number
  queryTime: number
}
