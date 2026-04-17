import mongoose from 'mongoose';
import { config } from '../config';
import { logger } from '../utils/logger';

const MAX_RETRIES = 5;
const RETRY_DELAY = 5000;

let isConnected = false;
let retryCount = 0;

export const connectDB = async (): Promise<void> => {
  if (isConnected) {
    logger.info('Using existing MongoDB connection');
    return;
  }

  try {
    const conn = await mongoose.connect(config.DB_CONNECTION, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    isConnected = true;
    retryCount = 0;
    logger.info(`MongoDB connected: ${conn.connection.host}`);

    conn.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', { error: err.message });
    });

    conn.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
      isConnected = false;
    });

    conn.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected');
      isConnected = true;
    });

  } catch (error) {
    retryCount++;
    logger.error(`MongoDB connection failed (attempt ${retryCount}/${MAX_RETRIES}):`, {
      error: (error as Error).message,
    });

    if (retryCount < MAX_RETRIES) {
      logger.info(`Retrying in ${RETRY_DELAY / 1000} seconds...`);
      setTimeout(connectDB, RETRY_DELAY);
    } else {
      logger.error('Max retries reached. Could not connect to MongoDB.');
      process.exit(1);
    }
  }
};

export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.connection.close();
    isConnected = false;
    logger.info('MongoDB connection closed');
  } catch (error) {
    logger.error('Error closing MongoDB connection:', { error: (error as Error).message });
    throw error;
  }
};

export const isDBConnected = (): boolean => isConnected;
