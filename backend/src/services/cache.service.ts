/**
 * Cache Service
 * 
 * Redis-based caching with fallback to in-memory
 */

import { redis } from '../lib/redis.js';
import { logger } from '../utils/logger.js';

// In-memory fallback cache
const memoryCache = new Map<string, { value: any; expires: number }>();

export class CacheService {
  /**
   * Cache type definitions for intelligent TTL
   */
  private readonly cacheTypes = {
    bot_prompt: { default: 3600, min: 300, max: 86400 }, // 5min - 24h
    offerings: { default: 300, min: 60, max: 3600 }, // 1min - 1h
    availability: { default: 300, min: 60, max: 1800 }, // 1min - 30min
    knowledge_base: { default: 3600, min: 300, max: 86400 }, // 5min - 24h
  };

  /**
   * Get value from cache
   */
  async get(key: string): Promise<string | null> {
    try {
      // Try Redis first
      if (redis) {
        return await redis.get(key);
      }

      // Fallback to memory cache
      const cached = memoryCache.get(key);
      if (cached && cached.expires > Date.now()) {
        return cached.value;
      }

      return null;
    } catch (error) {
      logger.error('Cache get error', { key, error });
      return null;
    }
  }

  /**
   * Set value in cache
   */
  async set(key: string, value: string, ttlSeconds: number = 3600): Promise<void> {
    try {
      // Try Redis first
      if (redis) {
        await redis.set(key, value, 'EX', ttlSeconds);
        return;
      }

      // Fallback to memory cache
      memoryCache.set(key, {
        value,
        expires: Date.now() + ttlSeconds * 1000,
      });
    } catch (error) {
      logger.error('Cache set error', { key, error });
    }
  }

  /**
   * Delete from cache
   */
  async del(key: string): Promise<void> {
    try {
      if (redis) {
        await redis.del(key);
      }
      memoryCache.delete(key);
    } catch (error) {
      logger.error('Cache delete error', { key, error });
    }
  }

  /**
   * Get bot prompt from cache
   */
  async getBotPrompt(tenantId: string): Promise<string | null> {
    const key = `bot_prompt:${tenantId}`;
    return await this.get(key);
  }

  /**
   * Cache bot prompt
   */
  async cacheBotPrompt(tenantId: string, prompt: string): Promise<void> {
    const key = `bot_prompt:${tenantId}`;
    await this.set(key, prompt, 3600); // 1 hour
  }

