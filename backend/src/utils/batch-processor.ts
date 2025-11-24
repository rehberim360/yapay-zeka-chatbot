/**
 * Batch Processing Utilities
 * Requirements: 4.1, 4.2
 */

import type { SuggestedPage, PageBatch } from '../types/onboarding-v2.js';

/**
 * Group pages into batches of maximum 5 pages each
 * Requirements: 4.1
 */
export function groupIntoBatches(pages: SuggestedPage[], batchSize: number = 5): PageBatch[] {
  const batches: PageBatch[] = [];
  
  for (let i = 0; i < pages.length; i += batchSize) {
    const batch = pages.slice(i, i + batchSize);
    batches.push({
      batch_number: Math.floor(i / batchSize) + 1,
      pages: batch
    });
  }
  
  return batches;
}

/**
 * Delay execution for rate limiting
 * Requirements: 4.2
 */
export async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Get random delay between min and max milliseconds for rate limiting
 * Default: 3-5 seconds (3000-5000ms)
 * Requirements: 4.2
 */
export function getRandomDelay(minMs: number = 3000, maxMs: number = 5000): number {
  return Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
}

/**
 * Process batches with rate limiting and progress tracking
 * Requirements: 4.1, 4.2
 */
export async function processBatchesWithRateLimit<T>(
  batches: PageBatch[],
  processBatch: (batch: PageBatch, batchIndex: number) => Promise<T>,
  onProgress?: (current: number, total: number) => void
): Promise<T[]> {
  const results: T[] = [];
  
  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    if (!batch) continue;
    
    // Process batch
    console.log(`📦 Processing batch ${i + 1}/${batches.length} (${batch.pages.length} pages)`);
    const result = await processBatch(batch, i);
    results.push(result);
    
    // Report progress
    if (onProgress) {
      onProgress(i + 1, batches.length);
    }
    
    // Rate limiting: wait 3-5 seconds between batches (except after last batch)
    if (i < batches.length - 1) {
      const delayMs = getRandomDelay();
      console.log(`⏳ Waiting ${delayMs}ms before next batch...`);
      await delay(delayMs);
    }
  }
  
  return results;
}

/**
 * Calculate number of API calls needed for given page count
 * Requirements: 4.5, 4.6
 */
export function calculateApiCalls(pageCount: number, batchSize: number = 5): number {
  if (pageCount === 0) return 0;
  return Math.ceil(pageCount / batchSize);
}
