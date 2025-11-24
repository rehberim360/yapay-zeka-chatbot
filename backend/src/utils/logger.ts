/**
 * Logging Utility with Winston
 * 
 * Provides structured logging with:
 * - Gemini API call logging to logs/gemini/
 * - Error logging to logs/errors/
 * - Security event logging to database
 * - Log rotation (10MB max)
 * - Structured logging with context
 * 
 * Requirements: 16.1-16.10
 */

import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Log directories
const LOG_DIR = path.join(__dirname, '../../logs');
const GEMINI_LOG_DIR = path.join(LOG_DIR, 'gemini');
const ERROR_LOG_DIR = path.join(LOG_DIR, 'errors');

// Ensure log directories exist
[LOG_DIR, GEMINI_LOG_DIR, ERROR_LOG_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Custom format for structured logging
const structuredFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.metadata(),
  winston.format.json()
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let metaStr = '';
    if (Object.keys(meta).length > 0) {
      metaStr = '\n' + JSON.stringify(meta, null, 2);
    }
    return `${timestamp} [${level}]: ${message}${metaStr}`;
  })
);

/**
 * Main application logger
 * Requirements: 16.1, 16.6
 */
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: structuredFormat,
  transports: [
    // Console output (development)
    new winston.transports.Console({
      format: consoleFormat,
      level: 'debug'
    }),
    
    // General application log
    new winston.transports.File({
      filename: path.join(LOG_DIR, 'application.log'),
      level: 'info',
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
      tailable: true
    }),
    
    // Error log
    new winston.transports.File({
      filename: path.join(ERROR_LOG_DIR, 'error.log'),
      level: 'error',
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
      tailable: true
    })
  ]
});

/**
 * Gemini API logger
 * Logs all Gemini API calls with request/response details
 * Requirements: 16.2, 16.3
 */
export const geminiLogger = winston.createLogger({
  level: 'info',
  format: structuredFormat,
  transports: [
    new winston.transports.File({
      filename: path.join(GEMINI_LOG_DIR, 'gemini-api.log'),
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 10,
      tailable: true
    })
  ]
});

/**
 * Security logger
 * Logs security events (prompt injection attempts, rate limiting, etc.)
 * Requirements: 16.6
 */
export const securityLogger = winston.createLogger({
  level: 'warn',
  format: structuredFormat,
  transports: [
    new winston.transports.File({
      filename: path.join(LOG_DIR, 'security.log'),
      level: 'warn',
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 10,
      tailable: true
    })
  ]
});

/**
 * Log Gemini API call
 * Requirements: 16.2
 */
export interface GeminiLogData {
  method: string;
  timestamp: string;
  duration_ms: number;
  tokens?: {
    prompt: number;
    response: number;
    total: number;
  };
  request_preview?: string;
  response_preview?: string;
  full_response?: string;
  error?: string;
  context?: Record<string, any>;
}

export function logGeminiCall(data: GeminiLogData): void {
  geminiLogger.info('Gemini API Call', {
    method: data.method,
    duration_ms: data.duration_ms,
    tokens: data.tokens,
    timestamp: data.timestamp,
    request_preview: data.request_preview,
    response_preview: data.response_preview,
    context: data.context
  });

  // Also log to console in development
  if (process.env.NODE_ENV !== 'production') {
    logger.debug(`Gemini API: ${data.method}`, {
      duration: `${data.duration_ms}ms`,
      tokens: data.tokens
    });
  }
}

/**
 * Log error with context
 * Requirements: 16.3, 16.6
 */
export interface ErrorLogData {
  error: Error;
  context?: Record<string, any>;
  userId?: string;
  tenantId?: string;
  jobId?: string;
  phase?: string;
}

export function logError(data: ErrorLogData): void {
  logger.error(data.error.message, {
    error: {
      name: data.error.name,
      message: data.error.message,
      stack: data.error.stack
    },
    context: data.context,
    userId: data.userId,
    tenantId: data.tenantId,
    jobId: data.jobId,
    phase: data.phase
  });
}

