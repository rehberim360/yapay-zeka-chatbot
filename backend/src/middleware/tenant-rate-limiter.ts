/**
 * Tenant-Based Rate Limiting Middleware
 * 
 * Plan-based rate limiting with Redis backend
 * - Free: 20 req/10s
 * - Basic: 50 req/10s
 * - Premium: 100 req/10s
 * - Enterprise: 200 req/10s
 */

import type { Request, Response, NextFunction } from 'express';
import { redis } from '../lib/redis.js';
import { supabase } from '../lib/supabase.js';
import { logger } from '../utils/logger.js';

// Plan-based rate limits (requests per 10 seconds)
const RATE_LIMITS = {
  free: 20,
  basic: 50,
  premium: 100,
  enterprise: 200,
  anonymous: 10, // For unauthenticated requests
} as const;

// Window duration in seconds
const WINDOW_DURATION = 10;

interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * Get tenant's plan from database (with caching)
 */
async function getTenantPlan(tenantId: string): Promise<keyof typeof RATE_LIMITS> {
  if (!redis) {
    return 'free'; // Default if Redis not available
  }

  try {
    // Check cache first
    const cacheKey = `tenant:plan:${tenantId}`;
    const cached = await redis.get(cacheKey);
    
    if (cached) {
      return cached as keyof typeof RATE_LIMITS;
    }

    // Fetch from database
    const { data: tenant, error } = await supabase
      .from('tenants')
      .select('plan')
      .eq('id', tenantId)
      .single();

    if (error || !tenant) {
      logger.warn('Failed to fetch tenant plan', { tenantId, error });
      return 'free';
    }

    const plan = (tenant.plan || 'free') as keyof typeof RATE_LIMITS;

    // Cache for 5 minutes
    await redis.setex(cacheKey, 300, plan);

    return plan;
  } catch (error) {
    logger.error('Error fetching tenant plan', { tenantId, error });
    return 'free';
  }
}

/**
 * Check rate limit for a tenant
 */
async function checkRateLimit(
  tenantId: string,
  ip: string
): Promise<RateLimitInfo> {
  if (!redis) {
    // If Redis not available, allow all requests
    return {
      limit: 1000,
      remaining: 1000,
      reset: Date.now() + WINDOW_DURATION * 1000,
    };
  }

  try {
    // Get tenant's plan
    const plan = await getTenantPlan(tenantId);
    const limit = RATE_LIMITS[plan];

    // Create rate limit key
    const key = `rl:tenant:${tenantId}:${ip}`;
    const now = Date.now();
    const windowStart = now - (WINDOW_DURATION * 1000);

    // Use Redis sorted set for sliding window
    const multi = redis.multi();
    
    // Remove old entries
    multi.zremrangebyscore(key, 0, windowStart);
    
    // Add current request
    multi.zadd(key, now, `${now}`);
    
    // Count requests in window
    multi.zcard(key);
    
    // Set expiry
    multi.expire(key, WINDOW_DURATION * 2);

    const results = await multi.exec();
    
    if (!results) {
      throw new Error('Redis multi exec failed');
    }

    // Get count from zcard result
    const count = results[2][1] as number;
    const remaining = Math.max(0, limit - count);
    const reset = now + (WINDOW_DURATION * 1000);

    return {
      limit,
      remaining,
      reset,
    };
  } catch (error) {
    logger.error('Rate limit check failed', { tenantId, error });
    
    // Fail open - allow request if Redis fails
    return {
      limit: 1000,
      remaining: 1000,
      reset: Date.now() + WINDOW_DURATION * 1000,
    };
  }
}

/**
 * Tenant-based rate limiting middleware
 */
