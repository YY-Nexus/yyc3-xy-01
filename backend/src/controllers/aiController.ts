import { Request, Response } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { db } from '@/config/database';
import { redis } from '@/config/database';
import { catchAsync, createError, createNotFoundError, createValidationError, createUnauthorizedError } from '@/middleware/errorHandler';
import { Logger } from '@/config/logger';

const logger = Logger.getInstance();

// 类型定义
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    [key: string]: unknown;
  };
}

interface ChildContext {
  childName: string;
  childAge: number;
  sessionHistory: Array<{
    user_message: string;
    ai_response: string;
    ai_role: string;
    created_at: Date;
  }>;
  emotion: string;
}

// 输入验证schemas
const chatSchema = z.object({
  childId: z.string().uuid('Invalid child ID'),
  message: z.string().min(1, 'Message is required').max(2000, 'Message too long'),
  aiRole: z.enum(['recorder', 'guardian', 'listener', 'advisor', 'cultural_mentor']),
  sessionId: z.string().optional(),
});

const emotionAnalysisSchema = z.object({
  text: z.string().min(1, 'Text is required'),
  childAge: z.number().min(0).max(18).optional(),
});

// AI角色配置
const aiRoleConfigs = {
  recorder: {
    name: '记录者',
    systemPrompt: '你是记录者小语，负责记录孩子的成长瞬间。请用温柔、亲切的语气与孩子和家长交流，帮助他们保存珍贵的回忆。你专注于记录和保存孩子的成长故事。',
  },
  guardian: {
    name: '守护者',
    systemPrompt: '你是守护者小语，负责保护孩子的安全。请时刻保持警惕，识别潜在风险，为孩子创造安全的成长环境。',
  },
  listener: {
    name: '聆听者',
    systemPrompt: '你是聆听者小语，专门倾听孩子的心声。请用耐心和同理心与孩子交流，理解他们的情感需求，提供温暖的陪伴。',
  },
  advisor: {
    name: '建议者',
    systemPrompt: '你是建议者小语，负责提供专业的成长建议。请基于儿童发展心理学，为孩子和家长提供科学、实用的指导建议。',
  },
  cultural_mentor: {
    name: '国粹导师',
    systemPrompt: '你是国粹导师小语，负责传承中华优秀传统文化。请用通俗易懂的方式，向孩子介绍国学知识，培养文化自信。',
  },
};

// 模拟OpenAI API调用（实际项目中需要集成真实的AI服务）
const simulateAIResponse = async (message: string, aiRole: string, childContext?: ChildContext): Promise<string> => {
  const roleConfig = aiRoleConfigs[aiRole as keyof typeof aiRoleConfigs];

  // 模拟AI处理延迟
  await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

  // 基于角色和消息生成响应
  const responses = {
    recorder: [
      '这是一个美好的时刻！让我帮你记录下来这个珍贵的回忆。',
      '我听到了你的分享，这真的很重要，让我为你保存这个成长瞬间。',
      '哇，这真是个有趣的经历！我已经为你记录下来了。',
    ],
    guardian: [
      '我会一直在这里保护你，记住安全是最重要的。',
      '我注意到了一些情况，让我们一起确保你的安全。',
      '作为你的守护者，我想提醒你注意安全事项。',
    ],
    listener: [
      '我在这里认真听你说话，能跟我分享更多吗？',
      '我感受到了你的情感，这对你来说一定很重要。',
      '谢谢你愿意告诉我这些，我在这里陪伴你。',
    ],
    advisor: [
      '根据儿童发展规律，我建议你可以尝试这样做...',
      '从专业角度来看，这个阶段的孩子通常需要...',
      '让我为你提供一些科学的建议和指导。',
    ],
    cultural_mentor: [
      '在我们中华传统文化中，这有着深刻的含义...',
      '让我为你讲解一下相关的国学知识...',
      '这是一个很好的机会来了解我们的优秀传统文化。',
    ],
  };

  const roleResponses = responses[aiRole as keyof typeof responses];
  const randomResponse = roleResponses[Math.floor(Math.random() * roleResponses.length)];

  return `${randomResponse}\n\n${roleConfig.systemPrompt.substring(0, 100)}...`;
};

