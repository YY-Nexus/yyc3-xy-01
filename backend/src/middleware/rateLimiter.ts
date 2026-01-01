import { Request, Response, NextFunction } from 'express';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { createTooManyRequestsError } from './errorHandler';
import { redis } from '@/config/database';
import { Logger } from '@/config/logger';

const logger = Logger.getInstance();

// 创建内存速率限制器（用于开发环境或Redis不可用时）
const createMemoryLimiter = (options: {
  windowMs: number;
  maxRequests: number;
}) => {
  return new RateLimiterMemory({
    points: options.maxRequests,
    duration: options.windowMs / 1000,
    blockDuration: (options.windowMs / 1000) * 2, // 阻塞时间是窗口时间的2倍
  });
};

// 创建Redis速率限制器
const createRedisLimiter = async (options: {
  windowMs: number;
  maxRequests: number;
  prefix: string;
}) => {
  const { RateLimiterRedis } = await import('rate-limiter-flexible');

  try {
    return new RateLimiterRedis({
      storeClient: redisClient,
      keyPrefix: options.prefix,
      points: options.maxRequests,
      duration: options.windowMs / 1000,
      blockDuration: (options.windowMs / 1000) * 2,
      insuranceLimiter: createMemoryLimiter(options), // 备用内存限制器
    });
  } catch (error) {
    logger.warn('Failed to create Redis rate limiter, falling back to memory limiter:', error);
    return createMemoryLimiter(options);
  }
};

// Redis客户端（用于速率限制器）
const redisClient = {
  set: async (key: string, value: string, ttl: number) => {
    await redis.set(key, value, ttl);
  },
  get: async (key: string) => {
    return await redis.get(key);
  },
  del: async (key: string) => {
    return await redis.del(key);
  },
};

// 通用速率限制器
export const rateLimiter = createMemoryLimiter({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15分钟
  maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // 100次请求
});

// API速率限制器（更严格）
export const apiRateLimiter = createMemoryLimiter({
  windowMs: 60000, // 1分钟
  maxRequests: 60, // 60次请求
});

// 认证相关速率限制器
export const authRateLimiter = createMemoryLimiter({
  windowMs: 900000, // 15分钟
  maxRequests: 5, // 5次认证尝试
});

// 密码重置速率限制器
export const passwordResetLimiter = createMemoryLimiter({
  windowMs: 3600000, // 1小时
  maxRequests: 3, // 3次密码重置
});

// AI对话速率限制器
export const aiRateLimiter = createMemoryLimiter({
  windowMs: 60000, // 1分钟
  maxRequests: 30, // 30次AI对话
});

// 文件上传速率限制器
export const uploadRateLimiter = createMemoryLimiter({
  windowMs: 60000, // 1分钟
  maxRequests: 10, // 10次文件上传
});

// 创建速率限制器中间件
const createRateLimitMiddleware = (limiter: any) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // 跳过健康检查和静态文件
      if (req.path === '/health' || req.path.startsWith('/static')) {
        return next();
      }

      // 获取客户端标识符
      const key = limiter.keyGenerator ? limiter.keyGenerator(req) : req.ip;

      // 检查速率限制
      await limiter.consume(key);

      next();
    } catch (rejRes: any) {
      // 获取剩余时间和重试次数
      const secs = Math.round(rejRes.msBeforeNext / 1000) || 1;
      const remainingPoints = rejRes.remainingPoints || 0;

      // 设置响应头
      res.set({
        'Retry-After': secs.toString(),
        'X-RateLimit-Limit': limiter.points.toString(),
        'X-RateLimit-Remaining': remainingPoints.toString(),
        'X-RateLimit-Reset': new Date(Date.now() + rejRes.msBeforeNext).toISOString(),
      });

      // 记录速率限制触发
      logger.warn('Rate limit exceeded', {
        ip: req.ip,
        path: req.path,
        method: req.method,
        userAgent: req.get('User-Agent'),
        limit: limiter.points,
        windowMs: limiter.duration * 1000,
        remainingPoints,
        retryAfter: secs,
      });

      // 返回错误响应
      if (req.headers.accept && req.headers.accept.includes('application/json')) {
        res.status(429).json({
          success: false,
          error: 'Too Many Requests',
          message: `Rate limit exceeded. Please try again in ${secs} seconds.`,
          details: {
            limit: limiter.points,
            windowMs: limiter.duration * 1000,
            remainingPoints,
            retryAfter: secs,
          },
          meta: {
            timestamp: new Date().toISOString(),
          },
        });
      } else {
        res.status(429).send(`Too Many Requests. Please try again in ${secs} seconds.`);
      }
    }
  };
};

// 导出中间件
export const rateLimitMiddleware = createRateLimitMiddleware(rateLimiter);
export const apiRateLimitMiddleware = createRateLimitMiddleware(apiRateLimiter);
export const authRateLimitMiddleware = createRateLimitMiddleware(authRateLimiter);
export const passwordResetRateLimitMiddleware = createRateLimitMiddleware(passwordResetLimiter);
export const aiRateLimitMiddleware = createRateLimitMiddleware(aiRateLimiter);
export const uploadRateLimitMiddleware = createRateLimitMiddleware(uploadRateLimiter);

// 动态速率限制器（基于用户或IP）
export const createDynamicRateLimiter = (options: {
  windowMs: number;
  maxRequests: number;
  keyGenerator?: (req: Request) => string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}) => {
  const limiter = new RateLimiterMemory({
    points: options.maxRequests,
    duration: options.windowMs / 1000,
  });

  const keyGen = options.keyGenerator || ((req: Request) => req.ip || 'unknown');

  return createRateLimitMiddleware({ ...limiter, keyGenerator: keyGen });
};

// 基于用户的速率限制器
export const userRateLimitMiddleware = createDynamicRateLimiter({
  windowMs: 900000, // 15分钟
  maxRequests: 200, // 每用户200次请求
  keyGenerator: (req: Request) => {
    // 如果用户已认证，使用用户ID；否则使用IP
    return (req as any).user?.id || req.ip || 'unknown';
  },
});

// 敏感操作速率限制器
export const sensitiveOperationLimiter = createDynamicRateLimiter({
  windowMs: 300000, // 5分钟
  maxRequests: 5, // 5次敏感操作
  keyGenerator: (req: Request) => {
    const userId = (req as any).user?.id;
    const operation = req.body?.operation || req.path.split('/').pop() || 'unknown';
    return `${userId || req.ip}:${operation}`;
  },
});

export default rateLimitMiddleware;