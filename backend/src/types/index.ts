import { Request } from 'express';

// 用户相关类型
export interface User {
  id: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  phone?: string;
  avatar_url?: string;
  role: 'parent' | 'admin' | 'moderator';
  is_active: boolean;
  email_verified: boolean;
  last_login_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role?: 'parent' | 'admin' | 'moderator';
}

export interface UpdateUserData {
  first_name?: string;
  last_name?: string;
  phone?: string;
  avatar_url?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

// 儿童相关类型
export interface Child {
  id: string;
  user_id: string;
  name: string;
  nickname?: string;
  gender: 'male' | 'female';
  birth_date: Date;
  avatar_url?: string;
  current_stage?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateChildData {
  name: string;
  nickname?: string;
  gender: 'male' | 'female';
  birth_date: Date;
  avatar_url?: string;
}

export interface UpdateChildData {
  name?: string;
  nickname?: string;
  avatar_url?: string;
  current_stage?: string;
  is_active?: boolean;
}

// 成长记录类型
export interface GrowthRecord {
  id: string;
  child_id: string;
  title: string;
  description?: string;
  category: 'milestone' | 'daily' | 'achievement' | 'health' | 'education' | 'social';
  media_urls?: string[];
  tags?: string[];
  location?: string;
  is_public: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateGrowthRecordData {
  child_id: string;
  title: string;
  description?: string;
  category: 'milestone' | 'daily' | 'achievement' | 'health' | 'education' | 'social';
  media_urls?: string[];
  tags?: string[];
  location?: string;
  is_public?: boolean;
}

// AI对话类型
export interface AIConversation {
  id: string;
  child_id: string;
  session_id: string;
  user_message: string;
  ai_response: string;
  ai_role: 'recorder' | 'guardian' | 'listener' | 'advisor' | 'cultural_mentor';
  emotion?: string;
  context?: Record<string, any>;
  created_at: Date;
}

export interface CreateAIConversationData {
  child_id: string;
  session_id: string;
  user_message: string;
  ai_role: 'recorder' | 'guardian' | 'listener' | 'advisor' | 'cultural_mentor';
  context?: Record<string, any>;
}

// AI角色定义
export interface AIRole {
  id: string;
  name: string;
  description: string;
  personality: string;
  capabilities: string[];
  prompt_template: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

// API响应类型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: {
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    timestamp: string;
    requestId: string;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// 扩展Request类型
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
  child?: {
    id: string;
    name: string;
    user_id: string;
  };
}

// 错误类型
export interface AppError {
  name: string;
  message: string;
  statusCode: number;
  code?: string;
  details?: Record<string, unknown>;
  isOperational: boolean;
}

// 文件上传类型
export interface FileUpload {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
  buffer: Buffer;
}

export interface UploadedFile {
  url: string;
  filename: string;
  originalName: string;
  size: number;
  mimeType: string;
  uploadedAt: Date;
}

// 系统配置类型
export interface SystemConfig {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  maxFileSize: number;
  allowedFileTypes: string[];
  aiSettings: {
    openaiApiKey: string;
    defaultModel: string;
    maxTokens: number;
    temperature: number;
  };
  emailSettings: {
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPass: string;
    fromEmail: string;
    fromName: string;
  };
  securitySettings: {
    jwtSecret: string;
    jwtExpiresIn: string;
    bcryptRounds: number;
    rateLimitWindowMs: number;
    rateLimitMaxRequests: number;
  };
}

// 统计数据类型
export interface DashboardStats {
  totalUsers: number;
  totalChildren: number;
  totalGrowthRecords: number;
  totalAIConversations: number;
  activeUsersToday: number;
  newUsersThisMonth: number;
  storageUsed: number;
  apiCallsThisMonth: number;
}

export interface ChildStats {
  totalRecords: number;
  recordsByCategory: Record<string, number>;
  totalConversations: number;
  conversationsByRole: Record<string, number>;
  averageSessionLength: number;
  mostActiveDay: string;
  growthTrend: Array<{
    date: string;
    records: number;
    conversations: number;
  }>;
}

// 健康检查类型
export interface HealthCheck {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  services: {
    database: ServiceHealth;
    redis: ServiceHealth;
    ai: ServiceHealth;
    storage: ServiceHealth;
  };
  metrics: {
    memoryUsage: number;
    cpuUsage: number;
    diskUsage: number;
    responseTime: number;
    errorRate: number;
  };
}

export interface ServiceHealth {
  status: 'healthy' | 'unhealthy';
  responseTime?: number;
  lastCheck: string;
  error?: string;
}

// 通知类型
export interface Notification {
  id: string;
  user_id: string;
  type: 'milestone' | 'reminder' | 'system' | 'ai_insight' | 'weekly_report';
  title: string;
  message: string;
  data?: Record<string, any>;
  is_read: boolean;
  created_at: Date;
  read_at?: Date;
}

// 推荐类型
export interface Recommendation {
  id: string;
  child_id: string;
  type: 'activity' | 'content' | 'milestone' | 'skill';
  title: string;
  description: string;
  content_url?: string;
  age_range: {
    min: number;
    max: number;
  };
  categories: string[];
  confidence_score: number;
  created_at: Date;
}