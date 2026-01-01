import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { db } from '@/config/database';
import { redis } from '@/config/database';
import { generateToken, generateRefreshToken, getUserById } from '@/middleware/auth';
import { createValidationError, createUnauthorizedError, createConflictError } from '@/middleware/errorHandler';
import { catchAsync } from '@/middleware/errorHandler';
import { Logger } from '@/config/logger';

const logger = Logger.getInstance();

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    [key: string]: unknown;
  };
}

// 输入验证schemas
const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

// 用户注册
export const register = catchAsync(async (req: Request, res: Response) => {
  // 验证输入数据
  const validatedData = registerSchema.parse(req.body);

  // 检查邮箱是否已存在
  const existingUser = await db.query(
    'SELECT id FROM users WHERE email = $1',
    [validatedData.email]
  );

  if (existingUser.rows.length > 0) {
    throw createConflictError('Email already registered');
  }

  // 加密密码
  const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
  const passwordHash = await bcrypt.hash(validatedData.password, saltRounds);

  // 创建用户
  const result = await db.query(
    `INSERT INTO users (email, password_hash, first_name, last_name, phone)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, email, first_name, last_name, phone, role, is_active, email_verified, created_at`,
    [validatedData.email, passwordHash, validatedData.firstName, validatedData.lastName, validatedData.phone]
  );

  const user = result.rows[0];

  // 生成令牌
  const tokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  const accessToken = generateToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  // 记录用户会话
  const clientInfo = {
    userAgent: req.get('User-Agent'),
    ipAddress: req.ip,
  };

  await db.query(
    `INSERT INTO user_sessions (user_id, token_hash, device_info, ip_address, expires_at)
     VALUES ($1, $2, $3, $4, NOW() + INTERVAL '7 days')`,
    [user.id, refreshToken, clientInfo, req.ip]
  );

  // 记录审计日志
  await db.query(
    `INSERT INTO audit_logs (user_id, action, resource_type, ip_address, user_agent)
     VALUES ($1, $2, $3, $4, $5)`,
    [user.id, 'USER_REGISTER', 'user', req.ip, req.get('User-Agent')]
  );

  logger.info('User registered successfully', {
    userId: user.id,
    email: user.email,
    ipAddress: req.ip,
  });

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        role: user.role,
        emailVerified: user.email_verified,
        createdAt: user.created_at,
      },
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
      },
    },
    meta: {
      timestamp: new Date().toISOString(),
    },
  });
});

// 用户登录
export const login = catchAsync(async (req: Request, res: Response) => {
  // 验证输入数据
  const validatedData = loginSchema.parse(req.body);

  // 查找用户
  const result = await db.query(
    `SELECT id, email, password_hash, first_name, last_name, phone, role,
            is_active, email_verified, last_login_at, created_at
     FROM users WHERE email = $1`,
    [validatedData.email]
  );

  if (result.rows.length === 0) {
    throw createUnauthorizedError('Invalid email or password');
  }

  const user = result.rows[0];

  // 检查用户是否被激活
  if (!user.is_active) {
    throw createUnauthorizedError('Account is deactivated');
  }

  // 验证密码
  const isValidPassword = await bcrypt.compare(validatedData.password, user.password_hash);

  if (!isValidPassword) {
    throw createUnauthorizedError('Invalid email or password');
  }

  // 生成令牌
  const tokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  const accessToken = generateToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  // 记录用户会话
  const clientInfo = {
    userAgent: req.get('User-Agent'),
    ipAddress: req.ip,
  };

  await db.query(
    `INSERT INTO user_sessions (user_id, token_hash, device_info, ip_address, expires_at)
     VALUES ($1, $2, $3, $4, NOW() + INTERVAL '7 days')`,
    [user.id, refreshToken, clientInfo, req.ip]
  );

  // 更新最后登录时间
  await db.query(
    'UPDATE users SET last_login_at = NOW() WHERE id = $1',
    [user.id]
  );

  // 清除用户缓存
  await redis.del(`user:${user.id}`);

  // 记录审计日志
  await db.query(
    `INSERT INTO audit_logs (user_id, action, resource_type, ip_address, user_agent)
     VALUES ($1, $2, $3, $4, $5)`,
    [user.id, 'USER_LOGIN', 'user', req.ip, req.get('User-Agent')]
  );

  logger.info('User logged in successfully', {
    userId: user.id,
    email: user.email,
    ipAddress: req.ip,
  });

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        role: user.role,
        emailVerified: user.email_verified,
        lastLoginAt: user.last_login_at,
        createdAt: user.created_at,
      },
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
      },
    },
    meta: {
      timestamp: new Date().toISOString(),
    },
  });
});