  /**
   * Get offerings from cache
   */
  async getOfferings(tenantId: string): Promise<any[] | null> {
    const key = `offerings:${tenantId}`;
    const cached = await this.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  /**
   * Cache offerings
   */
  async cacheOfferings(tenantId: string, offerings: any[]): Promise<void> {
    const key = `offerings:${tenantId}`;
    await this.set(key, JSON.stringify(offerings), 300); // 5 minutes
  }

  /**
   * Invalidate cache by pattern
   */
  async invalidate(pattern: string): Promise<void> {
    try {
      if (redis) {
        const keys = await redis.keys(pattern);
        if (keys.length > 0) {
          await redis.del(...keys);
        }
      } else {
        // Memory cache: delete matching keys
        const keysArray = Array.from(memoryCache.keys());
        for (const key of keysArray) {
          if (key.includes(pattern.replace('*', ''))) {
            memoryCache.delete(key);
          }
        }
      }
    } catch (error) {
      logger.error('Cache invalidate error', { pattern, error });
    }
  }

  /**
   * Clear expired entries from memory cache
   */
  clearExpired(): void {
    const now = Date.now();
    const entries = Array.from(memoryCache.entries());
    for (const [key, value] of entries) {
      if (value.expires <= now) {
        memoryCache.delete(key);
      }
    }
  }

  /**
   * Track update frequency for intelligent TTL
   */
  async trackUpdate(
    tenantId: string,
    cacheType: keyof typeof this.cacheTypes
  ): Promise<void> {
    try {
      const freqKey = `update_freq:${tenantId}:${cacheType}`;

      if (redis) {
        // Increment counter
        await redis.incr(freqKey);
        // Set expiry to 24 hours (reset daily)
        await redis.expire(freqKey, 86400);
      } else {
        // Memory fallback
        const current = memoryCache.get(freqKey);
        const count = current ? parseInt(current.value) + 1 : 1;
        memoryCache.set(freqKey, {
          value: count.toString(),
          expires: Date.now() + 86400000, // 24 hours
        });
      }

      logger.debug('Update frequency tracked', {
        tenantId,
        cacheType,
      });
    } catch (error) {
      logger.error('Failed to track update frequency', {
        tenantId,
        cacheType,
        error,
      });
    }
  }

  /**
   * Calculate intelligent TTL based on update frequency
   */
  async calculateTTL(
    tenantId: string,
    cacheType: keyof typeof this.cacheTypes
  ): Promise<number> {
    try {
      const freqKey = `update_freq:${tenantId}:${cacheType}`;
      const config = this.cacheTypes[cacheType];

      // Get update frequency
      let updateFreq = 0;

      if (redis) {
        const freq = await redis.get(freqKey);
        updateFreq = freq ? parseInt(freq) : 0;
      } else {
        const cached = memoryCache.get(freqKey);
        if (cached && cached.expires > Date.now()) {
          updateFreq = parseInt(cached.value);
        }
      }

      // Calculate TTL based on frequency
      let ttl: number;

      if (updateFreq === 0) {
        // No history, use default
        ttl = config.default;
      } else if (updateFreq > 100) {
        // Very frequent updates (>100/day): Use minimum TTL
        ttl = config.min;
      } else if (updateFreq > 10) {
        // Moderate updates (10-100/day): Use default TTL
        ttl = config.default;
      } else {
        // Infrequent updates (<10/day): Use maximum TTL
        ttl = config.max;
      }

      logger.debug('Intelligent TTL calculated', {
        tenantId,
        cacheType,
        updateFreq,
        ttl,
      });

      return ttl;
    } catch (error) {
      logger.error('Failed to calculate intelligent TTL', {
        tenantId,
        cacheType,
        error,
      });

      // Fallback to default
      return this.cacheTypes[cacheType].default;
    }
  }

  /**
   * Set with intelligent TTL
   */
  async setIntelligent(
    key: string,
    value: string,
    tenantId: string,
    cacheType: keyof typeof this.cacheTypes
  ): Promise<void> {
    const ttl = await this.calculateTTL(tenantId, cacheType);
    await this.set(key, value, ttl);

    logger.info('Cache set with intelligent TTL', {
      key,
      tenantId,
      cacheType,
      ttl,
    });
  }

  /**
   * Get update frequency statistics
   */
  async getUpdateStats(
    tenantId: string,
    cacheType: keyof typeof this.cacheTypes
  ): Promise<{
    frequency: number;
    ttl: number;
    category: 'frequent' | 'moderate' | 'stable' | 'unknown';
  }> {
    const freqKey = `update_freq:${tenantId}:${cacheType}`;

    let frequency = 0;
    if (redis) {
      const freq = await redis.get(freqKey);
      frequency = freq ? parseInt(freq) : 0;
    } else {
      const cached = memoryCache.get(freqKey);
      if (cached && cached.expires > Date.now()) {
        frequency = parseInt(cached.value);
      }
    }

    const ttl = await this.calculateTTL(tenantId, cacheType);

    let category: 'frequent' | 'moderate' | 'stable' | 'unknown';
    if (frequency === 0) {
      category = 'unknown';
    } else if (frequency > 100) {
      category = 'frequent';
    } else if (frequency > 10) {
      category = 'moderate';
    } else {
      category = 'stable';
    }

    return { frequency, ttl, category };
  }
}

export const cacheService = new CacheService();

// Clear expired entries every 5 minutes
setInterval(() => {
  cacheService.clearExpired();
}, 5 * 60 * 1000);
