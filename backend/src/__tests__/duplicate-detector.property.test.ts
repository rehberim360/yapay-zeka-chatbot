/**
 * Property-Based Tests for Duplicate Detector
 * Feature: smart-onboarding-v2
 */

import * as fc from 'fast-check';
import { DuplicateDetector } from '../services/duplicate-detector.js';
import type { Offering, ConfidenceLevel } from '../types/onboarding-v2.js';

describe('DuplicateDetector - Property-Based Tests', () => {
  let detector: DuplicateDetector;

  beforeAll(() => {
    // Set up environment variable for tests
    if (!process.env.GEMINI_API_KEY) {
      process.env.GEMINI_API_KEY = 'test-api-key-for-unit-tests';
    }
  });

  beforeEach(() => {
    detector = new DuplicateDetector();
  });

  /**
   * Property 7: Duplicate Detection by Name
   * Validates: Requirements 5.2, 5.3
   * 
   * For any two offerings with identical names from different pages, 
   * the system should detect them as duplicates and merge them, 
   * keeping the one with more complete information (non-null fields).
   */
  describe('Property 7: Duplicate Detection by Name', () => {
    it('should detect exact name matches as duplicates', async () => {
      const offerings: Offering[] = [
        {
          name: 'Saç Kesimi',
          description: 'Basic haircut',
          type: 'SERVICE',
          price: 100,
          currency: 'TRY',
          category: 'Hair',
          source_url: 'https://example.com/page1'
        },
        {
          name: 'Saç Kesimi',
          description: 'Professional haircut with styling',
          type: 'SERVICE',
          price: 150,
          currency: 'TRY',
          category: 'Hair',
          meta_info: { duration: '30 dk' },
          source_url: 'https://example.com/page2'
        }
      ];

      const result = await detector.detectDuplicates(offerings);

      // Should detect duplicates
      expect(result.duplicates.length).toBeGreaterThan(0);
      
      // Should have fewer unique offerings than input
      expect(result.unique_offerings.length).toBeLessThan(offerings.length);
      
      // Should keep the more complete offering (with meta_info)
      const merged = result.unique_offerings[0];
      expect(merged?.meta_info).toBeDefined();
    });

    it('should keep more complete offering for any duplicate pair', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            name: fc.string({ minLength: 5 }),
            hasDescription1: fc.boolean(),
            hasPrice1: fc.boolean(),
            hasMetaInfo1: fc.boolean(),
            hasDescription2: fc.boolean(),
            hasPrice2: fc.boolean(),
            hasMetaInfo2: fc.boolean()
          }),
          async (config) => {
            const offering1: Offering = {
              name: config.name,
              description: config.hasDescription1 ? 'Description 1' : undefined,
              type: 'SERVICE',
              price: config.hasPrice1 ? 100 : null,
              currency: 'TRY',
              category: 'Test',
              meta_info: config.hasMetaInfo1 ? { test: 'value1' } : undefined,
              source_url: 'https://example.com/page1'
            };

            const offering2: Offering = {
              name: config.name, // Same name
              description: config.hasDescription2 ? 'Description 2' : undefined,
              type: 'SERVICE',
              price: config.hasPrice2 ? 150 : null,
              currency: 'TRY',
              category: 'Test',
              meta_info: config.hasMetaInfo2 ? { test: 'value2' } : undefined,
              source_url: 'https://example.com/page2'
            };

            const result = await detector.detectDuplicates([offering1, offering2]);

            // Should detect as duplicates
            expect(result.unique_offerings.length).toBe(1);
            
            // The kept offering should have more complete information
            const kept = result.unique_offerings[0];
            if (kept) {
              // Count non-null fields
              const score1 = (offering1.description ? 1 : 0) + 
                            (offering1.price ? 1 : 0) + 
                            (offering1.meta_info ? 1 : 0);
              const score2 = (offering2.description ? 1 : 0) + 
                            (offering2.price ? 1 : 0) + 
                            (offering2.meta_info ? 1 : 0);
              
              // Kept offering should be the one with higher or equal score
              if (score1 > score2) {
                expect(kept.source_url).toBe(offering1.source_url);
              } else if (score2 > score1) {
                expect(kept.source_url).toBe(offering2.source_url);
              }
              // If equal, either is acceptable
            }
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should have Levenshtein distance calculation', () => {
      // Test that Levenshtein distance is calculated correctly
      const distance1 = (detector as any).levenshteinDistance('test', 'test');
      expect(distance1).toBe(0);
      
      const distance2 = (detector as any).levenshteinDistance('test', 'tost');
      expect(distance2).toBe(1);
      
      const distance3 = (detector as any).levenshteinDistance('test', 'toast');
      expect(distance3).toBe(2);
      
      // Verify similar names have distance < 3
      const distance4 = (detector as any).levenshteinDistance('Saç Kesimi', 'Sac Kesimi');
      expect(distance4).toBeLessThan(3);
    });
  });

  /**
   * Property 8: Variant Preservation
   * Validates: Requirements 5.6
   * 
   * For any two offerings with names that differ only by variant indicators 
   * (e.g., "Kadın", "Erkek", "Büyük", "Küçük"), the system should keep 
   * both offerings as separate entries.
   */
  describe('Property 8: Variant Preservation', () => {
    it('should keep gender variants separate', async () => {
      const offerings: Offering[] = [
        {
          name: 'Saç Kesimi Kadın',
          type: 'SERVICE',
          price: 150,
          currency: 'TRY',
          category: 'Hair',
          source_url: 'https://example.com/page1'
        },
        {
          name: 'Saç Kesimi Erkek',
          type: 'SERVICE',
          price: 100,
          currency: 'TRY',
          category: 'Hair',
          source_url: 'https://example.com/page2'
        }
      ];

      const result = await detector.detectDuplicates(offerings);

      // Should keep both variants
      expect(result.unique_offerings.length).toBe(2);
    });

    it('should keep size variants separate', async () => {
      const offerings: Offering[] = [
        {
          name: 'Pizza Büyük',
          type: 'PRODUCT',
          price: 200,
          currency: 'TRY',
          category: 'Food',
          source_url: 'https://example.com/page1'
        },
        {
          name: 'Pizza Küçük',
          type: 'PRODUCT',
          price: 100,
          currency: 'TRY',
          category: 'Food',
          source_url: 'https://example.com/page2'
        }
      ];

      const result = await detector.detectDuplicates(offerings);

      // Should keep both variants
      expect(result.unique_offerings.length).toBe(2);
    });

    it('should preserve variants for any variant keywords', async () => {
      const variantPairs = [
        ['Kadın', 'Erkek'],
        ['Büyük', 'Küçük'],
        ['Large', 'Small'],
        ['Boy', 'Girl'],
        ['XL', 'S']
      ];

      for (const [variant1, variant2] of variantPairs) {
        const offerings: Offering[] = [
          {
            name: `Test ${variant1}`,
            type: 'SERVICE',
            category: 'Test',
            source_url: 'https://example.com/page1'
          },
          {
            name: `Test ${variant2}`,
            type: 'SERVICE',
            category: 'Test',
            source_url: 'https://example.com/page2'
          }
        ];

        const result = await detector.detectDuplicates(offerings);

        // Should keep both variants
        expect(result.unique_offerings.length).toBe(2);
      }
    });
  });

  /**
   * Additional tests for duplicate detection logic
   */
  describe('Duplicate Detection Edge Cases', () => {
    it('should handle empty offerings array', async () => {
      const result = await detector.detectDuplicates([]);
      
      expect(result.unique_offerings.length).toBe(0);
      expect(result.duplicates.length).toBe(0);
    });

    it('should handle single offering', async () => {
      const offerings: Offering[] = [{
        name: 'Test',
        type: 'SERVICE',
        category: 'Test',
        source_url: 'https://example.com/page1'
      }];

      const result = await detector.detectDuplicates(offerings);
      
      expect(result.unique_offerings.length).toBe(1);
      expect(result.duplicates.length).toBe(0);
    });

    it('should handle all unique offerings', async () => {
      const offerings: Offering[] = [
        {
          name: 'Service A',
          type: 'SERVICE',
          category: 'Test',
          source_url: 'https://example.com/page1'
        },
        {
          name: 'Service B',
          type: 'SERVICE',
          category: 'Test',
          source_url: 'https://example.com/page2'
        },
        {
          name: 'Service C',
          type: 'SERVICE',
          category: 'Test',
          source_url: 'https://example.com/page3'
        }
      ];

      const result = await detector.detectDuplicates(offerings);
      
      expect(result.unique_offerings.length).toBe(3);
      expect(result.duplicates.length).toBe(0);
    });

    it('should handle multiple duplicate groups', async () => {
      const offerings: Offering[] = [
        { name: 'Service A', type: 'SERVICE', category: 'Test', source_url: 'page1' },
        { name: 'Service A', type: 'SERVICE', category: 'Test', source_url: 'page2' },
        { name: 'Service B', type: 'SERVICE', category: 'Test', source_url: 'page3' },
        { name: 'Service B', type: 'SERVICE', category: 'Test', source_url: 'page4' },
      ];

      const result = await detector.detectDuplicates(offerings);
      
      // Should have 2 unique offerings (one for each group)
      expect(result.unique_offerings.length).toBe(2);
      // Should have 2 duplicate groups
      expect(result.duplicates.length).toBe(2);
    });
  });

  /**
   * Levenshtein distance tests
   */
  describe('Levenshtein Distance Calculation', () => {
    it('should calculate correct distance for identical strings', () => {
      // Access private method for testing
      const distance = (detector as any).levenshteinDistance('test', 'test');
      expect(distance).toBe(0);
    });

    it('should calculate correct distance for different strings', () => {
      const distance = (detector as any).levenshteinDistance('kitten', 'sitting');
      expect(distance).toBe(3);
    });

    it('should calculate distance for any string pair', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ maxLength: 20 }),
          fc.string({ maxLength: 20 }),
          async (str1, str2) => {
            const distance = (detector as any).levenshteinDistance(str1, str2);
            
            // Distance should be non-negative
            expect(distance).toBeGreaterThanOrEqual(0);
            
            // Distance should be at most the length of the longer string
            expect(distance).toBeLessThanOrEqual(Math.max(str1.length, str2.length));
            
            // Distance should be 0 for identical strings
            if (str1 === str2) {
              expect(distance).toBe(0);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
