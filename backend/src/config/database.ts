/**
 * @file database.ts
 * @description YYC³ AI小语智能成长守护系统数据库配置模块，使用统一配置管理模块提供数据库连接配置
 * @author YYC³团队 <admin@0379.email>
 * @version 1.0.0
 */

import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';
import { createClient, RedisClientType } from 'redis';
import { logger } from './logger';
import { config } from './config';

export type QueryParams = unknown[];
export type QueryCallback<T = unknown> = (client: PoolClient) => Promise<T>;
export type DatabaseRecord = Record<string, unknown>;
export type CacheValue = unknown;

// 从统一配置获取数据库配置
const dbConfig = config.getDatabaseConfig();
const redisConfig = config.getRedisConfig();

// 创建PostgreSQL连接池
export const pool = new Pool(dbConfig);

// 创建Redis客户端
const redisClientConfig = {
  socket: {
    host: redisConfig.host,
    port: redisConfig.port,
  },
  database: redisConfig.database,
  maxRetriesPerRequest: redisConfig.maxRetriesPerRequest,
  retryDelayOnFailover: redisConfig.retryDelayOnFailover,
  ...(redisConfig.password !== undefined && { password: redisConfig.password }),
};
export const redisClient = createClient(redisClientConfig) as RedisClientType;

// 数据库连接状态
let isConnected = false;

// 初始化数据库连接
export const initializeDatabase = async (): Promise<void> => {
  try {
    // 测试PostgreSQL连接
    await pool.query('SELECT NOW()');
    logger.info('PostgreSQL connected successfully');

    // 连接Redis
    await redisClient.connect();
    logger.info('Redis connected successfully');

    isConnected = true;
  } catch (error) {
    logger.error('Database connection failed:', error);
    throw error;
  }
};

// 关闭数据库连接
export const closeDatabase = async (): Promise<void> => {
  try {
    await pool.end();
    await redisClient.quit();
    isConnected = false;
    logger.info('Database connections closed');
  } catch (error) {
    logger.error('Error closing database connections:', error);
    throw error;
  }
};

// 检查数据库连接状态
export const isDatabaseConnected = (): boolean => isConnected;

// 数据库健康检查
export const healthCheck = async (): Promise<{ postgres: boolean; redis: boolean }> => {
  const health = {
    postgres: false,
    redis: false,
  };

  try {
    // 检查PostgreSQL
    await pool.query('SELECT 1');
    health.postgres = true;
  } catch (error) {
    logger.error('PostgreSQL health check failed:', error);
  }

  try {
    // 检查Redis
    await redisClient.ping();
    health.redis = true;
  } catch (error) {
    logger.error('Redis health check failed:', error);
  }

  return health;
};

// 导出常用的数据库操作工具
export const db = {
  query: async (text: string, params?: QueryParams): Promise<QueryResult> => {
    const start = Date.now();
    try {
      const result = await pool.query(text, params);
      const duration = Date.now() - start;
      logger.debug('Executed query', { text, duration, rows: result.rowCount });
      return result;
    } catch (error) {
      logger.error('Query execution failed', { text, error });
      throw error;
    }
  },

  transaction: async <T = unknown>(callback: QueryCallback<T>): Promise<T> => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  one: async <T extends QueryResultRow = DatabaseRecord>(text: string, params?: QueryParams): Promise<T | undefined> => {
    const result = await pool.query<T>(text, params);
    return result.rows[0];
  },

  many: async <T extends QueryResultRow = DatabaseRecord>(text: string, params?: QueryParams): Promise<T[]> => {
    const result = await pool.query<T>(text, params);
    return result.rows;
  },

  insert: async (table: string, data: DatabaseRecord): Promise<string | number> => {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map((_, index) => `$${index + 1}`).join(', ');

    const query = `
      INSERT INTO ${table} (${keys.join(', ')})
      VALUES (${placeholders})
      RETURNING id
    `;

    const result = await pool.query(query, values);
    return result.rows[0].id;
  },

  update: async <T extends QueryResultRow = DatabaseRecord>(table: string, id: string | number, data: DatabaseRecord): Promise<T | undefined> => {
    const keys = Object.keys(data);
    const values = Object.values(data) as QueryParams;
    const setClause = keys.map((key, index) => `${key} = $${index + 2}`).join(', ');

    const query = `
      UPDATE ${table}
      SET ${setClause}, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;

    const result = await pool.query<T>(query, [id, ...values]);
    return result.rows[0];
  },

  delete: async <T extends QueryResultRow = DatabaseRecord>(table: string, id: string | number): Promise<T | undefined> => {
    const query = `DELETE FROM ${table} WHERE id = $1 RETURNING *`;
    const result = await pool.query<T>(query, [id]);
    return result.rows[0];
  },
};

// Redis操作工具
export const redis = {
  set: async (key: string, value: CacheValue, ttl?: number): Promise<void> => {
    const serializedValue = JSON.stringify(value);
    if (ttl) {
      await redisClient.setEx(key, ttl, serializedValue);
    } else {
      await redisClient.set(key, serializedValue);
    }
  },

  setex: async (key: string, ttl: number, value: CacheValue): Promise<void> => {
    const serializedValue = JSON.stringify(value);
    await redisClient.setEx(key, ttl, serializedValue);
  },

  get: async <T = CacheValue>(key: string): Promise<T | null> => {
    const value = await redisClient.get(key);
    return value ? JSON.parse(value) : null;
  },

  del: async (key: string): Promise<number> => {
    return await redisClient.del(key);
  },

  exists: async (key: string): Promise<number> => {
    return await redisClient.exists(key);
  },

  expire: async (key: string, ttl: number): Promise<boolean> => {
    return await redisClient.expire(key, ttl);
  },

  ttl: async (key: string): Promise<number> => {
    return await redisClient.ttl(key);
  },

  incr: async (key: string): Promise<number> => {
    return await redisClient.incr(key);
  },

  decr: async (key: string): Promise<number> => {
    return await redisClient.decr(key);
  },
};

export default {
  pool,
  redisClient,
  initializeDatabase,
  closeDatabase,
  isDatabaseConnected,
  healthCheck,
  db,
  redis,
};