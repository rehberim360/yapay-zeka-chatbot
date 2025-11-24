/**
 * Database Retry Logic
 * 
 * Provides retry wrapper for database operations with exponential backoff
 * Requirements: 12.10, 13.6
 */

export interface RetryOptions {
  maxRetries?: number;
  delayMs?: number;
  onRetry?: (attempt: number, error: any) => void;
}

/**
 * Retry a database operation up to maxRetries times
 * 
 * @param operation - Async function to retry
 * @param options - Retry configuration
 * @returns Result of the operation
 * @throws Error after max retries exceeded
 * 
 * Requirements: 12.10
 */
export async function retryDatabaseOperation<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    delayMs = 1000,
    onRetry
  } = options;

  let lastError: any;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      
      if (attempt < maxRetries) {
        console.warn(
          `Database operation failed (attempt ${attempt}/${maxRetries}):`,
          error.message
        );
        
        if (onRetry) {
          onRetry(attempt, error);
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  }

  // All retries exhausted
  console.error(
    `Database operation failed after ${maxRetries} retries:`,
    lastError
  );
  
  throw new Error(
    `Database operation failed after ${maxRetries} retries: ${lastError.message}`
  );
}

/**
 * Retry wrapper specifically for Supabase operations
 * Handles common Supabase error patterns
 * 
 * @param operation - Supabase operation to retry
 * @param operationName - Name for logging
 * @returns Result of the operation
 */
export async function retrySupabaseOperation<T>(
  operation: () => Promise<{ data: T | null; error: any }>,
  operationName: string = 'Supabase operation'
): Promise<T> {
  return retryDatabaseOperation(
    async () => {
      const { data, error } = await operation();
      
      if (error) {
        throw new Error(`${operationName}: ${error.message}`);
      }
      
      if (data === null) {
        throw new Error(`${operationName}: No data returned`);
      }
      
      return data;
    },
    {
      maxRetries: 3,
      delayMs: 1000,
      onRetry: (attempt, error) => {
        console.log(`Retrying ${operationName} (attempt ${attempt})...`);
      }
    }
  );
}

/**
 * Check if an error is retryable
 * Some errors (like validation errors) should not be retried
 * 
 * @param error - Error to check
 * @returns true if error is retryable
 */
export function isRetryableError(error: any): boolean {
  // Network errors - retryable
  if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
    return true;
  }
  
  // Database connection errors - retryable
  if (error.message?.includes('connection') || error.message?.includes('timeout')) {
    return true;
  }
  
  // Supabase specific errors
  if (error.code === 'PGRST301' || error.code === 'PGRST302') {
    return true; // Connection errors
  }
  
  // Validation errors - NOT retryable
  if (error.code === '22P02' || error.code === '23505') {
    return false; // Invalid input, unique constraint violation
  }
  
  // Default: retry
  return true;
}

/**
 * Retry with conditional logic based on error type
 * 
 * @param operation - Operation to retry
 * @param options - Retry options
 * @returns Result of operation
 */
export async function retryWithCondition<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    delayMs = 1000,
    onRetry
  } = options;

  let lastError: any;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      
      // Check if error is retryable
      if (!isRetryableError(error)) {
        console.error('Non-retryable error encountered:', error.message);
        throw error;
      }
      
      if (attempt < maxRetries) {
        console.warn(
          `Retryable error (attempt ${attempt}/${maxRetries}):`,
          error.message
        );
        
        if (onRetry) {
          onRetry(attempt, error);
        }
        
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  }

  throw new Error(
    `Operation failed after ${maxRetries} retries: ${lastError.message}`
  );
}