// 情感分析
const analyzeEmotion = async (text: string): Promise<string> => {
  const emotions = ['happy', 'excited', 'curious', 'calm', 'proud', 'thoughtful'];
  await new Promise(resolve => setTimeout(resolve, 200));
  return emotions[Math.floor(Math.random() * emotions.length)] || 'calm';
};

// AI聊天
export const chat = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).user?.id;

  if (!userId) {
    throw createUnauthorizedError('User not authenticated');
  }

  // 验证输入数据
  const validatedData = chatSchema.parse(req.body);

  // 验证儿童是否属于当前用户
  const childResult = await db.query(
    'SELECT id, name, age(current_date, birth_date) as age FROM children WHERE id = $1 AND user_id = $2 AND is_active = true',
    [validatedData.childId, userId]
  );

  if (childResult.rows.length === 0) {
    throw createNotFoundError('Child not found');
  }

  const child = childResult.rows[0];

  // 生成或使用现有的会话ID
  const sessionId = validatedData.sessionId || uuidv4();

  // 分析用户情感
  const emotion = await analyzeEmotion(validatedData.message);

  // 准备AI上下文
  const context = {
    childName: child.name,
    childAge: Math.floor(parseInt(child.age) / 365), // 转换为年
    sessionHistory: await getChatHistory(sessionId, 5), // 获取最近5条对话
    emotion,
  };

  // 获取AI响应
  const aiResponse = await simulateAIResponse(
    validatedData.message,
    validatedData.aiRole,
    context
  );

  // 保存对话记录
  await db.query(
    `INSERT INTO ai_conversations (child_id, session_id, user_message, ai_response, ai_role, emotion, context)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [
      validatedData.childId,
      sessionId,
      validatedData.message,
      aiResponse,
      validatedData.aiRole,
      emotion,
      context,
    ]
  );

  // 更新儿童最后活动时间
  await db.query(
    'UPDATE children SET updated_at = NOW() WHERE id = $1',
    [validatedData.childId]
  );

  // 缓存会话信息
  await redis.setex(
    `ai_session:${sessionId}`,
    3600, // 1小时过期
    JSON.stringify({
      childId: validatedData.childId,
      userId,
      lastActivity: new Date().toISOString(),
      aiRole: validatedData.aiRole,
    })
  );

  // 记录审计日志
  await db.query(
    `INSERT INTO audit_logs (user_id, action, resource_type, resource_id, ip_address, user_agent)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [userId, 'AI_CHAT', 'ai_conversation', sessionId, req.ip, req.get('User-Agent')]
  );

  logger.info('AI chat completed successfully', {
    userId,
    childId: validatedData.childId,
    sessionId,
    aiRole: validatedData.aiRole,
    messageLength: validatedData.message.length,
  });

  res.json({
    success: true,
    data: {
      sessionId,
      message: validatedData.message,
      aiResponse,
      aiRole: validatedData.aiRole,
      aiRoleName: aiRoleConfigs[validatedData.aiRole as keyof typeof aiRoleConfigs].name,
      emotion,
      context,
    },
    meta: {
      timestamp: new Date().toISOString(),
    },
  });
});

// 获取聊天历史
export const getChatHistory = async (sessionId: string, limit: number = 50) => {
  const result = await db.query(
    `SELECT user_message, ai_response, ai_role, created_at
     FROM ai_conversations
     WHERE session_id = $1
     ORDER BY created_at ASC
     LIMIT $2`,
    [sessionId, limit]
  );

  return result.rows;
};

