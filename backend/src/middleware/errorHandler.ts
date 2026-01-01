import { Request, Response, NextFunction } from 'express';
import { Logger } from '@/config/logger';
import { AppError } from '@/types';

const logger = Logger.getInstance();

// ===== 错误类型定义 =====

interface ValidationErrorField {
  path: string;
  message: string;
}

interface ValidationError extends Error {
  name: 'ValidationError';
  errors: Record<string, ValidationErrorField>;
}

interface DuplicateKeyError extends Error {
  name: string;
  code: number;
  keyValue: Record<string, unknown>;
}

interface CastError extends Error {
  name: 'CastError';
  path: string;
  value: unknown;
}

interface JWTError extends Error {
  name: 'JsonWebTokenError' | 'TokenExpiredError';
  message: string;
}

interface ExtendedError extends Error {
  statusCode?: number;
  status?: string;
  isOperational?: boolean;
  code?: number;
  errors?: Record<string, ValidationErrorField>;
  keyValue?: Record<string, unknown>;
  path?: string;
  value?: unknown;
  details?: unknown;
}

// 处理已知的应用错误
const handleAppError = (err: AppError, res: Response): void => {
  logger.errorDetail(err, err.name || 'Application Error');

  res.status(err.statusCode).json({
    success: false,
    error: err.name,
    message: err.message,
    ...(err.code && { code: err.code }),
    ...(err.details && { details: err.details }),
    meta: {
      timestamp: new Date().toISOString(),
      requestId: res.locals.requestId || 'unknown',
    },
  });
};

// 处理Mongoose验证错误
const handleValidationError = (err: ValidationError, res: Response): void => {
  const errors = Object.values(err.errors).map((error: ValidationErrorField) => ({
    field: error.path,
    message: error.message,
  }));

  logger.error('Validation Error:', { errors });

  res.status(400).json({
    success: false,
    error: 'Validation Error',
    message: 'Invalid input data',
    details: errors,
    meta: {
      timestamp: new Date().toISOString(),
      requestId: res.locals.requestId || 'unknown',
    },
  });
};

// 处理MongoDB重复键错误
const handleDuplicateKeyError = (err: DuplicateKeyError, res: Response): void => {
  const field = Object.keys(err.keyValue)[0];
  const value = field ? err.keyValue[field] : undefined;

  logger.error('Duplicate Key Error:', { field, value });

  res.status(409).json({
    success: false,
    error: 'Duplicate Entry',
    message: `${field} '${value}' already exists`,
    meta: {
      timestamp: new Date().toISOString(),
      requestId: res.locals.requestId || 'unknown',
    },
  });
};

// 处理Cast错误
const handleCastError = (err: CastError, res: Response): void => {
  logger.error('Cast Error:', { path: err.path, value: err.value });

  res.status(400).json({
    success: false,
    error: 'Invalid Data',
    message: `Invalid ${err.path}: ${err.value}`,
    meta: {
      timestamp: new Date().toISOString(),
      requestId: res.locals.requestId || 'unknown',
    },
  });
};

// 处理JWT错误
const handleJWTError = (err: JWTError, res: Response): void => {
  logger.error('JWT Error:', { message: err.message });

  const message = err.name === 'JsonWebTokenError' ? 'Invalid token' : 'Token expired';
  const statusCode = err.name === 'JsonWebTokenError' ? 401 : 401;

  res.status(statusCode).json({
    success: false,
    error: 'Authentication Error',
    message,
    meta: {
      timestamp: new Date().toISOString(),
      requestId: res.locals.requestId || 'unknown',
    },
  });
};

// 发送错误响应（用于开发环境）
const sendErrorDev = (err: ExtendedError, res: Response): void => {
  logger.error('Development Error:', {
    message: err.message,
    stack: err.stack,
    status: err.statusCode,
  });

  res.status(err.statusCode || 500).json({
    success: false,
    error: err.name || 'Internal Server Error',
    message: err.message,
    stack: err.stack,
    ...(process.env.NODE_ENV === 'development' && { err }),
    meta: {
      timestamp: new Date().toISOString(),
      requestId: res.locals.requestId || 'unknown',
    },
  });
};

// 发送错误响应（用于生产环境）
const sendErrorProd = (err: ExtendedError, res: Response): void => {
  const statusCode = err.statusCode || 500;
  
  if (err.isOperational) {
    res.status(statusCode).json({
      success: false,
      error: err.name,
      message: err.message,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: res.locals.requestId || 'unknown',
      },
    });
  } else {
    // 编程错误，不泄露错误详情
    logger.error('Programming Error:', {
      message: err.message,
      stack: err.stack,
    });

    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Something went wrong',
      meta: {
        timestamp: new Date().toISOString(),
        requestId: res.locals.requestId || 'unknown',
      },
    });
  }
};

// 主错误处理中间件
export const errorHandler = (
  err: ExtendedError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // 设置请求ID
  res.locals.requestId = req.headers['x-request-id'] || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // 记录错误
  logger.error(`Error ${err.statusCode}: ${err.message}`, {
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    body: req.body,
    params: req.params,
    query: req.query,
    stack: err.stack,
  });

  // Mongoose验证错误
  if (err.name === 'ValidationError') {
    return handleValidationError(err as ValidationError, res);
  }

  // MongoDB重复键错误
  if (err.code === 11000) {
    return handleDuplicateKeyError(err as DuplicateKeyError, res);
  }

  // MongoDB Cast错误
  if (err.name === 'CastError') {
    return handleCastError(err as CastError, res);
  }

  // JWT错误
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return handleJWTError(err as JWTError, res);
  }

  // 自定义应用错误
  if (err.name === 'AppError') {
    return handleAppError(err as unknown as AppError, res);
  }

  // 根据环境发送不同的错误响应
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    sendErrorProd(err, res);
  }
};

// 404错误处理中间件
export const notFound = (req: Request, res: Response, next: NextFunction): void => {
  const error = new Error(`Can't find ${req.originalUrl} on this server!`) as ExtendedError;
  error.statusCode = 404;
  error.status = 'fail';
  error.isOperational = true;

  next(error);
};

// 异步错误捕获包装器
export const catchAsync = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// 创建自定义错误类
export class CustomError extends Error {
  public statusCode: number;
  public status: string;
  public isOperational: boolean;
  public code?: string;
  public details?: unknown;

  constructor(message: string, statusCode: number, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }
}

// 常用错误创建函数
export const createError = (
  message: string,
  statusCode: number = 500,
  details?: unknown
): CustomError => {
  return new CustomError(message, statusCode, details);
};

// 验证错误
export const createValidationError = (details: unknown): CustomError => {
  return createError('Validation failed', 400, details);
};

// 未授权错误
export const createUnauthorizedError = (message: string = 'Unauthorized'): CustomError => {
  return createError(message, 401);
};

// 禁止访问错误
export const createForbiddenError = (message: string = 'Forbidden'): CustomError => {
  return createError(message, 403);
};

// 未找到错误
export const createNotFoundError = (resource: string = 'Resource'): CustomError => {
  return createError(`${resource} not found`, 404);
};

// 冲突错误
export const createConflictError = (message: string = 'Conflict'): CustomError => {
  return createError(message, 409);
};

// 请求体过大错误
export const createPayloadTooLargeError = (message: string = 'Payload too large'): CustomError => {
  return createError(message, 413);
};

// 请求过于频繁错误
export const createTooManyRequestsError = (message: string = 'Too many requests'): CustomError => {
  return createError(message, 429);
};

// 内部服务器错误
export const createInternalServerError = (message: string = 'Internal server error'): CustomError => {
  return createError(message, 500);
};

export default errorHandler;