import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

interface Config {
  NODE_ENV: string;
  PORT: number;
  DB_CONNECTION: string;
  STRIPE_KEY: string;
  JWT_SECRET: string;
  JWT_EXPIRE: string;
  PRODUCT_PER_PAGE: number;
  CORS_ORIGIN: string;
  RATE_LIMIT_WINDOW_MS: number;
  RATE_LIMIT_MAX: number;
}

function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key] || defaultValue;
  if (!value && defaultValue === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value!;
}

function getEnvNumber(key: string, defaultValue: number): number {
  const value = process.env[key];
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) {
    throw new Error(`Environment variable ${key} must be a valid number`);
  }
  return parsed;
}

export const config: Config = {
  NODE_ENV: getEnvVar('NODE_ENV', 'development'),
  PORT: getEnvNumber('PORT', 8000),
  DB_CONNECTION: getEnvVar('DB_CONNECTION', 'mongodb://localhost:27017/ecommerce'),
  STRIPE_KEY: getEnvVar('STRIPE_KEY', ''),
  JWT_SECRET: getEnvVar('JWT_SECRET', 'default-secret-change-in-production'),
  JWT_EXPIRE: getEnvVar('JWT_EXPIRE', '7d'),
  PRODUCT_PER_PAGE: getEnvNumber('PRODUCT_PER_PAGE', 8),
  CORS_ORIGIN: getEnvVar('CORS_ORIGIN', 'http://localhost:5173'),
  RATE_LIMIT_WINDOW_MS: getEnvNumber('RATE_LIMIT_WINDOW_MS', 15 * 60 * 1000),
  RATE_LIMIT_MAX: getEnvNumber('RATE_LIMIT_MAX', 100),
};

export const isDev = config.NODE_ENV === 'development';
export const isProd = config.NODE_ENV === 'production';
