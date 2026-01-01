import { Request, Response } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { db } from '@/config/database';
import { redis } from '@/config/database';
import { catchAsync, createError, createNotFoundError, createValidationError, createUnauthorizedError } from '@/middleware/errorHandler';
import { Logger } from '@/config/logger';

const logger = Logger.getInstance();

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    [key: string]: unknown;
  };
}

// 输入验证schemas
const createGrowthRecordSchema = z.object({
  childId: z.string().uuid('Invalid child ID'),
  title: z.string().min(1, 'Title is required').max(255, 'Title too long'),
  description: z.string().optional(),
  category: z.enum(['milestone', 'daily', 'achievement', 'health', 'education', 'social']),
  mediaUrls: z.array(z.string().url()).optional(),
  tags: z.array(z.string()).optional(),
  location: z.string().optional(),
  isPublic: z.boolean().default(false),
});

const updateGrowthRecordSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title too long').optional(),
  description: z.string().optional(),
  category: z.enum(['milestone', 'daily', 'achievement', 'health', 'education', 'social']).optional(),
  mediaUrls: z.array(z.string().url()).optional(),
  tags: z.array(z.string()).optional(),
  location: z.string().optional(),
  isPublic: z.boolean().optional(),
});

// 创建成长记录
export const createGrowthRecord = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).user?.id;

  if (!userId) {
    throw createUnauthorizedError('User not authenticated');
  }

  // 验证输入数据
  const validatedData = createGrowthRecordSchema.parse(req.body);

  // 验证儿童是否属于当前用户
  const childResult = await db.query(
    'SELECT id, name FROM children WHERE id = $1 AND user_id = $2 AND is_active = true',
    [validatedData.childId, userId]
  );

  if (childResult.rows.length === 0) {
    throw createNotFoundError('Child not found');
  }

  const child = childResult.rows[0];

  // 创建成长记录
  const result = await db.query(
    `INSERT INTO growth_records (child_id, title, description, category, media_urls, tags, location, is_public)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id, title, description, category, media_urls, tags, location, is_public, created_at, updated_at`,
    [
      validatedData.childId,
      validatedData.title,
      validatedData.description,
      validatedData.category,
      validatedData.mediaUrls || [],
      validatedData.tags || [],
      validatedData.location,
      validatedData.isPublic,
    ]
  );

  const growthRecord = result.rows[0];

  // 更新儿童最后活动时间
  await db.query(
    'UPDATE children SET updated_at = NOW() WHERE id = $1',
    [validatedData.childId]
  );

  // 如果是里程碑记录，创建通知
  if (validatedData.category === 'milestone') {
    await db.query(
      `INSERT INTO notifications (user_id, type, title, message, data)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        userId,
        'milestone',
        '新的里程碑！',
        `${child.name}达成了新的里程碑：${validatedData.title}`,
        { childId: validatedData.childId, recordId: growthRecord.id },
      ]
    );
  }

  // 记录审计日志
  await db.query(
    `INSERT INTO audit_logs (user_id, action, resource_type, resource_id, new_values, ip_address, user_agent)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [
      userId,
      'GROWTH_RECORD_CREATE',
      'growth_record',
      growthRecord.id,
      validatedData,
      req.ip,
      req.get('User-Agent'),
    ]
  );

  logger.info('Growth record created successfully', {
    userId,
    childId: validatedData.childId,
    recordId: growthRecord.id,
    category: validatedData.category,
  });

  res.status(201).json({
    success: true,
    message: 'Growth record created successfully',
    data: {
      growthRecord: {
        id: growthRecord.id,
        childId: validatedData.childId,
        title: growthRecord.title,
        description: growthRecord.description,
        category: growthRecord.category,
        mediaUrls: growthRecord.media_urls,
        tags: growthRecord.tags,
        location: growthRecord.location,
        isPublic: growthRecord.is_public,
        createdAt: growthRecord.created_at,
        updatedAt: growthRecord.updated_at,
      },
    },
    meta: {
      timestamp: new Date().toISOString(),
    },
  });
});

