export interface RealtimeMetrics {
  activeUsers?: number
  responseTime?: number
  averageSatisfaction?: number
  userRetentionRate?: number
  newUsers?: number
  aiConversations?: number
  systemHealth?: number
  errorRate?: number
  lastUpdated?: number
  totalUsers?: number
  [key: string]: number | undefined
}

export interface RealtimeActivity {
  id: string
  type: 'user_action' | 'system_event' | 'ai_interaction' | 'business_event'
  timestamp: string
  description: string
  details: {
    duration: number
    success: boolean
    userId?: string
    sessionId: string
  }
  impact: 'low' | 'medium' | 'high'
  metadata: {
    ip: string
    userAgent: string
    location: string
    device: string
  }
}

export interface AlertData {
  id: string
  type: 'error' | 'warning' | 'info' | 'success'
  severity: 'critical' | 'high' | 'medium' | 'low'
  title: string
  message: string
  timestamp: string
  source: string
  acknowledged: boolean
  resolved: boolean
  metadata?: Record<string, string | boolean | number>
  actions?: Array<{
    id: string
    label: string
    type: 'primary' | 'secondary' | 'danger'
  }>
}

export interface BusinessInsights {
  summary?: string
  trends?: Array<{
    metric: string
    value: number
    change: number
    trend: 'up' | 'down' | 'stable'
  }>
  recommendations: Array<{
    id?: string
    priority: 'high' | 'medium' | 'low'
    action?: string
    impact?: string
    expectedImpact?: string
    effort?: string
    timeline?: string
    dependencies?: string[]
    successMetrics?: string[]
    category?: string
    title?: string
    description?: string
  }>
  keyFindings?: Array<{
    id?: string
    type?: string
    title: string
    description: string
    impact: string
    confidence?: number
    metrics?: string[]
    recommendations?: string[]
    data?: {
      current: number
      previous: number
      change: string
    }
  }>
  predictions?: Array<{
    id?: string
    type?: string
    title: string
    description: string
    confidence: number
    timeframe: string
    keyDrivers?: string[]
    scenarios?: {
      optimistic: string
      realistic: string
      pessimistic: string
    }
  }>
  generatedAt?: string
  confidence?: number
  dataQuality?: string
}
