import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest, User } from '@/types';
import { createUnauthorizedError, createForbiddenError } from './errorHandler';
import { db } from '@/config/database';
import { redis } from '@/config/database';

// JWT载荷接口
interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

// 生成JWT令牌
export const generateToken = (payload: JWTPayload): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not defined');
  }

  return jwt.sign(payload, secret, {
    expiresIn: (process.env.JWT_EXPIRES_IN ?? '7d') as any,
    issuer: 'yyc3-ai-xiaoyu',
    audience: 'yyc3-ai-xiaoyu-users',
  });
};

// 生成刷新令牌
export const generateRefreshToken = (payload: JWTPayload): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not defined');
  }

  return jwt.sign(payload, secret, {
    expiresIn: (process.env.JWT_EXPIRES_IN ?? '7d') as any,
    issuer: 'yyc3-ai-xiaoyu',
    audience: 'yyc3-ai-xiaoyu-users',
  });
};

// 验证JWT令牌
export const verifyToken = (token: string): JWTPayload => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not defined');
  }

  try {
    const decoded = jwt.verify(token, secret, {
      issuer: 'yyc3-ai-xiaoyu',
      audience: 'yyc3-ai-xiaoyu-users',
    }) as JWTPayload;

    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw createUnauthorizedError('Token has expired');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw createUnauthorizedError('Invalid token');
    } else {
      throw createUnauthorizedError('Token verification failed');
    }
  }
};

// 从请求中提取令牌
export const extractToken = (req: Request): string | null => {
  const authHeader = req.headers.authorization;

  if (!authHeader || Array.isArray(authHeader)) {
    return null;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1] || null;
};

// 获取用户信息（从数据库或缓存）
export const getUserById = async (userId: string): Promise<User | null> => {
  try {
    // 首先尝试从Redis缓存获取
    const cacheKey = `user:${userId}`;
    let user = await redis.get<User>(cacheKey);

    if (user) {
      return user;
    }

    // 从数据库获取
    const result = await db.query(
      'SELECT id, email, first_name, last_name, phone, avatar_url, role, is_active, email_verified, last_login_at, created_at, updated_at FROM users WHERE id = $1 AND is_active = true',
      [userId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    user = result.rows[0];

    // 缓存用户信息（30分钟）
    await redis.set(cacheKey, user, 1800);

    return user;
  } catch (error) {
    console.error('Error getting user by ID:', error);
    return null;
  }
};

// 认证中间件
export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractToken(req);

    if (!token) {
      throw createUnauthorizedError('No token provided');
    }

    const payload = verifyToken(token);
    const user = await getUserById(payload.userId);

    if (!user) {
      throw createUnauthorizedError('User not found');
    }

    // 检查用户是否被激活
    if (!user.is_active) {
      throw createForbiddenError('User account is deactivated');
    }

    // 检查邮箱是否已验证（对某些端点）
    // if (!user.email_verified) {
    //   throw createForbiddenError('Email not verified');
    // }

    // 将用户信息添加到请求对象
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    // 记录最后登录时间（异步，不阻塞请求）
    setImmediate(async () => {
      try {
        await db.query(
          'UPDATE users SET last_login_at = NOW() WHERE id = $1',
          [user.id]
        );

        // 清除缓存
        await redis.del(`user:${user.id}`);
      } catch (error) {
        console.error('Error updating last login:', error);
      }
    });

    next();
  } catch (error) {
    next(error);
  }
};

// 可选认证中间件（用户可以未登录）
export const optionalAuthMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractToken(req);

    if (token) {
      const payload = verifyToken(token);
      const user = await getUserById(payload.userId);

      if (user && user.is_active) {
        req.user = {
          id: user.id,
          email: user.email,
          role: user.role,
        };
      }
    }

    next();
  } catch (error) {
    // 可选认证失败时不抛出错误，继续处理请求
    next();
  }
};

// 角色检查中间件工厂
export const requireRole = (roles: string | string[]) => {
  const allowedRoles = Array.isArray(roles) ? roles : [roles];

  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(createUnauthorizedError('Authentication required'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(createForbiddenError('Insufficient permissions'));
    }

    next();
  };
};

// 管理员角色检查
export const requireAdmin = requireRole('admin');

// 家长角色检查
export const requireParent = requireRole('parent');

// 管理员或版主角色检查
export const requireModeratorOrAdmin = requireRole(['admin', 'moderator']);

// 检查资源所有权
export const checkOwnership = (resourceType: 'user' | 'child' | 'growth_record') => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        return next(createUnauthorizedError('Authentication required'));
      }

      const resourceId = req.params.id;
      const userId = req.user.id;

      let isOwner = false;
      let query = '';

      switch (resourceType) {
        case 'user':
          isOwner = resourceId === userId;
          break;
        case 'child':
          query = 'SELECT user_id FROM children WHERE id = $1';
          break;
        case 'growth_record':
          query = `
            SELECT gr.child_id, c.user_id
            FROM growth_records gr
            JOIN children c ON gr.child_id = c.id
            WHERE gr.id = $1
          `;
          break;
        default:
          return next(createForbiddenError('Invalid resource type'));
      }

      if (query) {
        const result = await db.query(query, [resourceId]);

        if (result.rows.length > 0) {
          const ownerUserId = resourceType === 'growth_record'
            ? result.rows[0].user_id
            : result.rows[0].user_id;

          isOwner = ownerUserId === userId;
        }
      }

      // 管理员可以访问所有资源
      if (req.user.role === 'admin' || isOwner) {
        return next();
      }

      return next(createForbiddenError('Access denied'));
    } catch (error) {
      next(error);
    }
  };
};

// 刷新令牌中间件
export const refreshTokenMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw createUnauthorizedError('Refresh token is required');
    }

    const payload = verifyToken(refreshToken);
    const user = await getUserById(payload.userId);

    if (!user) {
      throw createUnauthorizedError('User not found');
    }

    if (!user.is_active) {
      throw createForbiddenError('User account is deactivated');
    }

    // 生成新的访问令牌
    const newToken = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    res.json({
      success: true,
      data: {
        token: newToken,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          phone: user.phone,
          avatarUrl: user.avatar_url,
          role: user.role,
          emailVerified: user.email_verified,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export default authMiddleware;