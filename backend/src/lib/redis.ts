/**
 * Redis Client
 * 
 * Upstash Redis connection for caching
 */

import { Redis } from 'ioredis';
import { logger } from '../utils/logger.js';

type RedisClient = Redis;

let redis: RedisClient | null = null;

// Only initialize if REDIS_URL is provided
if (process.env.REDIS_URL) {
  redis = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: 3,
    retryStrategy(times: number) {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    lazyConnect: true,
  });

  redis.on('error', (err: Error) => {
    logger.error('Redis connection error', { error: err.message });
  });

  redis.on('connect', () => {
    logger.info('✅ Redis connected');
  });

  // Connect
  redis.connect().catch((err: Error) => {
    logger.warn('Redis connection failed, caching disabled', { error: err.message });
    redis = null;
  });
} else {
  logger.warn('REDIS_URL not set, caching disabled');
}

export { redis };