/**
 * Log security event
 * Requirements: 16.6
 */
export interface SecurityLogData {
  type: 'PROMPT_INJECTION_ATTEMPT' | 'RATE_LIMIT_EXCEEDED' | 'UNAUTHORIZED_ACCESS' | 'SUSPICIOUS_ACTIVITY';
  message: string;
  userId?: string;
  tenantId?: string;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, any>;
}

export function logSecurityEvent(data: SecurityLogData): void {
  securityLogger.warn('Security Event', {
    type: data.type,
    message: data.message,
    userId: data.userId,
    tenantId: data.tenantId,
    ipAddress: data.ipAddress,
    userAgent: data.userAgent,
    details: data.details,
    timestamp: new Date().toISOString()
  });

  // Also log to main logger
  logger.warn(`Security: ${data.type}`, {
    message: data.message,
    userId: data.userId
  });
}

/**
 * Log onboarding phase completion
 * Requirements: 16.7
 */
export interface PhaseLogData {
  jobId: string;
  phase: string;
  duration_ms: number;
  success: boolean;
  error?: string;
  context?: Record<string, any>;
}

export function logPhaseCompletion(data: PhaseLogData): void {
  const level = data.success ? 'info' : 'error';
  
  logger.log(level, `Phase ${data.phase} ${data.success ? 'completed' : 'failed'}`, {
    jobId: data.jobId,
    phase: data.phase,
    duration_ms: data.duration_ms,
    success: data.success,
    error: data.error,
    context: data.context
  });
}

/**
 * Log scraping activity
 * Requirements: 16.4
 */
export interface ScrapingLogData {
  url: string;
  success: boolean;
  duration_ms: number;
  markdown_length?: number;
  links_count?: number;
  error?: string;
}

export function logScraping(data: ScrapingLogData): void {
  const level = data.success ? 'info' : 'warn';
  
  logger.log(level, `Scraping ${data.success ? 'succeeded' : 'failed'}: ${data.url}`, {
    url: data.url,
    success: data.success,
    duration_ms: data.duration_ms,
    markdown_length: data.markdown_length,
    links_count: data.links_count,
    error: data.error
  });
}

/**
 * Log system prompt generation
 * Requirements: 16.8
 */
export interface SystemPromptLogData {
  tenantId: string;
  sector: string;
  bot_purpose: string;
  prompt_length: number;
  offerings_count: number;
}

export function logSystemPromptGeneration(data: SystemPromptLogData): void {
  logger.info('System prompt generated', {
    tenantId: data.tenantId,
    sector: data.sector,
    bot_purpose: data.bot_purpose,
    prompt_length: data.prompt_length,
    offerings_count: data.offerings_count
  });
}

/**
 * Log offerings saved
 * Requirements: 16.9
 */
export interface OfferingsLogData {
  tenantId: string;
  count: number;
  categories: string[];
}

export function logOfferingsSaved(data: OfferingsLogData): void {
  logger.info('Offerings saved', {
    tenantId: data.tenantId,
    count: data.count,
    categories: data.categories
  });
}

/**
 * Log onboarding completion
 * Requirements: 16.7
 */
export interface OnboardingCompletionLogData {
  jobId: string;
  tenantId: string;
  total_duration_ms: number;
  api_call_count: number;
  phases_completed: string[];
}

export function logOnboardingCompletion(data: OnboardingCompletionLogData): void {
  logger.info('Onboarding completed', {
    jobId: data.jobId,
    tenantId: data.tenantId,
    total_duration_ms: data.total_duration_ms,
    api_call_count: data.api_call_count,
    phases_completed: data.phases_completed
  });
}

/**
 * Create child logger with context
 * Useful for adding consistent context to all logs in a specific scope
 * Requirements: 16.6
 */
export function createContextLogger(context: Record<string, any>) {
  return logger.child(context);
}

// Export default logger
export default logger;
