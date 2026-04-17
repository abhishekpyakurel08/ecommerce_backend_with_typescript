import { Server } from 'http';
import { disconnectDB } from '../services/db.service';
import { logger } from './logger';

let server: Server | null = null;

export const setServer = (srv: Server): void => {
  server = srv;
};

const gracefulShutdown = async (signal: string): Promise<void> => {
  logger.info(`${signal} received. Starting graceful shutdown...`);

  // Close server
  if (server) {
    server.close(() => {
      logger.info('HTTP server closed');
    });
  }

  // Close database connection
  try {
    await disconnectDB();
    logger.info('Database connection closed');
  } catch (error) {
    logger.error('Error closing database connection:', { error: (error as Error).message });
  }

  logger.info('Graceful shutdown completed');
  process.exit(0);
};

export const setupGracefulShutdown = (): void => {
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', { error: error.message, stack: error.stack });
    gracefulShutdown('UNCAUGHT_EXCEPTION');
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled Rejection:', { reason });
    gracefulShutdown('UNHANDLED_REJECTION');
  });
};
