/**
 * Error Recovery Utilities
 * 
 * Provides retry logic and error handling for various operations:
 * - Puppeteer scraping failures (3 retries, exponential backoff)
 * - Gemini API failures (1 retry, 5s delay)
 * - Error continuation (log and continue with remaining items)
 * 
 * Requirements: 13.1-13.10, 4.14
 */

export interface RetryOptions {
  maxRetries: number;
  delays: number[]; // Delay in ms for each retry attempt
  onRetry?: (attempt: number, error: Error) => void;
  operationName?: string;
}

export interface ErrorRecoveryResult<T> {
  success: boolean;
  data?: T;
  error?: Error;
  attempts: number;
}

/**
 * Retry an operation with exponential backoff
 * 
 * Requirements: 4.13, 13.1
 */
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  options: RetryOptions
): Promise<T> {
  const { maxRetries, delays, onRetry, operationName = 'Operation' } = options;
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        const delay = delays[attempt - 1] || delays[delays.length - 1];
        console.log(`⏱️ ${operationName}: Waiting ${delay}ms before retry ${attempt}/${maxRetries}...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      const result = await operation();
      
      if (attempt > 0) {
        console.log(`✅ ${operationName}: Succeeded on attempt ${attempt + 1}`);
      }
      
      return result;
    } catch (error) {
      lastError = error as Error;
      
      if (attempt < maxRetries) {
        console.warn(`⚠️ ${operationName}: Attempt ${attempt + 1} failed: ${lastError.message}`);
        
        if (onRetry) {
          onRetry(attempt + 1, lastError);
        }
      } else {
        console.error(`❌ ${operationName}: All ${maxRetries + 1} attempts failed`);
      }
    }
  }

  throw lastError!;
}

/**
 * Retry Puppeteer scraping operation
 * 3 retries with exponential backoff: 3s, 6s, 12s
 * 
 * Requirements: 4.13, 13.1
 */
export async function retryPuppeteerOperation<T>(
  operation: () => Promise<T>,
  operationName: string = 'Puppeteer operation'
): Promise<T> {
  return retryWithBackoff(operation, {
    maxRetries: 3,
    delays: [3000, 6000, 12000], // 3s, 6s, 12s
    operationName,
    onRetry: (attempt, error) => {
      console.warn(`🔄 Puppeteer retry ${attempt}/3: ${error.message}`);
    }
  });
}

/**
 * Retry Gemini API operation
 * 1 retry with 5s delay
 * 
 * Requirements: 13.3
 */
export async function retryGeminiOperation<T>(
  operation: () => Promise<T>,
  operationName: string = 'Gemini API call'
): Promise<T> {
  return retryWithBackoff(operation, {
    maxRetries: 1,
    delays: [5000], // 5s delay
    operationName,
    onRetry: (attempt, error) => {
      console.warn(`🔄 Gemini API retry ${attempt}/1: ${error.message}`);
    }
  });
}

/**
 * Process items with error continuation
 * If one item fails, log the error and continue with remaining items
 * 
 * Requirements: 4.14, 13.2
 */
export async function processWithErrorContinuation<T, R>(
  items: T[],
  processor: (item: T, index: number) => Promise<R>,
  options: {
    operationName?: string;
    onItemError?: (item: T, index: number, error: Error) => void;
  } = {}
): Promise<{
  results: R[];
  errors: Array<{ item: T; index: number; error: Error }>;
}> {
  const { operationName = 'Processing', onItemError } = options;
  const results: R[] = [];
  const errors: Array<{ item: T; index: number; error: Error }> = [];

  console.log(`📦 ${operationName}: Processing ${items.length} items with error continuation`);

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (!item) continue; // Skip undefined items
    
    try {
      const result = await processor(item, i);
      results.push(result);
      console.log(`✅ ${operationName}: Item ${i + 1}/${items.length} processed successfully`);
    } catch (error) {
      const err = error as Error;
      console.error(`❌ ${operationName}: Item ${i + 1}/${items.length} failed: ${err.message}`);
      errors.push({ item, index: i, error: err });
      
      if (onItemError) {
        onItemError(item, i, err);
      }
      
      // Continue with remaining items (Requirements: 4.14, 13.2)
      console.log(`⏭️ ${operationName}: Continuing with remaining items...`);
    }
  }

  console.log(`📊 ${operationName}: Completed ${results.length}/${items.length} items, ${errors.length} errors`);

  return { results, errors };
}

/**
 * Get user-friendly error message
 * Converts technical errors into readable messages
 * 
 * Requirements: 13.4
 */
export function getUserFriendlyErrorMessage(error: Error): string {
  const message = error.message.toLowerCase();

  // Network errors
  if (message.includes('timeout') || message.includes('timed out')) {
    return 'İşlem zaman aşımına uğradı. Lütfen tekrar deneyin.';
  }

  if (message.includes('network') || message.includes('econnrefused') || message.includes('enotfound')) {
    return 'Bağlantı hatası. İnternet bağlantınızı kontrol edin.';
  }

  // Puppeteer errors
  if (message.includes('navigation') || message.includes('page crash')) {
    return 'Sayfa yüklenirken bir hata oluştu. Lütfen tekrar deneyin.';
  }

  if (message.includes('403') || message.includes('forbidden')) {
    return 'Bu sayfaya erişim engellendi.';
  }

  if (message.includes('404') || message.includes('not found')) {
    return 'Sayfa bulunamadı. URL\'yi kontrol edin.';
  }

  // Gemini API errors
  if (message.includes('api') && message.includes('key')) {
    return 'API anahtarı hatası. Lütfen sistem yöneticisiyle iletişime geçin.';
  }

  if (message.includes('rate limit') || message.includes('quota')) {
    return 'API kullanım limiti aşıldı. Lütfen daha sonra tekrar deneyin.';
  }

  if (message.includes('invalid json') || message.includes('parse')) {
    return 'Veri işleme hatası. Lütfen tekrar deneyin.';
  }

  // Database errors
  if (message.includes('database') || message.includes('connection')) {
    return 'Veritabanı bağlantı hatası. Lütfen tekrar deneyin.';
  }

  // Generic error
  return 'Bir hata oluştu. Lütfen tekrar deneyin.';
}

/**
 * Create error summary for logging
 * 
 * Requirements: 13.6
 */
export interface ErrorSummary {
  timestamp: string;
  operation: string;
  errorType: string;
  message: string;
  userFriendlyMessage: string;
  stackTrace?: string;
  context?: Record<string, any>;
}

export function createErrorSummary(
  error: Error,
  operation: string,
  context?: Record<string, any>
): ErrorSummary {
  const summary: ErrorSummary = {
    timestamp: new Date().toISOString(),
    operation,
    errorType: error.name || 'Error',
    message: error.message,
    userFriendlyMessage: getUserFriendlyErrorMessage(error)
  };
  
  if (error.stack) {
    summary.stackTrace = error.stack;
  }
  
  if (context) {
    summary.context = context;
  }
  
  return summary;
}

/**
 * Check if error is retryable
 * Some errors should not be retried (e.g., validation errors)
 * 
 * Requirements: 13.7
 */
export function isRetryableError(error: Error): boolean {
  const message = error.message.toLowerCase();
  
  // Non-retryable errors
  const nonRetryable = [
    'validation',
    'invalid url',
    'invalid format',
    'unauthorized',
    '401',
    '403',
    '404',
    'not found'
  ];

  if (nonRetryable.some(pattern => message.includes(pattern))) {
    return false;
  }

  // Retryable errors
  const retryable = [
    'timeout',
    'network',
    'econnrefused',
    'enotfound',
    'rate limit',
    'quota',
    '500',
    '502',
    '503',
    '504',
    'crash',
    'navigation'
  ];

  return retryable.some(pattern => message.includes(pattern));
}

/**
 * Wrap operation with comprehensive error handling
 * Includes retry logic, error logging, and user-friendly messages
 * 
 * Requirements: 13.1-13.10
 */
export async function withErrorRecovery<T>(
  operation: () => Promise<T>,
  options: {
    operationType: 'puppeteer' | 'gemini' | 'database' | 'generic';
    operationName: string;
    context?: Record<string, any>;
    onError?: (summary: ErrorSummary) => void;
  }
): Promise<ErrorRecoveryResult<T>> {
  const { operationType, operationName, context, onError } = options;
  let attempts = 0;

  try {
    let result: T;

    switch (operationType) {
      case 'puppeteer':
        attempts = 4; // 1 initial + 3 retries
        result = await retryPuppeteerOperation(operation, operationName);
        break;
      
      case 'gemini':
        attempts = 2; // 1 initial + 1 retry
        result = await retryGeminiOperation(operation, operationName);
        break;
      
      case 'database':
        attempts = 4; // 1 initial + 3 retries
        result = await retryWithBackoff(operation, {
          maxRetries: 3,
          delays: [1000, 1000, 1000], // 1s delay for database
          operationName
        });
        break;
      
      default:
        attempts = 1;
        result = await operation();
    }

    return {
      success: true,
      data: result,
      attempts
    };
  } catch (error) {
    const err = error as Error;
    const summary = createErrorSummary(err, operationName, context);
    
    console.error(`❌ ${operationName} failed after ${attempts} attempts:`, summary);
    
    if (onError) {
      onError(summary);
    }

    return {
      success: false,
      error: err,
      attempts
    };
  }
}
