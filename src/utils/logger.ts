import { isDev } from '../config';

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

const currentLevel = isDev ? LogLevel.DEBUG : LogLevel.INFO;

function formatMessage(level: string, message: string, meta?: Record<string, any>): string {
  const timestamp = new Date().toISOString();
  const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
  return `[${timestamp}] ${level}: ${message}${metaStr}`;
}

export const logger = {
  error: (message: string, meta?: Record<string, any>) => {
    if (currentLevel >= LogLevel.ERROR) {
      console.error(formatMessage('ERROR', message, meta));
    }
  },

  warn: (message: string, meta?: Record<string, any>) => {
    if (currentLevel >= LogLevel.WARN) {
      console.warn(formatMessage('WARN', message, meta));
    }
  },

  info: (message: string, meta?: Record<string, any>) => {
    if (currentLevel >= LogLevel.INFO) {
      console.info(formatMessage('INFO', message, meta));
    }
  },

  debug: (message: string, meta?: Record<string, any>) => {
    if (currentLevel >= LogLevel.DEBUG) {
      console.debug(formatMessage('DEBUG', message, meta));
    }
  },
};
