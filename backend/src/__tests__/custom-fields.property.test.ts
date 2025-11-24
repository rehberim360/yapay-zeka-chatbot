/**
 * Property-Based Tests for Custom Field Management
 * 
 * Tests custom field operations on offerings:
 * - Add custom field
 * - Update custom field
 * - Remove custom field
 * - Field name validation
 * - Field uniqueness
 * 
 * Requirements: 6A.4-6A.14
 * Task: 24.5
 */

import fc from 'fast-check';
import { OrchestratorServiceV2 } from '../services/orchestrator-v2.js';
import { supabase } from '../lib/supabase.js';
import type { Offering, CustomFieldMetadata } from '../types/onboarding-v2.js';

describe('Custom Field Management - Property Tests', () => {
  let orchestrator: OrchestratorServiceV2;
  let testTenantId: string;
  let testOfferingId: string;

  beforeAll(() => {
    orchestrator = new OrchestratorServiceV2();
  });

  beforeEach(async () => {
    // Create test tenant
    testTenantId = crypto.randomUUID();
    const { error: tenantError } = await supabase.from('tenants').insert({
      id: testTenantId,
      name: 'Test Tenant'
    });

    if (tenantError) {
      throw new Error(`Failed to create tenant: ${tenantError.message}`);
    }

    // Create test offering
    const { data, error: offeringError } = await supabase
      .from('offerings')
      .insert({
        tenant_id: testTenantId,
        name: 'Test Offering',
        type: 'SERVICE',
        price: 100,
        currency: 'TRY',
        attributes: {
          duration: '30 dk',
          _custom_fields: [
            {
              key: 'duration',
              label: 'Süre',
              type: 'string',
              added_by: 'ai',
              added_at: new Date().toISOString()
            }
          ]
        }
      })
      .select()
      .single();

    if (offeringError || !data) {
      throw new Error(`Failed to create offering: ${offeringError?.message || 'No data returned'}`);
    }

    testOfferingId = data.id;
  });

  afterEach(async () => {
    // Cleanup
    await supabase.from('offerings').delete().eq('tenant_id', testTenantId);
    await supabase.from('tenants').delete().eq('id', testTenantId);
  });

  /**
   * Property 31: Custom Field Name Validation
   * 
   * Validates: Requirements 6A.8, 6A.9
   * 
   * Tests that field names must be:
   * - snake_case format
   * - max 50 characters
   * - unique within offering
   */
  test('Property 31: Field name must be snake_case and max 50 chars', async () => {
    // Test valid names
    const validNames = ['test_field', 'price_usd', 'item_123', 'a', 'test_' + 'x'.repeat(44)];
    for (const key of validNames) {
      const result = await orchestrator.addCustomField(
        testOfferingId,
        key,
        'test value',
        'string',
        'Test Label'
      );
      expect(result.meta_info).toHaveProperty(key);
    }

    // Test invalid names - empty string should be rejected
    const invalidNames = ['Test', 'test-field', 'test field', 'test.field', 'test@field', 'x'.repeat(51)];
    for (const key of invalidNames) {
      await expect(
        orchestrator.addCustomField(testOfferingId, key, 'test', 'string', 'Test')
      ).rejects.toThrow();
    }

    // Test empty string separately to ensure it's rejected
    await expect(
      orchestrator.addCustomField(testOfferingId, '', 'test', 'string', 'Test')
    ).rejects.toThrow();

    // Test duplicate (Requirement 6A.9)
    await expect(
      orchestrator.addCustomField(testOfferingId, 'duration', 'test', 'string', 'Test')
    ).rejects.toThrow(/already exists/);
  }, 10000);

  /**
   * Property 32: Custom Field CRUD Operations
   * 
   * Validates: Requirements 6A.4-6A.12
   * 
   * Tests complete lifecycle:
   * 1. Add custom field
   * 2. Update custom field value
   * 3. Remove custom field
   */
  test('Property 32: Custom field CRUD operations work correctly', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          randomSuffix: fc.string({ minLength: 2, maxLength: 10 })
            .map(s => s.toLowerCase().replace(/[^a-z0-9]/g, '_')),
          initialValue: fc.string({ minLength: 1, maxLength: 100 }),
          updatedValue: fc.string({ minLength: 1, maxLength: 100 }),
          label: fc.string({ minLength: 1, maxLength: 50 })
        }),
        async ({ randomSuffix, initialValue, updatedValue, label }) => {
          // Generate unique key for each test run
          const key = `test_${randomSuffix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
          
          // 1. Add custom field
          const added = await orchestrator.addCustomField(
            testOfferingId,
            key,
            initialValue,
            'string',
            label
          );

          expect(added.meta_info).toHaveProperty(key, initialValue);
          expect(added.meta_info?._custom_fields).toContainEqual(
            expect.objectContaining({
              key,
              added_by: 'user',
              added_at: expect.any(String)
            })
          );

          // 2. Update custom field
          const updated = await orchestrator.updateCustomField(
            testOfferingId,
            key,
            updatedValue
          );

          expect(updated.meta_info).toHaveProperty(key, updatedValue);
          expect(updated.meta_info?._custom_fields).toContainEqual(
            expect.objectContaining({
              key,
              updated_at: expect.any(String)
            })
          );

          // 3. Remove custom field
          const removed = await orchestrator.removeCustomField(
            testOfferingId,
            key
          );

          expect(removed.meta_info).not.toHaveProperty(key);
          expect(removed.meta_info?._custom_fields).not.toContainEqual(
            expect.objectContaining({ key })
          );
        }
      ),
      { numRuns: 5 }
    );
  }, 20000);

  /**
   * Property 33: XSS Protection in Custom Fields
   * 
   * Validates: Requirements 6A.10
   * 
   * Tests that HTML/script tags are sanitized from string values
   */
  test('Property 33: XSS protection sanitizes HTML and script tags', async () => {
    const testCases = [
      { value: '<script>alert("xss")</script>', expected: '' },
      { value: '<img src=x onerror="alert(1)">', expected: '' },
      { value: '<div onclick="alert(1)">Click</div>', expected: 'Click' },
      { value: 'Normal text with <b>HTML</b> tags', expected: 'Normal text with HTML tags' }
    ];

    for (const testCase of testCases) {
      const key = `xss_test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const result = await orchestrator.addCustomField(
        testOfferingId,
        key,
        testCase.value,
        'string',
        'XSS Test'
      );

      const sanitizedValue = result.meta_info?.[key];

      // Should not contain script tags
      expect(sanitizedValue).not.toMatch(/<script/i);
      expect(sanitizedValue).not.toMatch(/<\/script>/i);

      // Should not contain HTML tags
      expect(sanitizedValue).not.toMatch(/<[^>]+>/);

      // Should match expected sanitized value
      expect(sanitizedValue).toBe(testCase.expected);
    }
  }, 10000);

  /**
   * Property 34: Cannot Remove AI-Discovered Fields
   * 
   * Validates: Requirements 6A.12, 6A.13
   * 
   * Tests that AI-discovered fields cannot be removed by users
   */
  test('Property 34: AI-discovered fields cannot be removed', async () => {
    // Try to remove AI-discovered field 'duration'
    await expect(
      orchestrator.removeCustomField(testOfferingId, 'duration')
    ).rejects.toThrow(/Cannot remove AI-discovered field/);

    // Verify field still exists
    const { data } = await supabase
      .from('offerings')
      .select('*')
      .eq('id', testOfferingId)
      .single();

    expect(data?.attributes).toHaveProperty('duration');
  });

  /**
   * Property 35: Custom Field Metadata Tracking
   * 
   * Validates: Requirements 6A.6, 6A.7
   * 
   * Tests that custom field metadata is properly tracked:
   * - added_by (ai/user)
   * - added_at timestamp
   * - updated_at timestamp
   */
  test('Property 35: Custom field metadata is properly tracked', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          randomSuffix: fc.string({ minLength: 2, maxLength: 10 })
            .map(s => s.toLowerCase().replace(/[^a-z0-9]/g, '_')),
          value: fc.string({ minLength: 1, maxLength: 100 }),
          label: fc.string({ minLength: 1, maxLength: 50 })
        }),
        async ({ randomSuffix, value, label }) => {
          // Generate unique key for each test run
          const key = `meta_${randomSuffix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
          const beforeAdd = new Date();

          // Add field
          const added = await orchestrator.addCustomField(
            testOfferingId,
            key,
            value,
            'string',
            label
          );

          const afterAdd = new Date();

          const fieldMeta = added.meta_info?._custom_fields?.find(
            (f: CustomFieldMetadata) => f.key === key
          );

          expect(fieldMeta).toBeDefined();
          expect(fieldMeta?.added_by).toBe('user');
          expect(fieldMeta?.added_at).toBeDefined();

          const addedAt = new Date(fieldMeta!.added_at);
          expect(addedAt.getTime()).toBeGreaterThanOrEqual(beforeAdd.getTime() - 1000);
          expect(addedAt.getTime()).toBeLessThanOrEqual(afterAdd.getTime() + 1000);

          // Update field
          const beforeUpdate = new Date();
          await new Promise(resolve => setTimeout(resolve, 10)); // Small delay

          const updated = await orchestrator.updateCustomField(
            testOfferingId,
            key,
            'updated value'
          );

          const afterUpdate = new Date();

          const updatedFieldMeta = updated.meta_info?._custom_fields?.find(
            (f: CustomFieldMetadata) => f.key === key
          );

          expect(updatedFieldMeta?.updated_at).toBeDefined();

          const updatedAt = new Date(updatedFieldMeta!.updated_at!);
          expect(updatedAt.getTime()).toBeGreaterThanOrEqual(beforeUpdate.getTime() - 1000);
          expect(updatedAt.getTime()).toBeLessThanOrEqual(afterUpdate.getTime() + 1000);
        }
      ),
      { numRuns: 5 }
    );
  }, 20000);
});
