import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from './logger.js';

export async function connectDatabase() {
  await mongoose.connect(env.MONGODB_URI);
  logger.info('MongoDB connected');
}
export const disconnectDatabase = () => mongoose.disconnect();
export const isDatabaseReady = () => mongoose.connection.readyState === 1;