// 用户登出
export const logout = catchAsync(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  const userId = (req as AuthenticatedRequest).user?.id;

  if (refreshToken) {
    // 删除会话记录
    await db.query(
      'DELETE FROM user_sessions WHERE user_id = $1 AND token_hash = $2',
      [userId, refreshToken]
    );
  }

  // 记录审计日志
  if (userId) {
    await db.query(
      `INSERT INTO audit_logs (user_id, action, resource_type, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, 'USER_LOGOUT', 'user', req.ip, req.get('User-Agent')]
    );

    logger.info('User logged out successfully', {
      userId,
      ipAddress: req.ip,
    });
  }

  res.json({
    success: true,
    message: 'Logout successful',
    meta: {
      timestamp: new Date().toISOString(),
    },
  });
});

// 获取用户信息
export const getProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).user?.id;

  if (!userId) {
    throw createUnauthorizedError('User not authenticated');
  }

  const user = await getUserById(userId);

  if (!user) {
    throw createUnauthorizedError('User not found');
  }

  // 获取用户统计信息
  const statsResult = await db.query(
    `SELECT
       COUNT(DISTINCT c.id) as children_count,
       COUNT(DISTINCT gr.id) as growth_records_count,
       COUNT(DISTINCT ac.id) as ai_conversations_count,
       COUNT(DISTINCT n.id) as unread_notifications_count
     FROM users u
     LEFT JOIN children c ON u.id = c.user_id AND c.is_active = true
     LEFT JOIN growth_records gr ON c.id = gr.child_id
     LEFT JOIN ai_conversations ac ON c.id = ac.child_id
     LEFT JOIN notifications n ON u.id = n.user_id AND n.is_read = false
     WHERE u.id = $1`,
    [userId]
  );

  const stats = statsResult.rows[0];

  res.json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        avatarUrl: user.avatar_url,
        role: user.role,
        emailVerified: user.email_verified,
        lastLoginAt: user.last_login_at,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      },
      stats: {
        childrenCount: parseInt(stats.children_count) || 0,
        growthRecordsCount: parseInt(stats.growth_records_count) || 0,
        aiConversationsCount: parseInt(stats.ai_conversations_count) || 0,
        unreadNotificationsCount: parseInt(stats.unread_notifications_count) || 0,
      },
    },
    meta: {
      timestamp: new Date().toISOString(),
    },
  });
});

// 更新用户信息
export const updateProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).user?.id;

  if (!userId) {
    throw createUnauthorizedError('User not authenticated');
  }

  const { firstName, lastName, phone, avatarUrl } = req.body;

  // 获取旧的用户信息（用于审计）
  const oldUserResult = await db.query(
    'SELECT first_name, last_name, phone, avatar_url FROM users WHERE id = $1',
    [userId]
  );

  const oldUser = oldUserResult.rows[0];

  // 更新用户信息
  const result = await db.query(
    `UPDATE users
     SET first_name = COALESCE($1, first_name),
         last_name = COALESCE($2, last_name),
         phone = COALESCE($3, phone),
         avatar_url = COALESCE($4, avatar_url),
         updated_at = NOW()
     WHERE id = $5
     RETURNING id, email, first_name, last_name, phone, avatar_url, role, updated_at`,
    [firstName, lastName, phone, avatarUrl, userId]
  );

  const updatedUser = result.rows[0];

  // 清除用户缓存
  await redis.del(`user:${userId}`);

  // 记录审计日志
  await db.query(
    `INSERT INTO audit_logs (user_id, action, resource_type, resource_id, old_values, new_values, ip_address, user_agent)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      userId,
      'USER_UPDATE',
      'user',
      userId,
      { firstName: oldUser.first_name, lastName: oldUser.last_name, phone: oldUser.phone, avatarUrl: oldUser.avatar_url },
      { firstName, lastName, phone, avatarUrl },
      req.ip,
      req.get('User-Agent'),
    ]
  );

  logger.info('User profile updated successfully', {
    userId,
    changes: { firstName, lastName, phone, avatarUrl },
  });

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.first_name,
        lastName: updatedUser.last_name,
        phone: updatedUser.phone,
        avatarUrl: updatedUser.avatar_url,
        role: updatedUser.role,
        updatedAt: updatedUser.updated_at,
      },
    },
    meta: {
      timestamp: new Date().toISOString(),
    },
  });
});

