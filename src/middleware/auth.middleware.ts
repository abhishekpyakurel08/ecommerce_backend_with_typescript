import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { TryCatch } from './error.middleware';
import ErrorHandler from '../utils/utility-class';
import { User } from '../model/user.models';
import { config } from '../config';
import { logger } from '../utils/logger';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

export const authenticate = TryCatch(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new ErrorHandler('Authentication required. Please login.', 401));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET) as { id: string; role: string };
    req.user = decoded;
    next();
  } catch (error) {
    logger.warn('Invalid token attempt', { error: (error as Error).message });
    return next(new ErrorHandler('Invalid or expired token. Please login again.', 401));
  }
});

export const adminOnly = TryCatch(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const userId = req.user?.id;

  if (!userId) {
    return next(new ErrorHandler('Authentication required', 401));
  }

  const user = await User.findById(userId);

  if (!user) {
    return next(new ErrorHandler('User not found', 404));
  }

  if (user.role !== 'admin') {
    logger.warn('Admin access attempted by non-admin user', { userId, role: user.role });
    return next(new ErrorHandler('Access denied. Admin privileges required.', 403));
  }

  next();
});

// Deprecated: Query-based auth (for backward compatibility only)
export const ADMINONLY = TryCatch(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.query;

  if (!id) {
    return next(new ErrorHandler('Please login first', 401));
  }

  const user = await User.findById(id as string);

  if (!user) {
    return next(new ErrorHandler('Invalid user ID', 401));
  }

  if (user.role !== 'admin') {
    return next(new ErrorHandler('Access denied. Admin privileges required.', 403));
  }

  next();
});