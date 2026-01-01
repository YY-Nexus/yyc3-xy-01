/**
 * @file database.ts
 * @description YYC³ AI小语智能成长守护系统数据库接口定义，统一数据库客户端接口，支持多种数据库实现和数据操作
 * @author YYC³团队 <admin@0379.email>
 * @version 1.0.0
 */

import { type StorageKey } from '@/lib/db/client'

// ===== 基础查询接口 =====

export interface QueryBuilder<T = unknown> {
  select(columns?: string): QueryBuilder<T>
  from(table: string): QueryBuilder<T>
  where(column: string, operator: string, value: unknown): QueryBuilder<T>
  whereIn(column: string, values: unknown[]): QueryBuilder<T>
  orderBy(column: string, ascending?: boolean): QueryBuilder<T>
  limit(count: number): QueryBuilder<T>
  offset(count: number): QueryBuilder<T>
  range(from: number, to: number): QueryBuilder<T>
  single(): Promise<T | null>
  maybeSingle(): Promise<T | null>
  execute(): Promise<T[]>
}

// ===== 存储接口 =====

export interface StorageClient {
  upload: (bucket: string, path: string, file: File) => Promise<string>
  download: (bucket: string, path: string) => Promise<Blob>
  remove: (bucket: string, paths: string[]) => Promise<void>
  getPublicUrl: (bucket: string, path: string) => string
  list: (bucket: string, path?: string) => Promise<StorageFileInfo[]>
}

export interface StorageFileInfo {
  name: string
  size: number
  createdAt?: string
  updatedAt?: string
}

// ===== 认证接口 =====

export interface AuthClient {
  signUp: (email: string, password: string, options?: SignUpOptions) => Promise<AuthResponse>
  signIn: (email: string, password: string) => Promise<AuthResponse>
  signOut: () => Promise<void>
  getCurrentUser: () => Promise<User | null>
  getSession: () => Promise<Session | null>
  updateUser: (attributes: UserAttributes) => Promise<User>
  resetPasswordForEmail: (email: string) => Promise<void>
  onAuthStateChange: (callback: (session: Session | null) => void) => () => void
}

export interface SignUpOptions {
  data?: Record<string, unknown>
  redirectTo?: string
}

export interface AuthResponse {
  user: User | null
  session: Session | null
  error?: AuthError
}

export interface User {
  id: string
  email: string
  emailConfirmed: boolean
  createdAt: string
  updatedAt: string
  metadata?: Record<string, unknown>
}

export interface Session {
  accessToken: string
  refreshToken: string
  expiresAt: number
  user: User
}

export interface UserAttributes {
  email?: string
  password?: string
  data?: Record<string, unknown>
}

export interface AuthError {
  message: string
  status?: number
}

// ===== 实时订阅接口 =====

export interface RealtimeClient {
  channel: (channel: string) => RealtimeChannel
  connect: () => Promise<void>
  disconnect: () => void
}

export interface RealtimeChannel {
  on: (event: string, callback: (payload: RealtimePayload) => void) => RealtimeChannel
  subscribe: (callback?: (status: string, err?: Error) => void) => RealtimeChannel
  unsubscribe: () => void
  send: (type: string, payload: unknown) => RealtimeChannel
}

export interface RealtimePayload {
  event: string
  schema: string
  table: string
  commit_timestamp: string
  payload: unknown
}

export type RealtimeCallback<T = unknown> = (payload: {
  event: string
  schema: string
  table: string
  commit_timestamp: string
  payload: T
}) => void

// ===== 主数据库客户端接口 =====

export interface DatabaseClient {
  // 基础查询方法
  findMany<T>(table: string, filter?: (item: T) => boolean): Promise<T[]>
  findOne<T extends { id: string }>(table: string, id: string): Promise<T | null>
  findFirst<T>(table: string, filter: (item: T) => boolean): Promise<T | null>

  // 数据修改方法
  create<T extends { id?: string; created_at?: string }>(
    table: string,
    data: Omit<T, 'id' | 'created_at'>
  ): Promise<T>
  createMany<T extends { id?: string; created_at?: string }>(
    table: string,
    dataArray: Omit<T, 'id' | 'created_at'>[]
  ): Promise<T[]>
  update<T extends { id: string; updated_at?: string }>(
    table: string,
    id: string,
    data: Partial<Omit<T, 'id'>>
  ): Promise<T | null>
  upsert<T extends { id: string; created_at?: string; updated_at?: string }>(
    table: string,
    id: string,
    data: Omit<T, 'id' | 'created_at' | 'updated_at'>
  ): Promise<T>
  delete(table: string, id: string): Promise<boolean>
  deleteMany(table: string, ids: string[]): Promise<number>

  // 聚合和统计方法
  count<T>(table: string, filter?: (item: T) => boolean): Promise<number>
  aggregate<T, R>(table: string, aggregator: (items: T[]) => R): Promise<R>
  paginate<T>(
    table: string,
    options: {
      page: number
      pageSize: number
      filter?: (item: T) => boolean
      sort?: (a: T, b: T) => number
    }
  ): Promise<{ data: T[]; total: number; totalPages: number }>

  // 查询构建器
  from<T = unknown>(table: string): QueryBuilder<T>

  // RPC 调用
  rpc<T>(functionName: string, params?: Record<string, unknown>): Promise<T>

  // 存储客户端
  storage: StorageClient

  // 认证客户端
  auth: AuthClient

  // 实时订阅
  realtime: RealtimeClient

  // 数据初始化和管理
  seedMockData?(): Promise<void>
  clearAll?(): Promise<void>
  exportData?(): Promise<Record<string, unknown[]>>
  importData?(data: Record<string, unknown[]>): Promise<void>
}