// 获取成长记录列表
export const getGrowthRecords = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).user?.id;

  if (!userId) {
    throw createUnauthorizedError('User not authenticated');
  }

  const { childId } = req.params;
  const {
    page = 1,
    limit = 20,
    category,
    tags,
    startDate,
    endDate,
    sortBy = 'created_at',
    sortOrder = 'desc',
  } = req.query;

  if (!childId) {
    throw createError('Child ID is required', 400);
  }

  // 验证儿童是否属于当前用户
  const childResult = await db.query(
    'SELECT id, name FROM children WHERE id = $1 AND user_id = $2 AND is_active = true',
    [childId, userId]
  );

  if (childResult.rows.length === 0) {
    throw createNotFoundError('Child not found');
  }

  const child = childResult.rows[0];
  const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

  let whereClause = 'WHERE gr.child_id = $1';
  const params: (string | number | Date)[] = [childId];
  let paramIndex = 2;

  if (category) {
    whereClause += ` AND gr.category = $${paramIndex}`;
    params.push(String(category));
    paramIndex++;
  }

  if (tags) {
    const tagArray = Array.isArray(tags) ? tags.map(t => String(t)) : [String(tags)];
    const tagConditions = tagArray.map(() => `$${paramIndex++}`).join(', ');
    whereClause += ` AND gr.tags && ARRAY[${tagConditions}]`;
    params.push(...tagArray);
  }

  if (startDate) {
    whereClause += ` AND gr.created_at >= $${paramIndex}`;
    params.push(String(startDate));
    paramIndex++;
  }

  if (endDate) {
    whereClause += ` AND gr.created_at <= $${paramIndex}`;
    params.push(String(endDate));
    paramIndex++;
  }

  // 验证排序字段
  const allowedSortFields = ['created_at', 'updated_at', 'title', 'category'];
  const sortField = allowedSortFields.includes(sortBy as string) ? sortBy as string : 'created_at';
  const sortDirection = (sortOrder as string)?.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

  // 获取成长记录
  const query = `
    SELECT
      gr.id, gr.title, gr.description, gr.category, gr.media_urls, gr.tags,
      gr.location, gr.is_public, gr.created_at, gr.updated_at
    FROM growth_records gr
    ${whereClause}
    ORDER BY gr.${sortField} ${sortDirection}
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;

  params.push(parseInt(limit as string), offset);

  const result = await db.query(query, params);

  // 获取总数
  const countQuery = `
    SELECT COUNT(*) as total
    FROM growth_records gr
    ${whereClause}
  `;

  const countResult = await db.query(countQuery, params.slice(0, -2));
  const total = parseInt(countResult.rows[0].total);

  res.json({
    success: true,
    data: {
      child: {
        id: child.id,
        name: child.name,
      },
      growthRecords: result.rows.map(record => ({
        id: record.id,
        title: record.title,
        description: record.description,
        category: record.category,
        mediaUrls: record.media_urls,
        tags: record.tags,
        location: record.location,
        isPublic: record.is_public,
        createdAt: record.created_at,
        updatedAt: record.updated_at,
      })),
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string)),
      },
      filters: {
        category,
        tags: tags ? (Array.isArray(tags) ? tags : [tags]) : null,
        startDate,
        endDate,
        sortBy: sortField,
        sortOrder: sortDirection.toLowerCase(),
      },
    },
    meta: {
      timestamp: new Date().toISOString(),
    },
  });
});

// 获取单个成长记录
export const getGrowthRecord = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).user?.id;

  if (!userId) {
    throw createUnauthorizedError('User not authenticated');
  }

  const { recordId } = req.params;

  // 验证记录是否属于当前用户
  const result = await db.query(
    `SELECT
       gr.id, gr.child_id, gr.title, gr.description, gr.category, gr.media_urls,
       gr.tags, gr.location, gr.is_public, gr.created_at, gr.updated_at,
       c.name as child_name
     FROM growth_records gr
     JOIN children c ON gr.child_id = c.id
     WHERE gr.id = $1 AND c.user_id = $2`,
    [recordId, userId]
  );

  if (result.rows.length === 0) {
    throw createNotFoundError('Growth record not found');
  }

  const record = result.rows[0];

  res.json({
    success: true,
    data: {
      growthRecord: {
        id: record.id,
        childId: record.child_id,
        childName: record.child_name,
        title: record.title,
        description: record.description,
        category: record.category,
        mediaUrls: record.media_urls,
        tags: record.tags,
        location: record.location,
        isPublic: record.is_public,
        createdAt: record.created_at,
        updatedAt: record.updated_at,
      },
    },
    meta: {
      timestamp: new Date().toISOString(),
    },
  });
});

// 更新成长记录
export const updateGrowthRecord = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).user?.id;

  if (!userId) {
    throw createUnauthorizedError('User not authenticated');
  }

  const { recordId } = req.params;

  // 验证输入数据
  const validatedData = updateGrowthRecordSchema.parse(req.body);

  // 验证记录是否属于当前用户并获取旧值
  const oldRecordResult = await db.query(
    `SELECT
       gr.id, gr.title, gr.description, gr.category, gr.media_urls,
       gr.tags, gr.location, gr.is_public
     FROM growth_records gr
     JOIN children c ON gr.child_id = c.id
     WHERE gr.id = $1 AND c.user_id = $2`,
    [recordId, userId]
  );

  if (oldRecordResult.rows.length === 0) {
    throw createNotFoundError('Growth record not found');
  }

  const oldRecord = oldRecordResult.rows[0];

  const updates: string[] = [];
  const updateParams: (string | string[] | boolean | undefined)[] = [];
  let paramIndex = 1;

  if (validatedData.title !== undefined) {
    updates.push(`title = $${paramIndex++}`);
    updateParams.push(validatedData.title);
  }
  if (validatedData.description !== undefined) {
    updates.push(`description = $${paramIndex++}`);
    updateParams.push(validatedData.description);
  }
  if (validatedData.category !== undefined) {
    updates.push(`category = $${paramIndex++}`);
    updateParams.push(validatedData.category);
  }
  if (validatedData.mediaUrls !== undefined) {
    updates.push(`media_urls = $${paramIndex++}`);
    updateParams.push(validatedData.mediaUrls);
  }
  if (validatedData.tags !== undefined) {
    updates.push(`tags = $${paramIndex++}`);
    updateParams.push(validatedData.tags);
  }
  if (validatedData.location !== undefined) {
    updates.push(`location = $${paramIndex++}`);
    updateParams.push(validatedData.location);
  }
  if (validatedData.isPublic !== undefined) {
    updates.push(`is_public = $${paramIndex++}`);
    updateParams.push(validatedData.isPublic);
  }

  if (updates.length === 0) {
    throw createValidationError('No valid fields to update');
  }

  updates.push('updated_at = NOW()');

  // 执行更新
  const updateQuery = `
    UPDATE growth_records
    SET ${updates.join(', ')}
    WHERE id = $${paramIndex}
    RETURNING id, title, description, category, media_urls, tags, location, is_public, updated_at
  `;

  updateParams.push(recordId);

  const updateResult = await db.query(updateQuery, updateParams);
  const updatedRecord = updateResult.rows[0];

  // 记录审计日志
  await db.query(
    `INSERT INTO audit_logs (user_id, action, resource_type, resource_id, old_values, new_values, ip_address, user_agent)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      userId,
      'GROWTH_RECORD_UPDATE',
      'growth_record',
      recordId,
      {
        title: oldRecord.title,
        description: oldRecord.description,
        category: oldRecord.category,
        mediaUrls: oldRecord.media_urls,
        tags: oldRecord.tags,
        location: oldRecord.location,
        isPublic: oldRecord.is_public,
      },
      validatedData,
      req.ip,
      req.get('User-Agent'),
    ]
  );

  logger.info('Growth record updated successfully', {
    userId,
    recordId,
    changes: Object.keys(validatedData),
  });

  res.json({
    success: true,
    message: 'Growth record updated successfully',
    data: {
      growthRecord: {
        id: updatedRecord.id,
        title: updatedRecord.title,
        description: updatedRecord.description,
        category: updatedRecord.category,
        mediaUrls: updatedRecord.media_urls,
        tags: updatedRecord.tags,
        location: updatedRecord.location,
        isPublic: updatedRecord.is_public,
        updatedAt: updatedRecord.updated_at,
      },
    },
    meta: {
      timestamp: new Date().toISOString(),
    },
  });
});

