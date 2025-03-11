import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export interface AppError extends Error {
  statusCode?: number;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  
  logger.error(`Error: ${err.message}`);
  
  res.status(statusCode).json({
    error: {
      message: err.message,
      status: statusCode
    }
  });
};