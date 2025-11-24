/**
 * Rate Limiting Middleware for Suspicious Activity
 * Tracks suspicious message count per user and implements temporary blocking
 */

import { logSecurityEvent } from '../utils/logger.js';

interface UserActivity {
  suspiciousCount: number;
  blockedUntil: Date | null;
  lastActivity: Date;
}

// In-memory store for user activity tracking
const userActivityStore = new Map<string, UserActivity>();

// Configuration
const MAX_SUSPICIOUS_MESSAGES = 5;
const BLOCK_DURATION_MS = 5 * 60 * 1000; // 5 minutes
const CLEANUP_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Clean up old entries from the store periodically
 */
const cleanupOldEntries = () => {
  const now = new Date();
  const expirationTime = 30 * 60 * 1000; // 30 minutes

  for (const [userId, activity] of userActivityStore.entries()) {
    const timeSinceLastActivity = now.getTime() - activity.lastActivity.getTime();
    
    // Remove if not blocked and no activity for 30 minutes
    if (!activity.blockedUntil && timeSinceLastActivity > expirationTime) {
      userActivityStore.delete(userId);
    }
    
    // Remove if block has expired and no recent activity
    if (activity.blockedUntil && activity.blockedUntil < now && timeSinceLastActivity > expirationTime) {
      userActivityStore.delete(userId);
    }
  }
};

// Start cleanup interval
setInterval(cleanupOldEntries, CLEANUP_INTERVAL_MS);

/**
 * Get or create user activity record
 */
const getUserActivity = (userId: string): UserActivity => {
  let activity = userActivityStore.get(userId);
  
  if (!activity) {
    activity = {
      suspiciousCount: 0,
      blockedUntil: null,
      lastActivity: new Date(),
    };
    userActivityStore.set(userId, activity);
  }
  
  return activity;
};

/**
 * Check if user is currently blocked
 */
export const isUserBlocked = (userId: string): boolean => {
  const activity = getUserActivity(userId);
  
  if (!activity.blockedUntil) {
    return false;
  }
  
  const now = new Date();
  
  // Check if block has expired
  if (activity.blockedUntil <= now) {
    // Reset the block
    activity.blockedUntil = null;
    activity.suspiciousCount = 0;
    return false;
  }
  
  return true;
};

/**
 * Get remaining block time in seconds
 */
export const getRemainingBlockTime = (userId: string): number => {
  const activity = getUserActivity(userId);
  
  if (!activity.blockedUntil) {
    return 0;
  }
  
  const now = new Date();
  const remainingMs = activity.blockedUntil.getTime() - now.getTime();
  
  return Math.max(0, Math.ceil(remainingMs / 1000));
};

/**
 * Record a suspicious message attempt
 * Returns true if user should be blocked
 */
export const recordSuspiciousActivity = (userId: string): boolean => {
  const activity = getUserActivity(userId);
  
  activity.suspiciousCount += 1;
  activity.lastActivity = new Date();
  
  // Check if threshold exceeded
  if (activity.suspiciousCount >= MAX_SUSPICIOUS_MESSAGES) {
    const now = new Date();
    activity.blockedUntil = new Date(now.getTime() + BLOCK_DURATION_MS);
    return true;
  }
  
  return false;
};

/**
 * Log rate limit violation to database
 */
export const logRateLimitViolation = async (
  userId: string,
  tenantId: string,
  message: string
): Promise<void> => {
  const activity = getUserActivity(userId);
  
  console.warn('[RATE_LIMIT] User blocked for suspicious activity:', {
    timestamp: new Date().toISOString(),
    userId,
    tenantId,
    suspiciousCount: activity.suspiciousCount,
    blockedUntil: activity.blockedUntil?.toISOString(),
    message: message.substring(0, 100),
  });
  
  // Log security event (Requirements: 16.6)
  logSecurityEvent({
    type: 'RATE_LIMIT_EXCEEDED',
    message: `User blocked for suspicious activity: ${activity.suspiciousCount} attempts`,
    userId,
    tenantId,
    details: {
      suspiciousCount: activity.suspiciousCount,
      blockedUntil: activity.blockedUntil?.toISOString(),
      messagePreview: message.substring(0, 100)
    }
  });
};

/**
 * Reset user's suspicious activity count (for testing or manual reset)
 */
export const resetUserActivity = (userId: string): void => {
  userActivityStore.delete(userId);
};

/**
 * Get user's current suspicious message count (for testing)
 */
export const getUserSuspiciousCount = (userId: string): number => {
  const activity = userActivityStore.get(userId);
  return activity?.suspiciousCount || 0;
};

/**
 * Express middleware for rate limiting
 */
export const rateLimitMiddleware = (req: any, res: any, next: any) => {
  const userId = req.user?.id || req.body?.userId || 'anonymous';
  
  if (isUserBlocked(userId)) {
    const remainingTime = getRemainingBlockTime(userId);
    
    return res.status(429).json({
      error: 'TOO_MANY_SUSPICIOUS_REQUESTS',
      message: 'Çok fazla şüpheli mesaj gönderdiniz. Lütfen daha sonra tekrar deneyin.',
      remainingTime,
      blockedUntil: getUserActivity(userId).blockedUntil,
    });
  }
  
  next();
};
