/**
 * Cache Invalidation Middleware
 * 
 * Tracks updates and invalidates cache when data changes
 */

import { Request, Response, NextFunction } from 'express';
import { cacheService } from '../services/cache.service.js';
import { logger } from '../utils/logger.js';

/**
 * Track bot config updates
 */
export async function trackBotConfigUpdate(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Store original send function
  const originalSend = res.send;

  // Override send function
  res.send = function (data: any): Response {
    // Only track on successful updates (2xx status codes)
    if (res.statusCode >= 200 && res.statusCode < 300) {
      const tenantId = req.body?.tenant_id || req.params?.tenant_id || req.query?.tenant_id;

      if (tenantId) {
        // Track update asynchronously (don't block response)
        cacheService
          .trackUpdate(tenantId as string, 'bot_prompt')
          .then(() => {
            logger.debug('Bot config update tracked', { tenantId });
          })
          .catch((error) => {
            logger.error('Failed to track bot config update', {
              tenantId,
              error,
            });
          });

        // Invalidate cache
        cacheService
          .invalidate(`bot_prompt:${tenantId}`)
          .then(() => {
            logger.debug('Bot prompt cache invalidated', { tenantId });
          })
          .catch((error) => {
            logger.error('Failed to invalidate bot prompt cache', {
              tenantId,
              error,
            });
          });
      }
    }

    // Call original send
    return originalSend.call(this, data);
  };

  next();
}

/**
 * Track offerings updates
 */
export async function trackOfferingsUpdate(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const originalSend = res.send;

  res.send = function (data: any): Response {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      const tenantId = req.body?.tenant_id || req.params?.tenant_id || req.query?.tenant_id;

      if (tenantId) {
        // Track update
        cacheService
          .trackUpdate(tenantId as string, 'offerings')
          .then(() => {
            logger.debug('Offerings update tracked', { tenantId });
          })
          .catch((error) => {
            logger.error('Failed to track offerings update', {
              tenantId,
              error,
            });
          });

        // Invalidate cache
        cacheService
          .invalidate(`offerings:${tenantId}`)
          .then(() => {
            logger.debug('Offerings cache invalidated', { tenantId });
          })
          .catch((error) => {
            logger.error('Failed to invalidate offerings cache', {
              tenantId,
              error,
            });
          });
      }
    }

    return originalSend.call(this, data);
  };

  next();
}

/**
 * Track knowledge base updates
 */
export async function trackKnowledgeBaseUpdate(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const originalSend = res.send;

  res.send = function (data: any): Response {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      const tenantId = req.body?.tenant_id || req.params?.tenant_id || req.query?.tenant_id;

      if (tenantId) {
        // Track update
        cacheService
          .trackUpdate(tenantId as string, 'knowledge_base')
          .then(() => {
            logger.debug('Knowledge base update tracked', { tenantId });
          })
          .catch((error) => {
            logger.error('Failed to track knowledge base update', {
              tenantId,
              error,
            });
          });

        // Invalidate cache
        cacheService
          .invalidate(`knowledge_base:${tenantId}`)
          .then(() => {
            logger.debug('Knowledge base cache invalidated', { tenantId });
          })
          .catch((error) => {
            logger.error('Failed to invalidate knowledge base cache', {
              tenantId,
              error,
            });
          });
      }
    }

    return originalSend.call(this, data);
  };

  next();
}
