/**
 * Tenant Service with Metadata Caching
 * Requirements: 14.7 - Add caching for tenant metadata (5 min TTL)
 */

import { supabase } from '../lib/supabase.js';
import { cache, CacheKeys } from '../utils/cache.js';

export interface TenantMetadata {
  system_prompt?: string;
  sector_analysis?: any;
  timezone?: string;
  language?: string;
  [key: string]: any;
}

export interface Tenant {
  id: string;
  name: string;
  sector?: string;
  status: string;
  metadata: TenantMetadata;
  created_at: string;
  updated_at: string;
}

export class TenantService {
  /**
   * Get tenant by ID with metadata caching
   * @param tenantId Tenant ID
   * @returns Tenant with metadata
   */
  async getTenant(tenantId: string): Promise<Tenant | null> {
    // Check cache first
    const cacheKey = CacheKeys.tenantMetadata(tenantId);
    const cached = cache.get<Tenant>(cacheKey);
    
    if (cached) {
      console.log(`✅ Tenant metadata loaded from cache for ${tenantId}`);
      return cached;
    }

    // Fetch from database
    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .eq('id', tenantId)
      .single();

    if (error) {
      console.error('Error fetching tenant:', error);
      return null;
    }

    if (!data) {
      return null;
    }

    const tenant: Tenant = {
      id: data.id,
      name: data.name,
      sector: data.sector,
      status: data.status,
      metadata: data.metadata || {},
      created_at: data.created_at,
      updated_at: data.updated_at
    };

    // Cache the result (5 minutes TTL)
    cache.set(cacheKey, tenant, 5 * 60 * 1000);
    console.log(`💾 Tenant metadata cached for ${tenantId} (TTL: 5 min)`);

    return tenant;
  }

  /**
   * Update tenant metadata
   * @param tenantId Tenant ID
   * @param metadata Metadata to update
   */
  async updateMetadata(tenantId: string, metadata: Partial<TenantMetadata>): Promise<void> {
    // Get current tenant
    const tenant = await this.getTenant(tenantId);
    if (!tenant) {
      throw new Error(`Tenant ${tenantId} not found`);
    }

    // Merge metadata
    const updatedMetadata = {
      ...tenant.metadata,
      ...metadata
    };

    // Update in database
    const { error } = await supabase
      .from('tenants')
      .update({
        metadata: updatedMetadata,
        updated_at: new Date().toISOString()
      })
      .eq('id', tenantId);

    if (error) {
      console.error('Error updating tenant metadata:', error);
      throw new Error('Failed to update tenant metadata');
    }

    // Invalidate cache
    this.invalidateCache(tenantId);
    console.log(`✅ Updated metadata for tenant ${tenantId}`);
  }

  /**
   * Get system prompt for tenant (with caching)
   * @param tenantId Tenant ID
   * @returns System prompt or null
   */
  async getSystemPrompt(tenantId: string): Promise<string | null> {
    const tenant = await this.getTenant(tenantId);
    return tenant?.metadata?.system_prompt || null;
  }

  /**
   * Save system prompt for tenant
   * @param tenantId Tenant ID
   * @param systemPrompt System prompt
   */
  async saveSystemPrompt(tenantId: string, systemPrompt: string): Promise<void> {
    await this.updateMetadata(tenantId, { system_prompt: systemPrompt });
    
    // Also cache the system prompt directly
    const cacheKey = CacheKeys.systemPrompt(tenantId);
    cache.set(cacheKey, systemPrompt, 5 * 60 * 1000);
    console.log(`💾 System prompt cached for tenant ${tenantId}`);
  }

  /**
   * Get timezone for tenant (with default)
   * @param tenantId Tenant ID
   * @returns Timezone string
   */
  async getTimezone(tenantId: string): Promise<string> {
    const tenant = await this.getTenant(tenantId);
    return tenant?.metadata?.timezone || 'Europe/Istanbul';
  }

  /**
   * Invalidate cache for a tenant
   * @param tenantId Tenant ID
   */
  invalidateCache(tenantId: string): void {
    const metadataKey = CacheKeys.tenantMetadata(tenantId);
    const promptKey = CacheKeys.systemPrompt(tenantId);
    
    cache.delete(metadataKey);
    cache.delete(promptKey);
    
    console.log(`🗑️ Invalidated cache for tenant ${tenantId}`);
  }

  /**
   * Create new tenant
   * @param name Tenant name
   * @param sector Sector
   * @param metadata Initial metadata
   * @returns Created tenant
   */
  async createTenant(
    name: string,
    sector?: string,
    metadata: TenantMetadata = {}
  ): Promise<Tenant> {
    const { data, error } = await supabase
      .from('tenants')
      .insert({
        name,
        sector,
        status: 'PENDING',
        metadata
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating tenant:', error);
      throw new Error('Failed to create tenant');
    }

    const tenant: Tenant = {
      id: data.id,
      name: data.name,
      sector: data.sector,
      status: data.status,
      metadata: data.metadata || {},
      created_at: data.created_at,
      updated_at: data.updated_at
    };

    console.log(`✅ Created tenant ${tenant.id}`);
    return tenant;
  }

  /**
   * Update tenant status
   * @param tenantId Tenant ID
   * @param status New status
   */
  async updateStatus(tenantId: string, status: string): Promise<void> {
    const { error } = await supabase
      .from('tenants')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', tenantId);

    if (error) {
      console.error('Error updating tenant status:', error);
      throw new Error('Failed to update tenant status');
    }

    // Invalidate cache
    this.invalidateCache(tenantId);
    console.log(`✅ Updated status to ${status} for tenant ${tenantId}`);
  }
}

// Singleton instance
export const tenantService = new TenantService();