// 删除成长记录
export const deleteGrowthRecord = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).user?.id;

  if (!userId) {
    throw createUnauthorizedError('User not authenticated');
  }

  const { recordId } = req.params;

  // 验证记录是否属于当前用户
  const result = await db.query(
    `SELECT gr.id
     FROM growth_records gr
     JOIN children c ON gr.child_id = c.id
     WHERE gr.id = $1 AND c.user_id = $2`,
    [recordId, userId]
  );

  if (result.rows.length === 0) {
    throw createNotFoundError('Growth record not found');
  }

  // 删除记录
  await db.query('DELETE FROM growth_records WHERE id = $1', [recordId]);

  // 记录审计日志
  await db.query(
    `INSERT INTO audit_logs (user_id, action, resource_type, resource_id, ip_address, user_agent)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [userId, 'GROWTH_RECORD_DELETE', 'growth_record', recordId, req.ip, req.get('User-Agent')]
  );

  logger.info('Growth record deleted successfully', {
    userId,
    recordId,
  });

  res.json({
    success: true,
    message: 'Growth record deleted successfully',
    meta: {
      timestamp: new Date().toISOString(),
    },
  });
});

// 获取成长记录统计
export const getGrowthStats = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).user?.id;

  if (!userId) {
    throw createUnauthorizedError('User not authenticated');
  }

  const { childId } = req.params;
  const { period = '12m' } = req.query;

  // 计算时间范围
  let months = 12;
  switch (period) {
    case '1m':
      months = 1;
      break;
    case '3m':
      months = 3;
      break;
    case '6m':
      months = 6;
      break;
    case '12m':
      months = 12;
      break;
  }

  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);

  // 验证儿童是否属于当前用户
  const childResult = await db.query(
    'SELECT id, name, birth_date FROM children WHERE id = $1 AND user_id = $2 AND is_active = true',
    [childId, userId]
  );

  if (childResult.rows.length === 0) {
    throw createNotFoundError('Child not found');
  }

  const child = childResult.rows[0];

  // 获取统计数据
  const statsResult = await db.query(
    `SELECT
       COUNT(*) as total_records,
       COUNT(*) FILTER (WHERE category = 'milestone') as milestone_count,
       COUNT(*) FILTER (WHERE category = 'daily') as daily_count,
       COUNT(*) FILTER (WHERE category = 'achievement') as achievement_count,
       COUNT(*) FILTER (WHERE category = 'health') as health_count,
       COUNT(*) FILTER (WHERE category = 'education') as education_count,
       COUNT(*) FILTER (WHERE category = 'social') as social_count,
       COUNT(DISTINCT DATE(created_at)) as active_days,
       COUNT(*) FILTER (WHERE is_public = true) as public_count
     FROM growth_records
     WHERE child_id = $1 AND created_at >= $2`,
    [childId, startDate]
  );

  // 获取月度统计
  const monthlyStatsResult = await db.query(
    `SELECT
       DATE_TRUNC('month', created_at) as month,
       COUNT(*) as records_count
     FROM growth_records
     WHERE child_id = $1 AND created_at >= $2
     GROUP BY DATE_TRUNC('month', created_at)
     ORDER BY month ASC`,
    [childId, startDate]
  );

  // 获取最近使用的标签
  const tagsResult = await db.query(
    `SELECT tag, COUNT(*) as usage_count
     FROM (
       SELECT UNNEST(tags) as tag
       FROM growth_records
       WHERE child_id = $1 AND created_at >= $2
     ) tag_stats
     GROUP BY tag
     ORDER BY usage_count DESC
     LIMIT 10`,
    [childId, startDate]
  );

  const stats = statsResult.rows[0];

  res.json({
    success: true,
    data: {
      period,
      startDate: startDate.toISOString(),
      endDate: new Date().toISOString(),
      child: {
        id: child.id,
        name: child.name,
        birthDate: child.birth_date,
      },
      summary: {
        totalRecords: parseInt(stats.total_records),
        milestoneRecords: parseInt(stats.milestone_count),
        dailyRecords: parseInt(stats.daily_count),
        achievementRecords: parseInt(stats.achievement_count),
        healthRecords: parseInt(stats.health_count),
        educationRecords: parseInt(stats.education_count),
        socialRecords: parseInt(stats.social_count),
        activeDays: parseInt(stats.active_days),
        publicRecords: parseInt(stats.public_count),
        averagePerMonth: months > 0 ? (parseInt(stats.total_records) / months).toFixed(2) : 0,
      },
      monthlyStats: monthlyStatsResult.rows.map(stat => ({
        month: stat.month,
        recordsCount: parseInt(stat.records_count),
      })),
      topTags: tagsResult.rows.map(tag => ({
        tag: tag.tag,
        usageCount: parseInt(tag.usage_count),
      })),
    },
    meta: {
      timestamp: new Date().toISOString(),
    },
  });
});

// 搜索成长记录
export const searchGrowthRecords = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).user?.id;

  if (!userId) {
    throw createUnauthorizedError('User not authenticated');
  }

  const { childId } = req.params;
  const {
    q: query,
    page = 1,
    limit = 20,
    category,
  } = req.query;

  if (!childId) {
    throw createError('Child ID is required', 400);
  }

  if (!query || (query as string).trim().length === 0) {
    throw createValidationError('Search query is required');
  }

  // 验证儿童是否属于当前用户
  const childResult = await db.query(
    'SELECT id, name FROM children WHERE id = $1 AND user_id = $2 AND is_active = true',
    [childId, userId]
  );

  if (childResult.rows.length === 0) {
    throw createNotFoundError('Child not found');
  }

  const child = childResult.rows[0];
  const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
  const searchTerm = `%${(query as string).trim()}%`;

  let whereClause = 'WHERE gr.child_id = $1 AND (gr.title ILIKE $2 OR gr.description ILIKE $2)';
  const params: (string | number)[] = [childId, searchTerm];

  if (category) {
    whereClause += ' AND gr.category = $3';
    params.push(String(category));
  }

  // 搜索成长记录
  const searchQuery = `
    SELECT
      gr.id, gr.title, gr.description, gr.category, gr.media_urls, gr.tags,
      gr.location, gr.is_public, gr.created_at, gr.updated_at
    FROM growth_records gr
    ${whereClause}
    ORDER BY gr.created_at DESC
    LIMIT $${params.length + 1} OFFSET $${params.length + 2}
  `;

  params.push(parseInt(limit as string), offset);

  const result = await db.query(searchQuery, params);

  // 获取总数
  const countQuery = `
    SELECT COUNT(*) as total
    FROM growth_records gr
    ${whereClause}
  `;

  const countResult = await db.query(countQuery, params.slice(0, -2));
  const total = parseInt(countResult.rows[0].total);

  res.json({
    success: true,
    data: {
      child: {
        id: child.id,
        name: child.name,
      },
      query: (query as string).trim(),
      growthRecords: result.rows.map(record => ({
        id: record.id,
        title: record.title,
        description: record.description,
        category: record.category,
        mediaUrls: record.media_urls,
        tags: record.tags,
        location: record.location,
        isPublic: record.is_public,
        createdAt: record.created_at,
        updatedAt: record.updated_at,
      })),
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string)),
      },
      filters: {
        category,
      },
    },
    meta: {
      timestamp: new Date().toISOString(),
    },
  });
});