// 获取对话历史
export const getConversationHistory = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).user?.id;

  if (!userId) {
    throw createUnauthorizedError('User not authenticated');
  }

  const { childId } = req.params;
  const { page = 1, limit = 20, sessionId } = req.query;

  if (!childId) {
    throw createError('Child ID is required', 400);
  }

  // 验证儿童是否属于当前用户
  const childResult = await db.query(
    'SELECT id FROM children WHERE id = $1 AND user_id = $2 AND is_active = true',
    [childId, userId]
  );

  if (childResult.rows.length === 0) {
    throw createNotFoundError('Child not found');
  }

  const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

  let query = `
    SELECT id, session_id, user_message, ai_response, ai_role, emotion, created_at
    FROM ai_conversations
    WHERE child_id = $1
  `;

  const params: (string | number)[] = [childId];

  if (sessionId) {
    query += ' AND session_id = $2';
    params.push(String(sessionId));
  }

  query += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
  params.push(parseInt(limit as string), offset);

  const result = await db.query(query, params);

  // 获取总数
  let countQuery = 'SELECT COUNT(*) as total FROM ai_conversations WHERE child_id = $1';
  const countParams = [childId];

  if (sessionId) {
    countQuery += ' AND session_id = $2';
    countParams.push(sessionId as string);
  }

  const countResult = await db.query(countQuery, countParams);
  const total = parseInt(countResult.rows[0].total);

  res.json({
    success: true,
    data: {
      conversations: result.rows.map(conv => ({
        id: conv.id,
        sessionId: conv.session_id,
        userMessage: conv.user_message,
        aiResponse: conv.ai_response,
        aiRole: conv.ai_role,
        aiRoleName: aiRoleConfigs[conv.ai_role as keyof typeof aiRoleConfigs].name,
        emotion: conv.emotion,
        createdAt: conv.created_at,
      })),
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string)),
      },
    },
    meta: {
      timestamp: new Date().toISOString(),
    },
  });
});

// 获取会话列表
export const getSessions = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).user?.id;

  if (!userId) {
    throw createUnauthorizedError('User not authenticated');
  }

  const { childId } = req.params;

  // 验证儿童是否属于当前用户
  const childResult = await db.query(
    'SELECT id, name FROM children WHERE id = $1 AND user_id = $2 AND is_active = true',
    [childId, userId]
  );

  if (childResult.rows.length === 0) {
    throw createNotFoundError('Child not found');
  }

  const child = childResult.rows[0];

  // 获取所有会话及其最后一条消息
  const result = await db.query(
    `SELECT
       session_id,
       MAX(created_at) as last_message_at,
       COUNT(*) as message_count,
       (SELECT user_message FROM ai_conversations
        WHERE session_id = ac.session_id
        ORDER BY created_at DESC LIMIT 1) as last_message
     FROM ai_conversations ac
     WHERE child_id = $1
     GROUP BY session_id
     ORDER BY last_message_at DESC`,
    [childId]
  );

  res.json({
    success: true,
    data: {
      child: {
        id: child.id,
        name: child.name,
      },
      sessions: result.rows.map(session => ({
        sessionId: session.session_id,
        lastMessageAt: session.last_message_at,
        messageCount: parseInt(session.message_count),
        lastMessage: session.last_message,
      })),
    },
    meta: {
      timestamp: new Date().toISOString(),
    },
  });
});

