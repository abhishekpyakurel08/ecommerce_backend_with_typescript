import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cors from 'cors';
import { Express, Request, Response } from 'express';
import { config } from '../config';
import { logger } from '../utils/logger';

export const setupSecurityMiddleware = (app: Express): void => {
  // Helmet for security headers
  app.use(helmet());

  // CORS configuration
  const corsOptions = {
    origin: config.CORS_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  };
  app.use(cors(corsOptions));

  // Rate limiting
  const limiter = rateLimit({
    windowMs: config.RATE_LIMIT_WINDOW_MS,
    max: config.RATE_LIMIT_MAX,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
      logger.warn('Rate limit exceeded', {
        ip: req.ip,
        path: req.path,
      });
      res.status(429).json({
        success: false,
        message: 'Too many requests, please try again later.',
      });
    },
  });
  app.use('/api/', limiter);

  // Stricter rate limit for auth routes
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts
    skipSuccessfulRequests: true,
    handler: (req: Request, res: Response) => {
      logger.warn('Auth rate limit exceeded', { ip: req.ip });
      res.status(429).json({
        success: false,
        message: 'Too many authentication attempts, please try again later.',
      });
    },
  });
  app.use('/api/v1/user/register', authLimiter);
};
