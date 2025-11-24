/**
 * Property-Based Tests for Batch Processor
 * Feature: smart-onboarding-v2
 */

import * as fc from 'fast-check';
import { 
  groupIntoBatches, 
  calculateApiCalls,
  delay,
  getRandomDelay 
} from '../utils/batch-processor.js';
import type { SuggestedPage, PagePriority } from '../types/onboarding-v2.js';

describe('Batch Processor - Property-Based Tests', () => {
  /**
   * Property 4: Batch Size Limit
   * Validates: Requirements 4.1
   * 
   * For any list of selected pages, when grouping into batches, 
   * each batch should contain at most 5 pages.
   */
  describe('Property 4: Batch Size Limit', () => {
    it('should group pages into batches of at most 5', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(
            fc.record({
              url: fc.webUrl(),
              type: fc.constantFrom('SERVICE_DETAIL', 'SERVICE_LISTING', 'PRODUCT_DETAIL'),
              priority: fc.constantFrom('CRITICAL', 'HIGH', 'MEDIUM', 'LOW') as fc.Arbitrary<PagePriority>,
              reason: fc.string(),
              expected_data: fc.string(),
              auto_select: fc.boolean()
            }),
            { minLength: 0, maxLength: 50 }
          ),
          async (pages) => {
            const batches = groupIntoBatches(pages as SuggestedPage[], 5);
            
            // Every batch should have at most 5 pages
            batches.forEach(batch => {
              expect(batch.pages.length).toBeLessThanOrEqual(5);
              expect(batch.pages.length).toBeGreaterThan(0);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle various page counts correctly', async () => {
      const testCases = [
        { count: 1, expectedBatches: 1 },
        { count: 5, expectedBatches: 1 },
        { count: 6, expectedBatches: 2 },
        { count: 10, expectedBatches: 2 },
        { count: 20, expectedBatches: 4 },
      ];

      for (const testCase of testCases) {
        const pages: SuggestedPage[] = Array(testCase.count).fill(null).map((_, i) => ({
          url: `https://example.com/page${i}`,
          type: 'SERVICE_DETAIL',
          priority: 'HIGH' as PagePriority,
          reason: 'Test',
          expected_data: 'Test data',
          auto_select: true
        }));

        const batches = groupIntoBatches(pages, 5);
        
        expect(batches.length).toBe(testCase.expectedBatches);
        
        // Verify all pages are included
        const totalPages = batches.reduce((sum, batch) => sum + batch.pages.length, 0);
        expect(totalPages).toBe(testCase.count);
      }
    });

    it('should assign correct batch numbers', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 30 }),
          async (pageCount) => {
            const pages: SuggestedPage[] = Array(pageCount).fill(null).map((_, i) => ({
              url: `https://example.com/page${i}`,
              type: 'SERVICE_DETAIL',
              priority: 'HIGH' as PagePriority,
              reason: 'Test',
              expected_data: 'Test data',
              auto_select: true
            }));

            const batches = groupIntoBatches(pages, 5);
            
            // Batch numbers should be sequential starting from 1
            batches.forEach((batch, index) => {
              expect(batch.batch_number).toBe(index + 1);
            });
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  /**
   * Property 5: Batch API Optimization
   * Validates: Requirements 4.5, 4.6
   * 
   * For any page selection, when 5 or fewer pages are selected, 
   * the system should send exactly ONE Gemini API request; 
   * when more than 5, should send ceil(count/5) requests.
   */
  describe('Property 5: Batch API Optimization', () => {
    it('should calculate correct number of API calls', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 0, max: 50 }),
          async (pageCount) => {
            const apiCalls = calculateApiCalls(pageCount, 5);
            
            if (pageCount === 0) {
              expect(apiCalls).toBe(0);
            } else if (pageCount <= 5) {
              expect(apiCalls).toBe(1);
            } else {
              expect(apiCalls).toBe(Math.ceil(pageCount / 5));
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should verify API call optimization for specific cases', () => {
      const testCases = [
        { pages: 0, expectedCalls: 0 },
        { pages: 1, expectedCalls: 1 },
        { pages: 5, expectedCalls: 1 },
        { pages: 6, expectedCalls: 2 },
        { pages: 10, expectedCalls: 2 },
        { pages: 11, expectedCalls: 3 },
        { pages: 15, expectedCalls: 3 },
        { pages: 20, expectedCalls: 4 },
      ];

      testCases.forEach(testCase => {
        const apiCalls = calculateApiCalls(testCase.pages, 5);
        expect(apiCalls).toBe(testCase.expectedCalls);
      });
    });

    it('should match batch count with API call count', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 30 }),
          async (pageCount) => {
            const pages: SuggestedPage[] = Array(pageCount).fill(null).map((_, i) => ({
              url: `https://example.com/page${i}`,
              type: 'SERVICE_DETAIL',
              priority: 'HIGH' as PagePriority,
              reason: 'Test',
              expected_data: 'Test data',
              auto_select: true
            }));

            const batches = groupIntoBatches(pages, 5);
            const apiCalls = calculateApiCalls(pageCount, 5);
            
            // Number of batches should equal number of API calls
            expect(batches.length).toBe(apiCalls);
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  /**
   * Additional tests for rate limiting
   */
  describe('Rate Limiting', () => {
    it('should delay for specified milliseconds', async () => {
      const startTime = Date.now();
      await delay(100);
      const endTime = Date.now();
      
      const elapsed = endTime - startTime;
      // Allow some tolerance for timing
      expect(elapsed).toBeGreaterThanOrEqual(90);
      expect(elapsed).toBeLessThan(200);
    });

    it('should generate random delay within range', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1000, max: 10000 }),
          fc.integer({ min: 1000, max: 10000 }),
          async (min, max) => {
            // Ensure min <= max
            const minMs = Math.min(min, max);
            const maxMs = Math.max(min, max);
            
            const delayMs = getRandomDelay(minMs, maxMs);
            
            expect(delayMs).toBeGreaterThanOrEqual(minMs);
            expect(delayMs).toBeLessThanOrEqual(maxMs);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should use default 3-5 second range', () => {
      for (let i = 0; i < 50; i++) {
        const delayMs = getRandomDelay();
        expect(delayMs).toBeGreaterThanOrEqual(3000);
        expect(delayMs).toBeLessThanOrEqual(5000);
      }
    });
  });

  /**
   * Edge cases
   */
  describe('Edge Cases', () => {
    it('should handle empty page array', () => {
      const batches = groupIntoBatches([], 5);
      expect(batches.length).toBe(0);
    });

    it('should handle single page', () => {
      const pages: SuggestedPage[] = [{
        url: 'https://example.com',
        type: 'SERVICE_DETAIL',
        priority: 'HIGH' as PagePriority,
        reason: 'Test',
        expected_data: 'Test data',
        auto_select: true
      }];

      const batches = groupIntoBatches(pages, 5);
      expect(batches.length).toBe(1);
      expect(batches[0]?.pages.length).toBe(1);
    });

    it('should handle exactly 5 pages', () => {
      const pages: SuggestedPage[] = Array(5).fill(null).map((_, i) => ({
        url: `https://example.com/page${i}`,
        type: 'SERVICE_DETAIL',
        priority: 'HIGH' as PagePriority,
        reason: 'Test',
        expected_data: 'Test data',
        auto_select: true
      }));

      const batches = groupIntoBatches(pages, 5);
      expect(batches.length).toBe(1);
      expect(batches[0]?.pages.length).toBe(5);
    });
  });
});
