/**
 * Property-Based Tests for Database Retry Logic
 * 
 * Tests retry behavior and error handling
 * Requirements: 12.10, 18.9
 */

import { describe, it, expect, jest } from '@jest/globals';
import * as fc from 'fast-check';
import {
  retryDatabaseOperation,
  retrySupabaseOperation,
  isRetryableError,
  retryWithCondition
} from '../utils/database-retry.js';

describe('Database Retry Logic - Property Tests', () => {
  /**
   * Property 22: Database Retry Logic
   * **Feature: smart-onboarding-v2, Property 22: Database Retry Logic**
   * **Validates: Requirements 12.10**
   * 
   * For any database operation that fails, the system should retry up to 3 times
   * before throwing error.
   */
  describe('Property 22: Database Retry Logic', () => {
    it('should retry failed operations up to 3 times', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 5 }),
          async (failureCount) => {
            let attempts = 0;
            
            const operation = async () => {
              attempts++;
              if (attempts < failureCount) {
                throw new Error(`Attempt ${attempts} failed`);
              }
              return 'success';
            };

            if (failureCount <= 3) {
              // Should succeed within 3 retries
              const result = await retryDatabaseOperation(operation, {
                maxRetries: 3,
                delayMs: 10 // Fast for testing
              });
              
              expect(result).toBe('success');
              expect(attempts).toBe(failureCount);
            } else {
              // Should fail after 3 retries
              await expect(
                retryDatabaseOperation(operation, {
                  maxRetries: 3,
                  delayMs: 10
                })
              ).rejects.toThrow();
              
              expect(attempts).toBe(3);
            }
          }
        ),
        { numRuns: 100 }
      );
    }, 30000);

    it('should wait specified delay between retries', async () => {
      const timestamps: number[] = [];
      let attempts = 0;
      
      const operation = async () => {
        timestamps.push(Date.now());
        attempts++;
        if (attempts < 3) {
          throw new Error('Retry me');
        }
        return 'success';
      };

      await retryDatabaseOperation(operation, {
        maxRetries: 3,
        delayMs: 100
      });

      // Check delays between attempts
      expect(timestamps.length).toBe(3);
      
      const delay1 = timestamps[1] - timestamps[0];
      const delay2 = timestamps[2] - timestamps[1];
      
      // Delays should be approximately 100ms (with some tolerance)
      expect(delay1).toBeGreaterThanOrEqual(90);
      expect(delay1).toBeLessThanOrEqual(150);
      expect(delay2).toBeGreaterThanOrEqual(90);
      expect(delay2).toBeLessThanOrEqual(150);
    }, 10000);

    it('should call onRetry callback on each retry', async () => {
      const retryCallbacks: Array<{ attempt: number; error: any }> = [];
      let attempts = 0;
      
      const operation = async () => {
        attempts++;
        if (attempts < 3) {
          throw new Error(`Attempt ${attempts}`);
        }
        return 'success';
      };

      await retryDatabaseOperation(operation, {
        maxRetries: 3,
        delayMs: 10,
        onRetry: (attempt, error) => {
          retryCallbacks.push({ attempt, error });
        }
      });

      // Should have 2 retry callbacks (attempts 1 and 2 failed)
      expect(retryCallbacks.length).toBe(2);
      expect(retryCallbacks[0].attempt).toBe(1);
      expect(retryCallbacks[1].attempt).toBe(2);
    }, 10000);
  });

  /**
   * Test Supabase-specific retry wrapper
   */
  describe('Supabase Operation Retry', () => {
    it('should handle Supabase response format', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string(),
          async (data) => {
            const operation = async () => ({
              data,
              error: null
            });

            const result = await retrySupabaseOperation(
              operation,
              'Test operation'
            );

            expect(result).toBe(data);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should throw on Supabase error', async () => {
      const operation = async () => ({
        data: null,
        error: { message: 'Database error', code: 'PGRST301' }
      });

      await expect(
        retrySupabaseOperation(operation, 'Test operation')
      ).rejects.toThrow('Test operation: Database error');
    });

    it('should retry Supabase errors', async () => {
      let attempts = 0;
      
      const operation = async () => {
        attempts++;
        if (attempts < 2) {
          return {
            data: null,
            error: { message: 'Connection error', code: 'PGRST301' }
          };
        }
        return {
          data: 'success',
          error: null
        };
      };

      const result = await retrySupabaseOperation(operation, 'Test');
      
      expect(result).toBe('success');
      expect(attempts).toBe(2);
    });
  });

  /**
   * Test error type detection
   */
  describe('Retryable Error Detection', () => {
    it('should identify network errors as retryable', () => {
      const networkErrors = [
        { code: 'ECONNREFUSED' },
        { code: 'ETIMEDOUT' },
        { message: 'connection timeout' },
        { message: 'connection refused' }
      ];

      networkErrors.forEach(error => {
        expect(isRetryableError(error)).toBe(true);
      });
    });

    it('should identify validation errors as non-retryable', () => {
      const validationErrors = [
        { code: '22P02', message: 'invalid input syntax' },
        { code: '23505', message: 'unique constraint violation' }
      ];

      validationErrors.forEach(error => {
        expect(isRetryableError(error)).toBe(false);
      });
    });

    it('should default to retryable for unknown errors', () => {
      const unknownError = { message: 'Something went wrong' };
      expect(isRetryableError(unknownError)).toBe(true);
    });
  });

  /**
   * Test conditional retry logic
   */
  describe('Conditional Retry', () => {
    it('should not retry non-retryable errors', async () => {
      let attempts = 0;
      
      const operation = async () => {
        attempts++;
        const error: any = new Error('unique constraint violation');
        error.code = '23505';
        throw error;
      };

      await expect(
        retryWithCondition(operation, { maxRetries: 3, delayMs: 10 })
      ).rejects.toThrow();

      // Should fail immediately without retries
      expect(attempts).toBe(1);
    });

    it('should retry retryable errors', async () => {
      let attempts = 0;
      
      const operation = async () => {
        attempts++;
        if (attempts < 3) {
          const error: any = new Error('connection refused');
          error.code = 'ECONNREFUSED';
          throw error;
        }
        return 'success';
      };

      const result = await retryWithCondition(operation, {
        maxRetries: 3,
        delayMs: 10
      });

      expect(result).toBe('success');
      expect(attempts).toBe(3);
    });
  });

  /**
   * Test edge cases
   */
  describe('Edge Cases', () => {
    it('should handle immediate success without retries', async () => {
      let attempts = 0;
      
      const operation = async () => {
        attempts++;
        return 'success';
      };

      const result = await retryDatabaseOperation(operation);
      
      expect(result).toBe('success');
      expect(attempts).toBe(1);
    });

    it('should handle zero max retries', async () => {
      let attempts = 0;
      
      const operation = async () => {
        attempts++;
        throw new Error('Always fails');
      };

      await expect(
        retryDatabaseOperation(operation, { maxRetries: 0 })
      ).rejects.toThrow();

      expect(attempts).toBe(0);
    });

    it('should preserve error message in final throw', async () => {
      const operation = async () => {
        throw new Error('Original error message');
      };

      await expect(
        retryDatabaseOperation(operation, { maxRetries: 2, delayMs: 10 })
      ).rejects.toThrow('Original error message');
    });
  });
});
