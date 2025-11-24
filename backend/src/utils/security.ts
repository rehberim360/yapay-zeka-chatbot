/**
 * Security Utilities for Prompt Injection Protection
 */

import { logSecurityEvent } from './logger.js';

const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior|earlier)\s+instructions?/i,
  /forget\s+(all\s+)?(previous|prior|earlier)?\s*(instructions?|rules?|commands?)/i,
  /disregard\s+(all\s+)?(previous|prior)\s+instructions?/i,
  /show\s+(me\s+)?(your\s+)?(system\s+)?prompts?/i,
  /what\s+(is|are)\s+(your\s+)?(system\s+)?prompts?/i,
  /tell\s+me\s+(your\s+)?(system\s+)?prompts?/i,
  /reveal\s+(your\s+)?(system\s+)?prompts?/i,
  /you\s+are\s+now\s+(a|an)/i,
  /act\s+as\s+(a|an)/i,
  /pretend\s+(to\s+be|you\s+are)\s+(a|an)/i,
  /roleplay\s+as\s+(a|an)/i,
  /new\s+instructions?:/i,
  /updated\s+instructions?:/i,
  /override\s+(previous\s+)?instructions?/i,
  /önceki\s+talimatları?\s+unut/i,
  /sistem\s+promptunu?\s+(söyle|göster|yaz)/i,
  /kuralları?\s+unut/i,
  /sen\s+artık\s+(bir|bi)/i,
  /DAN\s+mode/i,
  /developer\s+mode/i,
  /sudo\s+mode/i,
];

const SENSITIVE_OUTPUT_PATTERNS = [
  /api[_-]?key/i,
  /password/i,
  /secret/i,
  /token/i,
  /credential/i,
  /private[_-]?key/i,
];

const HTML_SCRIPT_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
  /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
  /<embed\b[^>]*>/gi,
  /<link\b[^>]*>/gi,
  /<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi,
  /on\w+\s*=\s*["'][^"']*["']/gi,
  /javascript:/gi,
];

export const detectSuspiciousPattern = (input: string, userId?: string, tenantId?: string): boolean => {
  if (!input || typeof input !== 'string') {
    return false;
  }
  
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(input)) {
      // Log security event (Requirements: 16.6)
      const logData: any = {
        type: 'PROMPT_INJECTION_ATTEMPT',
        message: `Suspicious pattern detected in user input`,
        details: {
          pattern: pattern.toString(),
          inputPreview: input.substring(0, 100)
        }
      };
      
      if (userId) logData.userId = userId;
      if (tenantId) logData.tenantId = tenantId;
      
      logSecurityEvent(logData);
      
      return true;
    }
  }
  
  return false;
};

export const sanitizeInput = (input: string): string => {
  if (!input || typeof input !== 'string') {
    return input;
  }

  let sanitized = input;

  for (const pattern of HTML_SCRIPT_PATTERNS) {
    sanitized = sanitized.replace(pattern, '');
  }

  sanitized = sanitized.replace(/<[^>]*>/g, '');

  sanitized = sanitized
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&amp;/g, '&');

  sanitized = sanitized.replace(/<[^>]*>/g, '');

  return sanitized.trim();
};

export const filterSensitiveOutput = (output: string): string => {
  if (!output || typeof output !== 'string') {
    return output;
  }

  let filtered = output;

  // Replace sensitive patterns with [REDACTED]
  // Pattern: keyword + optional whitespace + colon/equals + optional whitespace + value
  filtered = filtered.replace(/api[_-]?key\s*[:\s=]+\s*\S+/gi, 'api_key: [REDACTED]');
  filtered = filtered.replace(/password\s*[:\s=]+\s*\S+/gi, 'password: [REDACTED]');
  filtered = filtered.replace(/secret\s*[:\s=]+\s*\S+/gi, 'secret: [REDACTED]');
  filtered = filtered.replace(/token\s*[:\s=]+\s*\S+/gi, 'token: [REDACTED]');
  filtered = filtered.replace(/credential\s*[:\s=]+\s*\S+/gi, 'credential: [REDACTED]');
  filtered = filtered.replace(/private[_-]?key\s*[:\s=]+\s*\S+/gi, 'private_key: [REDACTED]');

  return filtered;
};

export const getSafeResponse = (language: string = 'tr-TR'): string => {
  const isTurkish = language.startsWith('tr');

  if (isTurkish) {
    return 'Üzgünüm, bu tür bir talepte bulunamam. Size nasıl yardımcı olabilirim? 😊';
  } else {
    return "I'm sorry, I cannot fulfill that type of request. How can I help you? 😊";
  }
};

export const logSuspiciousActivity = async (
  userId: string,
  tenantId: string,
  message: string,
  detectedPattern: string
): Promise<void> => {
  console.warn('[SECURITY] Suspicious activity detected:', {
    timestamp: new Date().toISOString(),
    userId,
    tenantId,
    message: message.substring(0, 100),
    detectedPattern,
  });
  
  // TODO: Save to database security_logs table when available
  // await db.security_logs.insert({
  //   tenant_id: tenantId,
  //   user_id: userId,
  //   message: message.substring(0, 500),
  //   type: 'PROMPT_INJECTION_ATTEMPT',
  //   detected_pattern: detectedPattern,
  //   timestamp: new Date(),
  // });
};

// Import rate limiter at module level
import { 
  isUserBlocked, 
  recordSuspiciousActivity, 
  logRateLimitViolation 
} from '../middleware/rate-limiter.js';

export const processMessageWithSecurity = async (
  message: string,
  userId: string,
  tenantId: string,
  language: string = 'tr-TR'
): Promise<{ isSafe: boolean; message: string; wasSanitized: boolean; isBlocked?: boolean }> => {
  // Check if user is already blocked
  if (isUserBlocked(userId)) {
    return {
      isSafe: false,
      message: getSafeResponse(language),
      wasSanitized: false,
      isBlocked: true,
    };
  }
  
  const sanitized = sanitizeInput(message);
  const wasSanitized = sanitized !== message;

  const isSuspicious = detectSuspiciousPattern(sanitized);

  if (isSuspicious) {
    await logSuspiciousActivity(userId, tenantId, sanitized, 'INJECTION_ATTEMPT');
    
    // Record suspicious activity and check if user should be blocked
    const shouldBlock = recordSuspiciousActivity(userId);
    
    if (shouldBlock) {
      await logRateLimitViolation(userId, tenantId, sanitized);
    }

    return {
      isSafe: false,
      message: getSafeResponse(language),
      wasSanitized,
      isBlocked: shouldBlock,
    };
  }

  return {
    isSafe: true,
    message: sanitized,
    wasSanitized,
  };
};

export const sanitizeChatbotResponse = (response: string): string => {
  if (!response || typeof response !== 'string') {
    return response;
  }

  let sanitized = filterSensitiveOutput(response);
  sanitized = sanitizeInput(sanitized);

  return sanitized;
};