// ===== 数据库配置接口 =====

export interface DatabaseConfig {
  url: string
  anonKey: string
  serviceRoleKey?: string
  connectionTimeout?: number
  maxRetries?: number
  debug?: boolean
}

// ===== 事务接口 =====

export interface Transaction {
  begin(): Promise<void>
  commit(): Promise<void>
  rollback(): Promise<void>
  query<T>(sql: string, params?: unknown[]): Promise<T[]>
}

// ===== 数据库连接接口 =====

export interface DatabaseConnection {
  query<T>(sql: string, params?: unknown[]): Promise<T[]>
  release(): Promise<void>
}

// ===== 连接池接口 =====

export interface ConnectionPool {
  getConnection(): Promise<DatabaseConnection>
  releaseConnection(connection: DatabaseConnection): Promise<void>
  close(): Promise<void>
  getStats(): PoolStats
}

export interface PoolStats {
  totalConnections: number
  activeConnections: number
  idleConnections: number
  waitingRequests: number
}

// ===== 备份和恢复接口 =====

export interface BackupService {
  createBackup(options?: BackupOptions): Promise<string>
  restoreBackup(backupPath: string): Promise<void>
  listBackups(): Promise<BackupInfo[]>
  scheduleBackup(options: ScheduleOptions): Promise<string>
  deleteBackup(backupId: string): Promise<void>
}

export interface BackupOptions {
  includeTables?: string[]
  excludeTables?: string[]
  compression?: boolean
  encryption?: boolean
  destination?: string
}

export interface BackupInfo {
  id: string
  createdAt: string
  size: number
  type: 'full' | 'incremental'
  status: 'pending' | 'completed' | 'failed'
  path: string
}

export interface ScheduleOptions {
  frequency: 'daily' | 'weekly' | 'monthly'
  time: string
  retention: number // days
}

// ===== 迁移接口 =====

export interface MigrationService {
  createMigration(name: string, sql: string): Promise<Migration>
  runMigrations(): Promise<Migration[]>
  rollbackTo(version: string): Promise<void>
  getCurrentVersion(): Promise<string>
  getPendingMigrations(): Promise<Migration[]>
}

export interface Migration {
  id: string
  name: string
  version: string
  sql: string
  createdAt: string
  appliedAt?: string
}

// ===== 性能监控接口 =====

export interface PerformanceMonitor {
  trackQuery(query: string, duration: number, rowCount?: number): void
  getSlowQueries(threshold?: number): SlowQuery[]
  getQueryStats(): QueryStats
  startProfiling(duration: number): Promise<ProfileReport>
}

export interface SlowQuery {
  query: string
  duration: number
  timestamp: string
  parameters?: unknown[]
  rowCount?: number
}

export interface QueryStats {
  totalQueries: number
  averageDuration: number
  slowestQuery: number
  fastestQuery: number
  errorsCount: number
}

export interface ProfileReport {
  id: string
  duration: number
  queries: QueryProfile[]
  recommendations: string[]
}

export interface QueryProfile {
  query: string
  duration: number
  calls: number
  avgDuration: number
  maxDuration: number
  minDuration: number
}

// ===== 缓存接口 =====

export interface CacheClient {
  get<T>(key: string): Promise<T | null>
  set<T>(key: string, value: T, ttl?: number): Promise<void>
  delete(key: string): Promise<void>
  clear(): Promise<void>
  exists(key: string): Promise<boolean>
  ttl(key: string): Promise<number>
  keys(pattern: string): Promise<string[]>
}

// ===== 索引管理接口 =====

export interface IndexManager {
  createIndex(table: string, columns: string[], options?: IndexOptions): Promise<void>
  dropIndex(table: string, indexName: string): Promise<void>
  listIndexes(table: string): Promise<IndexInfo[]>
  analyzeIndex(table: string, indexName: string): Promise<IndexAnalysis>
}

export interface IndexOptions {
  unique?: boolean
  partial?: string
  type?: 'btree' | 'hash' | 'gist' | 'spgist' | 'gin'
  name?: string
}

export interface IndexInfo {
  name: string
  table: string
  columns: string[]
  unique: boolean
  type: string
  size: number
  createdAt: string
}

export interface IndexAnalysis {
  indexName: string
  table: string
  usage: number
  efficiency: number
  recommendations: string[]
}

// ===== 数据库事件接口 =====

export type DatabaseEventData =
  | { type: 'connect'; connectionId: string }
  | { type: 'disconnect'; connectionId: string }
  | { type: 'error'; error: Error; query?: string }
  | { type: 'query'; query: string; duration: number; rowCount?: number }

export interface DatabaseEventEmitter {
  on(event: 'connect' | 'disconnect' | 'error' | 'query', listener: (data: DatabaseEventData) => void): void
  off(event: string, listener: (data: DatabaseEventData) => void): void
  emit(event: string, data: DatabaseEventData): void
}

// ===== 类型守卫 =====

export function isDatabaseClient(obj: unknown): obj is DatabaseClient {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'findMany' in obj &&
    'findOne' in obj &&
    'create' in obj &&
    'update' in obj &&
    'delete' in obj &&
    'storage' in obj &&
    'auth' in obj &&
    'realtime' in obj
  )
}

export function isValidTableName(table: string): table is StorageKey {
  const validTables: StorageKey[] = [
    'users',
    'children',
    'growth_records',
    'growth_assessments',
    'ai_conversations',
    'homework_tasks',
    'courses',
    'milestones',
    'stage_transitions'
  ]
  return validTables.includes(table as StorageKey)
}