// 删除对话
export const deleteConversation = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).user?.id;

  if (!userId) {
    throw createUnauthorizedError('User not authenticated');
  }

  const { conversationId } = req.params;

  // 验证对话是否属于当前用户
  const result = await db.query(
    `SELECT ac.id
     FROM ai_conversations ac
     JOIN children c ON ac.child_id = c.id
     WHERE ac.id = $1 AND c.user_id = $2`,
    [conversationId, userId]
  );

  if (result.rows.length === 0) {
    throw createNotFoundError('Conversation not found');
  }

  // 删除对话
  await db.query('DELETE FROM ai_conversations WHERE id = $1', [conversationId]);

  // 记录审计日志
  await db.query(
    `INSERT INTO audit_logs (user_id, action, resource_type, resource_id, ip_address, user_agent)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [userId, 'CONVERSATION_DELETE', 'ai_conversation', conversationId, req.ip, req.get('User-Agent')]
  );

  res.json({
    success: true,
    message: 'Conversation deleted successfully',
    meta: {
      timestamp: new Date().toISOString(),
    },
  });
});

// 获取AI角色信息
export const getAIRoles = catchAsync(async (req: Request, res: Response) => {
  const result = await db.query(
    'SELECT id, name, description, personality, capabilities, is_active FROM ai_roles WHERE is_active = true ORDER BY name'
  );

  res.json({
    success: true,
    data: {
      aiRoles: result.rows.map(role => ({
        id: role.id,
        name: role.name,
        description: role.description,
        personality: role.personality,
        capabilities: role.capabilities,
        isActive: role.is_active,
      })),
    },
    meta: {
      timestamp: new Date().toISOString(),
    },
  });
});

// 情感分析
export const analyzeEmotionEndpoint = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).user?.id;

  if (!userId) {
    throw createUnauthorizedError('User not authenticated');
  }

  // 验证输入数据
  const validatedData = emotionAnalysisSchema.parse(req.body);

  // 分析情感
  const emotion = await analyzeEmotion(validatedData.text);

  res.json({
    success: true,
    data: {
      emotion,
      confidence: Math.random() * 0.5 + 0.5, // 模拟置信度 0.5-1.0
    },
    meta: {
      timestamp: new Date().toISOString(),
    },
  });
});

// 获取AI聊天统计
export const getChatStats = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).user?.id;

  if (!userId) {
    throw createUnauthorizedError('User not authenticated');
  }

  const { childId } = req.params;
  const { period = '7d' } = req.query;

  // 计算时间范围
  let days = 7;
  switch (period) {
    case '1d':
      days = 1;
      break;
    case '7d':
      days = 7;
      break;
    case '30d':
      days = 30;
      break;
    case '90d':
      days = 90;
      break;
  }

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // 验证儿童是否属于当前用户
  const childResult = await db.query(
    'SELECT id, name FROM children WHERE id = $1 AND user_id = $2 AND is_active = true',
    [childId, userId]
  );

  if (childResult.rows.length === 0) {
    throw createNotFoundError('Child not found');
  }

  // 获取统计数据
  const statsResult = await db.query(
    `SELECT
       COUNT(*) as total_conversations,
       COUNT(DISTINCT session_id) as unique_sessions,
       COUNT(DISTINCT DATE(created_at)) as active_days,
       COUNT(*) FILTER (WHERE ai_role = 'recorder') as recorder_count,
       COUNT(*) FILTER (WHERE ai_role = 'guardian') as guardian_count,
       COUNT(*) FILTER (WHERE ai_role = 'listener') as listener_count,
       COUNT(*) FILTER (WHERE ai_role = 'advisor') as advisor_count,
       COUNT(*) FILTER (WHERE ai_role = 'cultural_mentor') as cultural_mentor_count
     FROM ai_conversations
     WHERE child_id = $1 AND created_at >= $2`,
    [childId, startDate]
  );

  // 获取每日对话数量
  const dailyStatsResult = await db.query(
    `SELECT
       DATE(created_at) as date,
       COUNT(*) as conversations_count
     FROM ai_conversations
     WHERE child_id = $1 AND created_at >= $2
     GROUP BY DATE(created_at)
     ORDER BY date ASC`,
    [childId, startDate]
  );

  const stats = statsResult.rows[0];

  res.json({
    success: true,
    data: {
      period,
      startDate: startDate.toISOString(),
      endDate: new Date().toISOString(),
      summary: {
        totalConversations: parseInt(stats.total_conversations),
        uniqueSessions: parseInt(stats.unique_sessions),
        activeDays: parseInt(stats.active_days),
        averagePerDay: days > 0 ? (parseInt(stats.total_conversations) / days).toFixed(2) : 0,
      },
      roleUsage: {
        recorder: parseInt(stats.recorder_count),
        guardian: parseInt(stats.guardian_count),
        listener: parseInt(stats.listener_count),
        advisor: parseInt(stats.advisor_count),
        culturalMentor: parseInt(stats.cultural_mentor_count),
      },
      dailyStats: dailyStatsResult.rows.map(stat => ({
        date: stat.date,
        conversationsCount: parseInt(stat.conversations_count),
      })),
    },
    meta: {
      timestamp: new Date().toISOString(),
    },
  });
});