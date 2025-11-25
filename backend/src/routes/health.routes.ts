/**
 * Health Check Routes
 * 
 * Endpoints for monitoring system health
 */

import { Router } from 'express';
import { checkPoolHealth, getPoolStats } from '../lib/db-pool.js';
import { redis } from '../lib/redis.js';
import { cacheService } from '../services/cache.service.js';

const router = Router();

/**
 * Basic health check
 * GET /health
 */
router.get('/', async (req, res) => {
  try {
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
    };

    res.json(health);
  } catch (error) {
    res.status(503).json({
      status: 'error',
      message: 'Health check failed',
    });
  }
});

/**
 * Detailed health check
 * GET /health/detailed
 */
router.get('/detailed', async (req, res) => {
  try {
    // Check database pool
    const dbHealthy = await checkPoolHealth();
    const poolStats = getPoolStats();

    // Check Redis
    let redisHealthy = false;
    try {
      if (redis) {
        await redis.ping();
        redisHealthy = true;
      }
    } catch (error) {
      redisHealthy = false;
    }

    // Memory usage
    const memoryUsage = process.memoryUsage();

    const health = {
      status: dbHealthy ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      
      services: {
        database: {
          status: dbHealthy ? 'healthy' : 'unhealthy',
          pool: {
            total: poolStats.total,
            idle: poolStats.idle,
            waiting: poolStats.waiting,
            utilization: `${Math.round(((poolStats.total - poolStats.idle) / 20) * 100)}%`,
          },
        },
        redis: {
          status: redisHealthy ? 'healthy' : 'unavailable',
          enabled: !!redis,
        },
      },
      
      system: {
        memory: {
          rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
          heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
          heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
        },
        cpu: {
          user: process.cpuUsage().user,
          system: process.cpuUsage().system,
        },
      },
    };

    const statusCode = dbHealthy ? 200 : 503;
    res.status(statusCode).json(health);
  } catch (error) {
    res.status(503).json({
      status: 'error',
      message: 'Detailed health check failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Database pool statistics
 * GET /health/pool
 */
router.get('/pool', async (req, res) => {
  try {
    const stats = getPoolStats();
    const healthy = await checkPoolHealth();

    res.json({
      status: healthy ? 'healthy' : 'unhealthy',
      pool: {
        total: stats.total,
        idle: stats.idle,
        waiting: stats.waiting,
        active: stats.total - stats.idle,
        utilization: `${Math.round(((stats.total - stats.idle) / 20) * 100)}%`,
      },
      config: {
        max: 20,
        min: 5,
        idleTimeout: '30s',
        connectionTimeout: '5s',
      },
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      message: 'Pool statistics unavailable',
    });
  }
});

/**
 * Cache statistics (Intelligent TTL)
 * GET /health/cache/:tenantId
 * GET /health/cache (uses default tenant)
 */
router.get('/cache/:tenantId', async (req, res) => {
  try {
    const tenantId = req.params.tenantId;

    // Get stats for all cache types
    const botPromptStats = await cacheService.getUpdateStats(tenantId, 'bot_prompt');
    const offeringsStats = await cacheService.getUpdateStats(tenantId, 'offerings');
    const knowledgeBaseStats = await cacheService.getUpdateStats(tenantId, 'knowledge_base');

    res.json({
      tenantId,
      cacheTypes: {
        bot_prompt: {
          updateFrequency: botPromptStats.frequency,
          ttl: botPromptStats.ttl,
          ttlHuman: `${Math.round(botPromptStats.ttl / 60)} minutes`,
          category: botPromptStats.category,
        },
        offerings: {
          updateFrequency: offeringsStats.frequency,
          ttl: offeringsStats.ttl,
          ttlHuman: `${Math.round(offeringsStats.ttl / 60)} minutes`,
          category: offeringsStats.category,
        },
        knowledge_base: {
          updateFrequency: knowledgeBaseStats.frequency,
          ttl: knowledgeBaseStats.ttl,
          ttlHuman: `${Math.round(knowledgeBaseStats.ttl / 60)} minutes`,
          category: knowledgeBaseStats.category,
        },
      },
      legend: {
        category: {
          unknown: 'No update history (using default TTL)',
          stable: '<10 updates/day (24h TTL)',
          moderate: '10-100 updates/day (1h TTL)',
          frequent: '>100 updates/day (5min TTL)',
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Cache statistics unavailable',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Default cache stats (without tenant ID)
router.get('/cache', async (req, res) => {
  try {
    const tenantId = '00000000-0000-0000-0000-000000000001'; // Default demo tenant

    const botPromptStats = await cacheService.getUpdateStats(tenantId, 'bot_prompt');
    const offeringsStats = await cacheService.getUpdateStats(tenantId, 'offerings');
    const knowledgeBaseStats = await cacheService.getUpdateStats(tenantId, 'knowledge_base');

    res.json({
      tenantId,
      note: 'Using default demo tenant. Use /health/cache/:tenantId for specific tenant.',
      cacheTypes: {
        bot_prompt: {
          updateFrequency: botPromptStats.frequency,
          ttl: botPromptStats.ttl,
          ttlHuman: `${Math.round(botPromptStats.ttl / 60)} minutes`,
          category: botPromptStats.category,
        },
        offerings: {
          updateFrequency: offeringsStats.frequency,
          ttl: offeringsStats.ttl,
          ttlHuman: `${Math.round(offeringsStats.ttl / 60)} minutes`,
          category: offeringsStats.category,
        },
        knowledge_base: {
          updateFrequency: knowledgeBaseStats.frequency,
          ttl: knowledgeBaseStats.ttl,
          ttlHuman: `${Math.round(knowledgeBaseStats.ttl / 60)} minutes`,
          category: knowledgeBaseStats.category,
        },
      },
      legend: {
        category: {
          unknown: 'No update history (using default TTL)',
          stable: '<10 updates/day (24h TTL)',
          moderate: '10-100 updates/day (1h TTL)',
          frequent: '>100 updates/day (5min TTL)',
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Cache statistics unavailable',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