// 修改密码
export const changePassword = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).user?.id;

  if (!userId) {
    throw createUnauthorizedError('User not authenticated');
  }

  // 验证输入数据
  const validatedData = changePasswordSchema.parse(req.body);

  // 获取当前密码哈希
  const result = await db.query(
    'SELECT password_hash FROM users WHERE id = $1',
    [userId]
  );

  if (result.rows.length === 0) {
    throw createUnauthorizedError('User not found');
  }

  const currentPasswordHash = result.rows[0].password_hash;

  // 验证当前密码
  const isValidPassword = await bcrypt.compare(validatedData.currentPassword, currentPasswordHash);

  if (!isValidPassword) {
    throw createUnauthorizedError('Current password is incorrect');
  }

  // 加密新密码
  const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
  const newPasswordHash = await bcrypt.hash(validatedData.newPassword, saltRounds);

  // 更新密码
  await db.query(
    'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
    [newPasswordHash, userId]
  );

  // 删除所有用户会话（强制重新登录）
  await db.query('DELETE FROM user_sessions WHERE user_id = $1', [userId]);

  // 记录审计日志
  await db.query(
    `INSERT INTO audit_logs (user_id, action, resource_type, ip_address, user_agent)
     VALUES ($1, $2, $3, $4, $5)`,
    [userId, 'PASSWORD_CHANGE', 'user', req.ip, req.get('User-Agent')]
  );

  logger.info('Password changed successfully', {
    userId,
    ipAddress: req.ip,
  });

  res.json({
    success: true,
    message: 'Password changed successfully. Please login again.',
    meta: {
      timestamp: new Date().toISOString(),
    },
  });
});

// 获取用户会话列表
export const getSessions = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).user?.id;

  if (!userId) {
    throw createUnauthorizedError('User not authenticated');
  }

  const result = await db.query(
    `SELECT id, device_info, ip_address, created_at, expires_at
     FROM user_sessions
     WHERE user_id = $1
     ORDER BY created_at DESC`,
    [userId]
  );

  res.json({
    success: true,
    data: {
      sessions: result.rows.map(session => ({
        id: session.id,
        deviceInfo: session.device_info,
        ipAddress: session.ip_address,
        createdAt: session.created_at,
        expiresAt: session.expires_at,
      })),
    },
    meta: {
      timestamp: new Date().toISOString(),
    },
  });
});

// 删除用户会话
export const deleteSession = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).user?.id;
  const sessionId = req.params.id;

  if (!userId) {
    throw createUnauthorizedError('User not authenticated');
  }

  await db.query(
    'DELETE FROM user_sessions WHERE id = $1 AND user_id = $2',
    [sessionId, userId]
  );

  // 记录审计日志
  await db.query(
    `INSERT INTO audit_logs (user_id, action, resource_type, resource_id, ip_address, user_agent)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [userId, 'SESSION_DELETE', 'user_session', sessionId, req.ip, req.get('User-Agent')]
  );

  res.json({
    success: true,
    message: 'Session deleted successfully',
    meta: {
      timestamp: new Date().toISOString(),
    },
  });
});