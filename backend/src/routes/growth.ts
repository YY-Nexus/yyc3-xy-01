import { Router } from 'express';
import { body } from 'express-validator';
import {
  createGrowthRecord,
  getGrowthRecords,
  getGrowthRecord,
  updateGrowthRecord,
  deleteGrowthRecord,
  getGrowthStats,
  searchGrowthRecords,
} from '@/controllers/growthController';
import { authMiddleware } from '@/middleware/auth';
import { uploadRateLimitMiddleware } from '@/middleware/rateLimiter';
import { validateRequest } from '@/middleware/validation';

const router = Router();

// 应用认证中间件到所有路由
router.use(authMiddleware);

// 输入验证规则
const createGrowthRecordValidation = [
  body('childId')
    .isUUID()
    .withMessage('Invalid child ID format'),
  body('title')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Title must be between 1 and 255 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),
  body('category')
    .isIn(['milestone', 'daily', 'achievement', 'health', 'education', 'social'])
    .withMessage('Invalid category'),
  body('mediaUrls')
    .optional()
    .isArray()
    .withMessage('Media URLs must be an array'),
  body('mediaUrls.*')
    .optional()
    .isURL()
    .withMessage('Each media URL must be a valid URL'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each tag must be between 1 and 50 characters'),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Location cannot exceed 255 characters'),
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean'),
];

const updateGrowthRecordValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Title must be between 1 and 255 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),
  body('category')
    .optional()
    .isIn(['milestone', 'daily', 'achievement', 'health', 'education', 'social'])
    .withMessage('Invalid category'),
  body('mediaUrls')
    .optional()
    .isArray()
    .withMessage('Media URLs must be an array'),
  body('mediaUrls.*')
    .optional()
    .isURL()
    .withMessage('Each media URL must be a valid URL'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each tag must be between 1 and 50 characters'),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Location cannot exceed 255 characters'),
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean'),
];

// 成长记录CRUD操作
router.post(
  '/',
  uploadRateLimitMiddleware,
  createGrowthRecordValidation,
  validateRequest,
  createGrowthRecord
);

router.get('/children/:childId', getGrowthRecords);
router.get('/children/:childId/stats', getGrowthStats);
router.get('/children/:childId/search', searchGrowthRecords);
router.get('/:recordId', getGrowthRecord);

router.put(
  '/:recordId',
  updateGrowthRecordValidation,
  validateRequest,
  updateGrowthRecord
);

router.delete('/:recordId', deleteGrowthRecord);

export default router;