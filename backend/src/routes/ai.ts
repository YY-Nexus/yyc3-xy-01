import { Router } from 'express';
import { body } from 'express-validator';
import {
  chat,
  getConversationHistory,
  getSessions,
  deleteConversation,
  getAIRoles,
  analyzeEmotionEndpoint,
  getChatStats,
} from '@/controllers/aiController';
import { authMiddleware } from '@/middleware/auth';
import { aiRateLimitMiddleware } from '@/middleware/rateLimiter';
import { validateRequest } from '@/middleware/validation';

const router = Router();

// 应用认证中间件到所有路由
router.use(authMiddleware);

// 输入验证规则
const chatValidation = [
  body('childId')
    .isUUID()
    .withMessage('Invalid child ID format'),
  body('message')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Message must be between 1 and 2000 characters'),
  body('aiRole')
    .isIn(['recorder', 'guardian', 'listener', 'advisor', 'cultural_mentor'])
    .withMessage('Invalid AI role'),
  body('sessionId')
    .optional()
    .isUUID()
    .withMessage('Invalid session ID format'),
];

const emotionAnalysisValidation = [
  body('text')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Text must be between 1 and 1000 characters'),
  body('childAge')
    .optional()
    .isInt({ min: 0, max: 18 })
    .withMessage('Child age must be between 0 and 18'),
];

// AI聊天路由
router.post('/chat', aiRateLimitMiddleware, chatValidation, validateRequest, chat);
router.post('/analyze-emotion', aiRateLimitMiddleware, emotionAnalysisValidation, validateRequest, analyzeEmotionEndpoint);

// AI角色信息
router.get('/roles', getAIRoles);

// 对话历史和会话管理
router.get('/children/:childId/conversations', getConversationHistory);
router.get('/children/:childId/sessions', getSessions);
router.delete('/conversations/:conversationId', deleteConversation);

// AI聊天统计
router.get('/children/:childId/stats', getChatStats);

export default router;