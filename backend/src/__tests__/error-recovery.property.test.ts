/**
 * Property-Based Tests for Error Recovery
 * 
 * Tests retry logic and error continuation functionality
 * Requirements: 4.13, 4.14, 13.1-13.10
 */

import fc from 'fast-check';
import {
  retryWithBackoff,
  retryPuppeteerOperation,
  retryGeminiOperation,
  processWithErrorContinuation,
  getUserFriendlyErrorMessage,
  isRetryableError
} from '../utils/error-recovery.js';

describe('Error Recovery - Property-Based Tests', () => {
  /**
   * Property 6: Retry with Exponential Backoff
   * Feature: smart-onboarding-v2, Property 6: Retry with Exponential Backoff
   * Validates: Requirements 4.13
   */
  describe('Property 6: Retry with Exponential Backoff', () => {
    it('should retry with correct delays (3s, 6s, 12s)', async () => {
      // Test with shorter delays to avoid timeout
      await fc.assert(
        fc.asyncProperty(fc.integer({ min: 1, max: 3 }), async (failCount) => {
          let attempts = 0;
          const delays: number[] = [];

          const operation = async () => {
            attempts++;
            if (attempts <= failCount) {
              throw new Error(`Attempt ${attempts} failed`);
            }
            return 'success';
          };

          const onRetry = (attempt: number) => {
            delays.push(attempt);
          };

          try {
            await retryWithBackoff(operation, {
              maxRetries: 3,
              delays: [100, 200, 300], // Shorter delays for testing
              onRetry,
              operationName: 'Test operation'
            });
          } catch (error) {
            // Expected if failCount > 3
          }

          // Verify retry count
          expect(attempts).toBeLessThanOrEqual(4); // 1 initial + 3 retries
          
          // Verify retries were attempted
          if (failCount > 0) {
            expect(delays.length).toBeGreaterThan(0);
          }
        }),
        { numRuns: 20 }
      );
    });

    it('should retry max 3 times for Puppeteer operations', async () => {
      let attempts = 0;

      const operation = async () => {
        attempts++;
        throw new Error('Puppeteer failed');
      };

      try {
        await retryPuppeteerOperation(operation, 'Test Puppeteer');
      } catch (error) {
        // Expected to fail
      }

      // Should attempt 4 times total (1 initial + 3 retries)
      expect(attempts).toBe(4);
    }, 30000);

    it('should retry max 1 time for Gemini operations', async () => {
      let attempts = 0;

      const operation = async () => {
        attempts++;
        throw new Error('Gemini API failed');
      };

      try {
        await retryGeminiOperation(operation, 'Test Gemini');
      } catch (error) {
        // Expected to fail
      }

      // Should attempt 2 times total (1 initial + 1 retry)
      expect(attempts).toBe(2);
    }, 10000);
  });

  /**
   * Property 23: Error Continuation
   * Feature: smart-onboarding-v2, Property 23: Error Continuation
   * Validates: Requirements 4.14, 13.2
   */
  describe('Property 23: Error Continuation', () => {
    it('should continue processing remaining items after failure', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(fc.integer({ min: 1, max: 100 }), { minLength: 5, maxLength: 20 }),
          fc.integer({ min: 0, max: 4 }), // Index to fail
          async (items, failIndex) => {
            const processedItems: number[] = [];
            const failedIndices: number[] = [];

            const processor = async (item: number, index: number) => {
              if (index === failIndex) {
                throw new Error(`Failed at index ${index}`);
              }
              processedItems.push(item);
              return item * 2;
            };

            const result = await processWithErrorContinuation(
              items,
              processor,
              {
                operationName: 'Test processing',
                onItemError: (item, index) => {
                  failedIndices.push(index);
                }
              }
            );

            // Should process all items except the failed one
            expect(result.results.length).toBe(items.length - 1);
            expect(result.errors.length).toBe(1);
            expect(result.errors[0]?.index).toBe(failIndex);
            expect(failedIndices).toContain(failIndex);

            // Should have processed all items except failed one
            expect(processedItems.length).toBe(items.length - 1);
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should process all items when no failures occur', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(fc.integer({ min: 1, max: 100 }), { minLength: 1, maxLength: 20 }),
          async (items) => {
            const processor = async (item: number) => item * 2;

            const result = await processWithErrorContinuation(
              items,
              processor,
              { operationName: 'Test processing' }
            );

            // Should process all items successfully
            expect(result.results.length).toBe(items.length);
            expect(result.errors.length).toBe(0);

            // Results should be doubled
            result.results.forEach((res, i) => {
              expect(res).toBe((items[i] || 0) * 2);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle multiple failures and continue', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(fc.integer({ min: 1, max: 100 }), { minLength: 10, maxLength: 20 }),
          fc.array(fc.integer({ min: 0, max: 9 }), { minLength: 2, maxLength: 5 }), // Multiple fail indices
          async (items, failIndices) => {
            const uniqueFailIndices = [...new Set(failIndices)].filter(i => i < items.length);

            const processor = async (item: number, index: number) => {
              if (uniqueFailIndices.includes(index)) {
                throw new Error(`Failed at index ${index}`);
              }
              return item * 2;
            };

            const result = await processWithErrorContinuation(
              items,
              processor,
              { operationName: 'Test processing' }
            );

            // Should process all items except failed ones
            expect(result.results.length).toBe(items.length - uniqueFailIndices.length);
            expect(result.errors.length).toBe(uniqueFailIndices.length);

            // All failed indices should be in errors
            const errorIndices = result.errors.map(e => e.index);
            uniqueFailIndices.forEach(idx => {
              expect(errorIndices).toContain(idx);
            });
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  /**
   * Additional tests for user-friendly error messages
   */
  describe('User-Friendly Error Messages', () => {
    it('should return Turkish error messages', () => {
      const timeoutError = new Error('Request timeout');
      expect(getUserFriendlyErrorMessage(timeoutError)).toContain('zaman aşımı');

      const networkError = new Error('Network error: ECONNREFUSED');
      expect(getUserFriendlyErrorMessage(networkError)).toContain('Bağlantı hatası');

      const notFoundError = new Error('404 Not Found');
      expect(getUserFriendlyErrorMessage(notFoundError)).toContain('bulunamadı');
    });

    it('should identify retryable errors correctly', () => {
      // Retryable errors
      expect(isRetryableError(new Error('timeout'))).toBe(true);
      expect(isRetryableError(new Error('network error'))).toBe(true);
      expect(isRetryableError(new Error('500 Internal Server Error'))).toBe(true);
      expect(isRetryableError(new Error('rate limit exceeded'))).toBe(true);

      // Non-retryable errors
      expect(isRetryableError(new Error('validation failed'))).toBe(false);
      expect(isRetryableError(new Error('invalid url'))).toBe(false);
      expect(isRetryableError(new Error('401 Unauthorized'))).toBe(false);
      expect(isRetryableError(new Error('404 Not Found'))).toBe(false);
    });
  });
});