export async function tenantRateLimiter(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Extract tenant ID
    const tenantId = (req as any).user?.tenantId || 
                     req.body?.tenantId || 
                     req.query?.tenantId as string ||
                     'anonymous';

    // Get client IP
    const ip = req.ip || 
               req.headers['x-forwarded-for'] as string || 
               req.socket.remoteAddress || 
               'unknown';

    // Check rate limit
    const rateLimitInfo = await checkRateLimit(tenantId, ip);

    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', rateLimitInfo.limit);
    res.setHeader('X-RateLimit-Remaining', rateLimitInfo.remaining);
    res.setHeader('X-RateLimit-Reset', rateLimitInfo.reset);

    // Check if limit exceeded
    if (rateLimitInfo.remaining <= 0) {
      logger.warn('Rate limit exceeded', {
        tenantId,
        ip,
        limit: rateLimitInfo.limit,
      });

      res.status(429).json({
        error: 'RATE_LIMIT_EXCEEDED',
        message: 'Çok fazla istek gönderdiniz. Lütfen birkaç saniye bekleyin.',
        limit: rateLimitInfo.limit,
        remaining: rateLimitInfo.remaining,
        reset: rateLimitInfo.reset,
        retryAfter: WINDOW_DURATION,
      });
      return;
    }

    // Continue to next middleware
    next();
  } catch (error) {
    logger.error('Rate limiter middleware error', { error });
    
    // Fail open - allow request if middleware fails
    next();
  }
}

/**
 * Gemini token limit checker
 * Tracks daily token usage per tenant
 */
export async function checkTokenLimit(
  tenantId: string,
  tokens: number
): Promise<void> {
  if (!redis) {
    return; // Skip if Redis not available
  }

  try {
    // Token limits per plan (daily)
    const TOKEN_LIMITS = {
      free: 100000,      // 100k tokens/day
      basic: 500000,     // 500k tokens/day
      premium: 2000000,  // 2M tokens/day
      enterprise: 10000000, // 10M tokens/day
    };

    // Get tenant plan
    const plan = await getTenantPlan(tenantId);
    const limit = TOKEN_LIMITS[plan as keyof typeof TOKEN_LIMITS] || TOKEN_LIMITS.free;

    // Get current usage
    const key = `tokens:${tenantId}:daily`;
    const usedStr = await redis.get(key);
    const used = parseInt(usedStr || '0');

    // Check if limit exceeded
    if (used + tokens > limit) {
      logger.warn('Token limit exceeded', {
        tenantId,
        plan,
        used,
        limit,
        requested: tokens,
      });

      throw new Error(
        `Günlük token limitiniz aşıldı (${used}/${limit}). ` +
        `Lütfen planınızı yükseltin veya yarın tekrar deneyin.`
      );
    }

    // Increment usage
    const newUsage = await redis.incrby(key, tokens);

    // Set expiry to end of day (if not already set)
    const ttl = await redis.ttl(key);
    if (ttl === -1) {
      // Calculate seconds until midnight
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      const secondsUntilMidnight = Math.floor((midnight.getTime() - now.getTime()) / 1000);
      
      await redis.expire(key, secondsUntilMidnight);
    }

    logger.info('Token usage tracked', {
      tenantId,
      plan,
      used: newUsage,
      limit,
      remaining: limit - newUsage,
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('token limitiniz')) {
      throw error; // Re-throw token limit errors
    }
    
    logger.error('Token limit check failed', { tenantId, error });
    // Don't throw - fail open
  }
}

/**
 * Get current token usage for a tenant
 */
export async function getTokenUsage(tenantId: string): Promise<{
  used: number;
  limit: number;
  remaining: number;
  resetAt: Date;
}> {
  if (!redis) {
    return {
      used: 0,
      limit: 100000,
      remaining: 100000,
      resetAt: new Date(),
    };
  }

  try {
    const TOKEN_LIMITS = {
      free: 100000,
      basic: 500000,
      premium: 2000000,
      enterprise: 10000000,
    };

    const plan = await getTenantPlan(tenantId);
    const limit = TOKEN_LIMITS[plan as keyof typeof TOKEN_LIMITS] || TOKEN_LIMITS.free;

    const key = `tokens:${tenantId}:daily`;
    const usedStr = await redis.get(key);
    const used = parseInt(usedStr || '0');

    // Calculate reset time (midnight)
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);

    return {
      used,
      limit,
      remaining: Math.max(0, limit - used),
      resetAt: midnight,
    };
  } catch (error) {
    logger.error('Failed to get token usage', { tenantId, error });
    
    return {
      used: 0,
      limit: 100000,
      remaining: 100000,
      resetAt: new Date(),
    };
  }
}
