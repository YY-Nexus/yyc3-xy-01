/**
 * @file index.ts
 * @description YYC³ AI小语智能成长守护系统统一类型定义导出文件，聚合所有模块的类型定义
 * @author YYC³团队 <admin@0379.email>
 * @version 1.0.0
 */

// ===== 基础类型定义 =====

export interface BaseEntity {
  id: string
  created_at: string
  updated_at?: string
}

export interface ApiResponse<T = unknown> {
  data?: T
  success: boolean
  message?: string
  error?: string
}

export interface PaginationParams {
  page?: number
  limit?: number
  offset?: number
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// ===== 用户相关类型 =====

export interface User extends BaseEntity {
  email: string
  name: string
  avatar?: string
  age?: number
  role: 'parent' | 'child' | 'admin'
  preferences: UserPreferences
  profile?: UserProfile
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto'
  language: 'zh' | 'en'
  notifications: boolean
  voiceEnabled: boolean
  autoPlay: boolean
}

export interface UserProfile {
  bio?: string
  interests: string[]
  ageGroup: AgeGroup
  grade?: string
  school?: string
  birthday?: {
    lunar?: string
    solar: string
  }
  zodiac?: string
}

// ===== 儿童成长相关类型 =====

export interface AgeGroup {
  id: string
  name: string
  minAge: number
  maxAge: number
  description: string
  characteristics: string[]
  recommendations: string[]
}

export interface GrowthRecord extends BaseEntity {
  userId: string
  type: 'physical' | 'cognitive' | 'emotional' | 'social' | 'creative'
  title: string
  description: string
  data: Record<string, unknown>
  attachments?: Attachment[]
  tags: string[]
  milestones?: Milestone[]
  aiInsights?: AIInsight[]
}

export interface Milestone {
  id: string
  title: string
  description: string
  achievedAt: string
  category: string
  importance: 'low' | 'medium' | 'high'
}

export interface AIInsight {
  id: string
  type: 'recommendation' | 'observation' | 'warning' | 'achievement'
  title: string
  content: string
  confidence: number
  priority: 'low' | 'medium' | 'high'
  actionable: boolean
  suggestedActions?: string[]
}

// ===== AI相关类型 =====

export interface AIMessage extends BaseEntity {
  conversationId: string
  type: 'user' | 'assistant' | 'system'
  content: string
  multimodalContent?: MultimodalContent[]
  metadata?: AIMessageMetadata
  aiPersona?: AIPersona
  emotions?: EmotionAnalysis[]
  predictions?: AIPrediction[]
}

export interface AIMessageMetadata {
  processingTime?: number
  tokenCount?: number
  modelUsed?: string
  temperature?: number
  contextWindow?: number
  cost?: number
}

export interface AIPersona {
  id: string
  name: string
  role: 'companion' | 'mentor' | 'guardian' | 'recorder' | 'advisor'
  personality: string
  capabilities: string[]
  ageRange: [number, number]
  specialties: string[]
  avatar?: string
  voiceId?: string
}

export interface MultimodalContent {
  id: string
  type: 'text' | 'image' | 'audio' | 'video' | 'document' | 'code' | 'data' | 'interactive'
  content: string | Buffer | Record<string, unknown> | Array<unknown>
  metadata: {
    mimeType?: string
    size?: number
    duration?: number
    resolution?: { width: number; height: number }
    language?: string
    encoding?: string
    confidence?: number
    processedAt?: Date
  }
  aiAnalysis?: {
    summary?: string
    sentiment?: 'positive' | 'negative' | 'neutral'
    keywords?: string[]
    entities?: Array<{
      type: string
      value: string
      confidence: number
    }>
    categories?: string[]
    moderation?: ModerationResult
  }
}

export interface EmotionAnalysis {
  id: string
  timestamp: string
  emotions: Array<{
    type: string
    intensity: number
    confidence: number
  }>
  sentiment: 'positive' | 'negative' | 'neutral'
  stress?: number
  engagement?: number
  mood?: string
  triggers?: string[]
}

export interface AIPrediction {
  id: string
  type: 'behavior' | 'learning' | 'emotional' | 'developmental'
  title: string
  description: string
  confidence: number
  timeframe: string
  indicators: string[]
  recommendations: string[]
  priority: 'low' | 'medium' | 'high'
}

export interface ModerationResult {
  safe: boolean
  categories: Array<{
    category: string
    severity: 'low' | 'medium' | 'high'
    confidence: number
  }>
  action: 'allow' | 'flag' | 'block'
  explanation?: string
}

// ===== 作业和学习相关类型 =====

export interface HomeworkTask extends BaseEntity {
  userId: string
  title: string
  description: string
  subject: string
  difficulty: 'easy' | 'medium' | 'hard'
  dueDate?: string
  status: 'pending' | 'in_progress' | 'completed' | 'reviewed'
  attachments?: Attachment[]
  submissions?: HomeworkSubmission[]
  aiAssistance?: AIAssistance
}

export interface HomeworkSubmission extends BaseEntity {
  taskId: string
  content: string
  attachments?: Attachment[]
  submittedAt: string
  score?: number
  feedback?: string
  aiEvaluation?: AIEvaluation
}

export interface AIAssistance {
  enabled: boolean
  level: 'minimal' | 'moderate' | 'extensive'
  features: string[]
  customInstructions?: string
  restrictions?: string[]
}

export interface AIEvaluation {
  overallScore: number
  criteria: Array<{
    name: string
    score: number
    feedback: string
    suggestions?: string[]
  }>
  strengths: string[]
  improvements: string[]
  nextSteps?: string[]
}

// ===== 课程相关类型 =====

export interface Course extends BaseEntity {
  title: string
  description: string
  subject: string
  level: string
  duration: number
  ageRange: [number, number]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  prerequisites?: string[]
  objectives: string[]
  modules: CourseModule[]
  materials?: Attachment[]
  assessments?: Assessment[]
}

export interface CourseModule extends BaseEntity {
  courseId: string
  title: string
  description: string
  order: number
  duration: number
  content: CourseContent[]
  activities?: Activity[]
  resources?: Attachment[]
}

export interface CourseContent {
  id: string
  type: 'text' | 'video' | 'audio' | 'interactive' | 'quiz' | 'assignment'
  title: string
  content: string | Record<string, unknown> | Array<unknown>
  duration?: number
  order: number
  required: boolean
  completionCriteria?: string
}

export interface Activity {
  id: string
  type: 'discussion' | 'exercise' | 'project' | 'game' | 'simulation'
  title: string
  description: string
  instructions: string
  duration: number
  materials?: string[]
  evaluation?: EvaluationCriteria
}

export interface Assessment {
  id: string
  type: 'quiz' | 'test' | 'project' | 'presentation' | 'portfolio'
  title: string
  description: string
  questions: Question[]
  timeLimit?: number
  attempts: number
  passingScore: number
}

export interface Question {
  id: string
  type: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay' | 'fill_blank'
  question: string
  options?: string[]
  correctAnswer: string | boolean | string[] | null
  explanation?: string
  points: number
  difficulty: 'easy' | 'medium' | 'hard'
}

export interface EvaluationCriteria {
  dimensions: Array<{
    name: string
    description: string
    weight: number
    levels: Array<{
      level: string
      description: string
      score: number
    }>
  }>
  rubric?: string
  autoGrading?: boolean
}

// ===== 附件相关类型 =====

export interface Attachment extends BaseEntity {
  filename: string
  originalName: string
  mimeType: string
  size: number
  url: string
  description?: string
  tags: string[]
  metadata?: Record<string, unknown>
  thumbnailUrl?: string
  downloadCount?: number
}

// ===== 语音相关类型 =====

export interface VoiceInteraction {
  id: string
  userId: string
  type: 'speech_to_text' | 'text_to_speech' | 'voice_command' | 'conversation'
  content: string
  audioUrl?: string
  duration?: number
  language: string
  confidence?: number
  metadata?: VoiceMetadata
  timestamp: string
}

export interface VoiceMetadata {
  pitch?: number
  speed?: number
  volume?: number
  emotion?: string
  accent?: string
  clarity?: number
  backgroundNoise?: boolean
}

// ===== 主题和UI相关类型 =====

export interface Theme {
  id: string
  name: string
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    surface: string
    text: string
  }
  fonts: {
    primary: string
    secondary: string
  }
  spacing: Record<string, number>
  borderRadius: Record<string, number>
  shadows: Record<string, string>
}

