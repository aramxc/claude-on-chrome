import { Router, Request, Response, NextFunction } from 'express';
import { validateRequest } from '../middleware/validateRequest';
import { analyzeText } from '../services/claudeService';
import { logger } from '../utils/logger';

export const claudeRouter = Router();

claudeRouter.post('/', validateRequest, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const apiKey = req.headers['x-api-key'] as string;
    const { model, messages, system, temperature, max_tokens } = req.body;

    logger.info(`Processing request for model: ${model}`);

    const response = await analyzeText({
      apiKey,
      model,
      messages,
      system,
      temperature,
      max_tokens
    });

    res.json(response);
  } catch (error) {
    next(error);
  }
});