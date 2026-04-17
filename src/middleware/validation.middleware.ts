import { Request, Response, NextFunction } from 'express';
import { TryCatch } from './error.middleware';
import ErrorHandler from '../utils/utility-class';

export interface ValidationRule {
  field: string;
  required?: boolean;
  type?: 'string' | 'number' | 'boolean' | 'array' | 'object';
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean | string;
}

export const validate = (rules: ValidationRule[]) =>
  TryCatch(async (req: Request, res: Response, next: NextFunction) => {
    const errors: string[] = [];
    const body = req.body;

    for (const rule of rules) {
      const value = body[rule.field];

      // Check required
      if (rule.required && (value === undefined || value === null || value === '')) {
        errors.push(`${rule.field} is required`);
        continue;
      }

      // Skip further checks if value is not provided and not required
      if (value === undefined || value === null) {
        continue;
      }

      // Type validation
      if (rule.type) {
        const actualType = Array.isArray(value) ? 'array' : typeof value;
        if (actualType !== rule.type) {
          errors.push(`${rule.field} must be of type ${rule.type}`);
          continue;
        }
      }

      // String min/max length
      if (rule.type === 'string') {
        if (rule.min !== undefined && value.length < rule.min) {
          errors.push(`${rule.field} must be at least ${rule.min} characters`);
        }
        if (rule.max !== undefined && value.length > rule.max) {
          errors.push(`${rule.field} must be at most ${rule.max} characters`);
        }
      }

      // Number min/max
      if (rule.type === 'number') {
        if (rule.min !== undefined && value < rule.min) {
          errors.push(`${rule.field} must be at least ${rule.min}`);
        }
        if (rule.max !== undefined && value > rule.max) {
          errors.push(`${rule.field} must be at most ${rule.max}`);
        }
      }

      // Pattern validation
      if (rule.pattern && !rule.pattern.test(String(value))) {
        errors.push(`${rule.field} format is invalid`);
      }

      // Custom validation
      if (rule.custom) {
        const result = rule.custom(value);
        if (result !== true) {
          errors.push(typeof result === 'string' ? result : `${rule.field} is invalid`);
        }
      }
    }

    if (errors.length > 0) {
      return next(new ErrorHandler(errors.join(', '), 400));
    }

    next();
  });

// Common validation rules
export const commonValidations = {
  email: (field: string = 'email'): ValidationRule => ({
    field,
    required: true,
    type: 'string',
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  }),

  password: (field: string = 'password', min: number = 6): ValidationRule => ({
    field,
    required: true,
    type: 'string',
    min,
  }),

  name: (field: string = 'name', min: number = 2, max: number = 50): ValidationRule => ({
    field,
    required: true,
    type: 'string',
    min,
    max,
  }),

  mongoId: (field: string = 'id'): ValidationRule => ({
    field,
    required: true,
    type: 'string',
    pattern: /^[0-9a-fA-F]{24}$/,
  }),

  positiveNumber: (field: string): ValidationRule => ({
    field,
    required: true,
    type: 'number',
    min: 0,
  }),
};
