import Redis from 'ioredis';
import { env } from './env.js';
import { logger } from './logger.js';

export const redis = new Redis(env.REDIS_URL, { lazyConnect: true, maxRetriesPerRequest: 2 });
redis.on('error', () => logger.warn('Redis error')); // no details: the message may contain the URL

export const connectRedis = () => redis.connect();
export const disconnectRedis = () => redis.quit();
export const isRedisReady = async () => {
  try {
    return (await redis.ping()) === 'PONG';
  } catch {
    return false;
  }
};