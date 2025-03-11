import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';
import { claudeRouter } from './controllers/claudeController';
import { logger } from './utils/logger';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: '*', // In production, you might want to restrict this
  methods: ['POST'],
  allowedHeaders: ['Content-Type', 'x-api-key']
}));
app.use(express.json({ limit: '1mb' }));

// Routes
app.use('/api/claude', claudeRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Error handling
app.use(errorHandler);

// Start server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
  });
}

export default app;