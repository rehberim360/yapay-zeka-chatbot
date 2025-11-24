/**
 * Property-Based Tests for Offerings Database Operations
 * 
 * Tests JSONB serialization/deserialization for meta_info
 * Requirements: 6.9, 6.10, 8.5
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import * as fc from 'fast-check';
import { OrchestratorServiceV2 } from '../services/orchestrator-v2.js';
import { supabase } from '../lib/supabase.js';
import type { Offering } from '../types/onboarding-v2.js';

describe('Offerings Database Operations - Property Tests', () => {
  let orchestrator: OrchestratorServiceV2;
  const testTenantIds: string[] = [];

  beforeEach(() => {
    orchestrator = new OrchestratorServiceV2();
  });

  afterEach(async () => {
    // Cleanup test data
    if (testTenantIds.length > 0) {
      try {
        // Delete offerings for test tenants
        await supabase
          .from('offerings')
          .delete()
          .in('tenant_id', testTenantIds);
      } catch (error) {
        console.error('Cleanup error:', error);
      }
      testTenantIds.length = 0;
    }
  });

  /**
   * Property 10: Offerings Round-Trip Serialization
   * **Feature: smart-onboarding-v2, Property 10: Offerings Round-Trip Serialization**
   * **Validates: Requirements 6.9, 6.10**
   * 
   * For any offering with meta_info, when saved to database and retrieved,
   * the meta_info should be preserved exactly (JSONB round-trip).
   */
  describe('Property 10: Offerings Round-Trip Serialization', () => {
    it('should preserve meta_info through database round-trip', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            offering: fc.record({
              name: fc.string({ minLength: 1, maxLength: 100 }),
              type: fc.constantFrom('SERVICE', 'PRODUCT'),
              price: fc.option(fc.float({ min: 0, max: 100000 }), { nil: null }),
              currency: fc.option(fc.constantFrom('TRY', 'USD', 'EUR'), { nil: null }),
              category: fc.option(fc.string({ maxLength: 100 }), { nil: null }),
              meta_info: fc.record({
                duration: fc.option(fc.string(), { nil: null }),
                ingredients: fc.option(fc.array(fc.string()), { nil: null }),
                custom_field: fc.option(fc.string(), { nil: null })
              })
            })
          }),
          async ({ offering }) => {
            // Generate unique tenant ID for each test run
            const tenantId = crypto.randomUUID();
            testTenantIds.push(tenantId);

            // Create tenant first
            await supabase.from('tenants').insert({
              id: tenantId,
              name: 'Test Tenant',
              sector: 'TEST'
            });

            // Save offering
            await supabase.from('offerings').insert({
              tenant_id: tenantId,
              name: offering.name,
              type: offering.type,
              price: offering.price,
              currency: offering.currency || 'TRY',
              duration_min: null,
              category: offering.category,
              attributes: offering.meta_info // Store in JSONB
            });

            // Retrieve offering
            const retrieved = await orchestrator.getOfferings(tenantId);

            // Verify meta_info is preserved
            expect(retrieved.length).toBe(1);
            expect(retrieved[0].name).toBe(offering.name);
            expect(retrieved[0].meta_info).toEqual(offering.meta_info);
          }
        ),
        { numRuns: 10, timeout: 30000 }
      );
    }, 60000);

    it('should handle null meta_info fields correctly', async () => {
      const tenantId = crypto.randomUUID();
      testTenantIds.push(tenantId);

      // Create tenant
      const { error: tenantError } = await supabase.from('tenants').insert({
        id: tenantId,
        name: 'Test Tenant',
        sector: 'TEST'
      });
      
      if (tenantError) {
        console.error('Tenant creation error:', tenantError);
        throw new Error(`Failed to create tenant: ${tenantError.message}`);
      }

      // Save offering with null meta_info fields
      const { error: offeringError } = await supabase.from('offerings').insert({
        tenant_id: tenantId,
        name: 'Test Offering',
        type: 'SERVICE',
        attributes: {
          field1: null,
          field2: 'value',
          field3: null
        }
      });
      
      if (offeringError) {
        console.error('Offering creation error:', offeringError);
        throw new Error(`Failed to create offering: ${offeringError.message}`);
      }

      // Retrieve
      const offerings = await orchestrator.getOfferings(tenantId);

      expect(offerings.length).toBe(1);
      expect(offerings[0].meta_info).toEqual({
        field1: null,
        field2: 'value',
        field3: null
      });
    }, 10000);

    it('should handle empty meta_info object', async () => {
      const tenantId = crypto.randomUUID();
      testTenantIds.push(tenantId);

      // Create tenant
      await supabase.from('tenants').insert({
        id: tenantId,
        name: 'Test Tenant',
        sector: 'TEST'
      });

      // Save offering with empty meta_info
      await supabase.from('offerings').insert({
        tenant_id: tenantId,
        name: 'Empty Meta Offering',
        type: 'PRODUCT',
        attributes: {}
      });

      // Retrieve
      const offerings = await orchestrator.getOfferings(tenantId);

      expect(offerings.length).toBe(1);
      expect(offerings[0].meta_info).toEqual({});
    }, 10000);

    it('should handle complex nested meta_info structures', async () => {
      const tenantId = crypto.randomUUID();
      testTenantIds.push(tenantId);

      // Create tenant
      await supabase.from('tenants').insert({
        id: tenantId,
        name: 'Test Tenant',
        sector: 'TEST'
      });

      const complexMetaInfo = {
        ingredients: ['flour', 'sugar', 'eggs'],
        nutrition: {
          calories: 250,
          protein: 5,
          carbs: 30
        },
        allergens: ['gluten', 'dairy'],
        custom_fields: {
          field1: 'value1',
          field2: 123,
          field3: true
        }
      };

      // Save offering with complex meta_info
      await supabase.from('offerings').insert({
        tenant_id: tenantId,
        name: 'Complex Offering',
        type: 'PRODUCT',
        attributes: complexMetaInfo
      });

      // Retrieve
      const offerings = await orchestrator.getOfferings(tenantId);

      expect(offerings.length).toBe(1);
      expect(offerings[0].meta_info).toEqual(complexMetaInfo);
    }, 10000);

    it('should isolate offerings by tenant_id', async () => {
      const tenant1Id = crypto.randomUUID();
      const tenant2Id = crypto.randomUUID();
      testTenantIds.push(tenant1Id, tenant2Id);

      // Create tenants
      await supabase.from('tenants').insert([
        { id: tenant1Id, name: 'Tenant 1', sector: 'TEST' },
        { id: tenant2Id, name: 'Tenant 2', sector: 'TEST' }
      ]);

      // Save offerings for tenant 1
      await supabase.from('offerings').insert([
        {
          tenant_id: tenant1Id,
          name: 'Tenant 1 Offering 1',
          type: 'SERVICE',
          attributes: { tenant: '1' }
        },
        {
          tenant_id: tenant1Id,
          name: 'Tenant 1 Offering 2',
          type: 'SERVICE',
          attributes: { tenant: '1' }
        }
      ]);

      // Save offerings for tenant 2
      await supabase.from('offerings').insert([
        {
          tenant_id: tenant2Id,
          name: 'Tenant 2 Offering 1',
          type: 'PRODUCT',
          attributes: { tenant: '2' }
        }
      ]);

      // Retrieve for tenant 1
      const tenant1Offerings = await orchestrator.getOfferings(tenant1Id);
      expect(tenant1Offerings.length).toBe(2);
      expect(tenant1Offerings.every(o => o.meta_info?.tenant === '1')).toBe(true);

      // Retrieve for tenant 2
      const tenant2Offerings = await orchestrator.getOfferings(tenant2Id);
      expect(tenant2Offerings.length).toBe(1);
      expect(tenant2Offerings[0].meta_info?.tenant).toBe('2');
    }, 15000);

    it('should preserve data types in meta_info', async () => {
      const tenantId = crypto.randomUUID();
      testTenantIds.push(tenantId);

      // Create tenant
      await supabase.from('tenants').insert({
        id: tenantId,
        name: 'Test Tenant',
        sector: 'TEST'
      });

      const metaInfoWithTypes = {
        string_field: 'text',
        number_field: 42,
        float_field: 3.14,
        boolean_field: true,
        null_field: null,
        array_field: [1, 2, 3],
        object_field: { nested: 'value' }
      };

      // Save offering
      await supabase.from('offerings').insert({
        tenant_id: tenantId,
        name: 'Type Test Offering',
        type: 'SERVICE',
        attributes: metaInfoWithTypes
      });

      // Retrieve
      const offerings = await orchestrator.getOfferings(tenantId);

      expect(offerings.length).toBe(1);
      const retrieved = offerings[0].meta_info;

      // Verify types are preserved
      expect(typeof retrieved?.string_field).toBe('string');
      expect(typeof retrieved?.number_field).toBe('number');
      expect(typeof retrieved?.float_field).toBe('number');
      expect(typeof retrieved?.boolean_field).toBe('boolean');
      expect(retrieved?.null_field).toBeNull();
      expect(Array.isArray(retrieved?.array_field)).toBe(true);
      expect(typeof retrieved?.object_field).toBe('object');
    }, 10000);
  });
});