export interface UIComponent {
  id: string
  type: string
  props: Record<string, unknown>
  children?: UIComponent[]
  style?: React.CSSProperties
  className?: string
}

// ===== 权限和安全相关类型 =====

export interface Permission {
  id: string
  name: string
  description: string
  resource: string
  action: string
  conditions?: Record<string, unknown>
}

export interface Role {
  id: string
  name: string
  description: string
  permissions: string[]
  isSystem: boolean
}

export interface AccessLog extends BaseEntity {
  userId: string
  action: string
  resource: string
  ipAddress: string
  userAgent: string
  success: boolean
  reason?: string
}

// ===== 系统配置相关类型 =====

export interface SystemConfig {
  id: string
  key: string
  value: string | number | boolean | Record<string, unknown> | Array<unknown>
  type: 'string' | 'number' | 'boolean' | 'object' | 'array'
  category: string
  description: string
  isPublic: boolean
  validation?: ValidationRule
}

export interface ValidationRule {
  required?: boolean
  min?: number
  max?: number
  pattern?: string
  enum?: Array<string | number | boolean>
  custom?: string
}

// ===== API路由相关类型 =====

export interface NextApiRequest {
  query: Record<string, string | string[]>
  params: Promise<Record<string, string>>
  body?: Record<string, unknown> | Array<unknown> | string
  headers: Record<string, string>
  method: string
  url: string
}

export interface NextApiResponse<T = unknown> {
  status(code: number): NextApiResponse<T>
  json(data: T): NextApiResponse<T>
  send(data: unknown): NextApiResponse<T>
  end(): NextApiResponse<T>
}

// ===== 错误相关类型 =====

export interface AppError {
  code: string
  message: string
  details?: Record<string, unknown>
  stack?: string
  timestamp: string
  userId?: string
  requestId?: string
}

export interface ValidationError extends AppError {
  field: string
  value: unknown
  constraint: string
}

// ===== 通知相关类型 =====

export interface Notification extends BaseEntity {
  userId: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  data?: Record<string, unknown>
  read: boolean
  readAt?: string
  expiresAt?: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
}

// ===== 统计和分析相关类型 =====

export interface Analytics {
  userId?: string
  event: string
  properties: Record<string, unknown>
  timestamp: string
  sessionId?: string
  deviceId?: string
  platform?: string
  version?: string
}

export interface UsageStats {
  userId: string
  period: 'daily' | 'weekly' | 'monthly'
  metrics: {
    timeSpent: number
    interactionsCount: number
    sessionsCount: number
    featuresUsed: string[]
    completionRate: number
  }
  timestamp: string
}

// ===== 导出所有类型 =====
export type {
  // Re-export commonly used Next.js types
  NextRequest,
  NextResponse,
} from 'next/server'

export type {
  // Re-export Next.js types
  NextPage,
  Metadata,
} from 'next'

export type {
  // Re-export React types
  ComponentType,
  FC,
  PropsWithChildren,
  ReactNode,
  ReactElement,
  CSSProperties,
} from 'react'