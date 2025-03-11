import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';

export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey) {
    const error: AppError = new Error('API key is required');
    error.statusCode = 400;
    return next(error);
  }
  
  const { model, messages } = req.body;
  
  if (!model) {
    const error: AppError = new Error('Model is required');
    error.statusCode = 400;
    return next(error);
  }
  
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    const error: AppError = new Error('Messages are required and must be an array');
    error.statusCode = 400;
    return next(error);
  }
  
  next();
};