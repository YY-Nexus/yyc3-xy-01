import { Router } from 'express';
import { body } from 'express-validator';
import {
  register,
  login,
  logout,
  getProfile,
  updateProfile,
  changePassword,
  getSessions,
  deleteSession,
} from '@/controllers/authController';
import { authMiddleware, refreshTokenMiddleware } from '@/middleware/auth';
import { authRateLimitMiddleware, passwordResetRateLimitMiddleware } from '@/middleware/rateLimiter';
import { validateRequest } from '@/middleware/validation';

const router = Router();

// 输入验证规则
const registerValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  body('firstName')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('First name must be between 1 and 100 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Last name must be between 1 and 100 characters'),
  body('phone')
    .optional()
    .isMobilePhone('any')
    .withMessage('Please provide a valid phone number'),
];

const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one lowercase letter, one uppercase letter, and one number'),
];

const updateProfileValidation = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('First name must be between 1 and 100 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Last name must be between 1 and 100 characters'),
  body('phone')
    .optional()
    .isMobilePhone('any')
    .withMessage('Please provide a valid phone number'),
  body('avatarUrl')
    .optional()
    .isURL()
    .withMessage('Avatar URL must be a valid URL'),
];

// 公开路由（不需要认证）
router.post('/register', authRateLimitMiddleware, registerValidation, validateRequest, register);
router.post('/login', authRateLimitMiddleware, loginValidation, validateRequest, login);
router.post('/refresh-token', refreshTokenMiddleware);

// 需要认证的路由
router.use(authMiddleware); // 应用认证中间件到以下所有路由

router.get('/profile', getProfile);
router.put('/profile', updateProfileValidation, validateRequest, updateProfile);
router.put('/change-password', passwordResetRateLimitMiddleware, changePasswordValidation, validateRequest, changePassword);
router.post('/logout', logout);

// 会话管理
router.get('/sessions', getSessions);
router.delete('/sessions/:id', deleteSession);

export default router;