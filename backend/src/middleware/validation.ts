import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { createValidationError } from './errorHandler';

// 验证请求中间件
export const validateRequest = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const validationErrors = errors.array().map(error => ({
      field: (error as any).param || (error as any).path,
      message: error.msg,
      value: (error as any).value,
    }));

    throw createValidationError(validationErrors);
  }

  next();
};

export default validateRequest;