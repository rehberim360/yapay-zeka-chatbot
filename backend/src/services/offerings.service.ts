/**
 * Offerings Service with Lazy Loading
 * Requirements: 14.8 - Implement lazy loading for offerings (20 per page)
 */

import { supabase } from '../lib/supabase.js';
import { cache, CacheKeys } from '../utils/cache.js';

export interface OfferingsPage {
  offerings: any[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasMore: boolean;
}

export class OfferingsService {
  private readonly PAGE_SIZE = 20;

  /**
   * Get offerings with pagination and caching
   * @param tenantId Tenant ID
   * @param page Page number (1-indexed)
   * @param pageSize Items per page (default: 20)
   * @returns Paginated offerings
   */
  async getOfferings(
    tenantId: string,
    page: number = 1,
    pageSize: number = this.PAGE_SIZE
  ): Promise<OfferingsPage> {
    // Check cache first
    const cacheKey = CacheKeys.offerings(tenantId, page);
    const cached = cache.get<OfferingsPage>(cacheKey);
    
    if (cached) {
      console.log(`✅ Offerings page ${page} loaded from cache for tenant ${tenantId}`);
      return cached;
    }

    // Calculate offset
    const offset = (page - 1) * pageSize;

    // Get total count
    const { count, error: countError } = await supabase
      .from('offerings')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .eq('is_available', true);

    if (countError) {
      console.error('Error counting offerings:', countError);
      throw new Error('Failed to count offerings');
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / pageSize);

    // Get paginated offerings
    const { data: offerings, error } = await supabase
      .from('offerings')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('is_available', true)
      .order('category', { ascending: true })
      .order('name', { ascending: true })
      .range(offset, offset + pageSize - 1);

    if (error) {
      console.error('Error fetching offerings:', error);
      throw new Error('Failed to fetch offerings');
    }

    // Parse attributes (meta_info) from JSONB
    const parsedOfferings = (offerings || []).map(offering => ({
      ...offering,
      meta_info: offering.attributes || {}
    }));

    const result: OfferingsPage = {
      offerings: parsedOfferings,
      total,
      page,
      pageSize,
      totalPages,
      hasMore: page < totalPages
    };

    // Cache the result (5 minutes TTL)
    cache.set(cacheKey, result, 5 * 60 * 1000);
    console.log(`💾 Offerings page ${page} cached for tenant ${tenantId} (TTL: 5 min)`);

    return result;
  }

  /**
   * Get all offerings for a tenant (for system prompt generation)
   * Uses caching to avoid repeated database queries
   * @param tenantId Tenant ID
   * @returns All offerings
   */
  async getAllOfferings(tenantId: string): Promise<any[]> {
    // Check if we have a cached full list
    const cacheKey = `tenant:offerings:${tenantId}:all`;
    const cached = cache.get<any[]>(cacheKey);
    
    if (cached) {
      console.log(`✅ All offerings loaded from cache for tenant ${tenantId}`);
      return cached;
    }

    const { data: offerings, error } = await supabase
      .from('offerings')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('is_available', true)
      .order('category', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching all offerings:', error);
      throw new Error('Failed to fetch all offerings');
    }

    // Parse attributes (meta_info) from JSONB
    const parsedOfferings = (offerings || []).map(offering => ({
      ...offering,
      meta_info: offering.attributes || {}
    }));

    // Cache the result (5 minutes TTL)
    cache.set(cacheKey, parsedOfferings, 5 * 60 * 1000);
    console.log(`💾 All offerings cached for tenant ${tenantId} (TTL: 5 min)`);

    return parsedOfferings;
  }

  /**
   * Invalidate cache for a tenant's offerings
   * Call this when offerings are updated
   * @param tenantId Tenant ID
   */
  invalidateCache(tenantId: string): void {
    // Delete all cached pages for this tenant
    const stats = cache.getStats();
    const keysToDelete = stats.keys.filter(key => 
      key.startsWith(`tenant:offerings:${tenantId}`)
    );
    
    keysToDelete.forEach(key => cache.delete(key));
    console.log(`🗑️ Invalidated ${keysToDelete.length} cache entries for tenant ${tenantId}`);
  }

  /**
   * Save offerings to database
   * @param tenantId Tenant ID
   * @param offerings Offerings to save
   */
  async saveOfferings(tenantId: string, offerings: any[]): Promise<void> {
    const offeringsToInsert = offerings.map(offering => ({
      tenant_id: tenantId,
      name: offering.name,
      description: offering.description,
      type: offering.type,
      price: offering.price,
      currency: offering.currency || 'TRY',
      duration_min: offering.duration_min,
      category: offering.category,
      attributes: offering.meta_info || {}, // Store meta_info in JSONB
      is_available: true
    }));

    const { error } = await supabase
      .from('offerings')
      .insert(offeringsToInsert);

    if (error) {
      console.error('Error saving offerings:', error);
      throw new Error('Failed to save offerings');
    }

    // Invalidate cache after saving
    this.invalidateCache(tenantId);
    console.log(`✅ Saved ${offerings.length} offerings for tenant ${tenantId}`);
  }
}

// Singleton instance
export const offeringsService = new OfferingsService();
