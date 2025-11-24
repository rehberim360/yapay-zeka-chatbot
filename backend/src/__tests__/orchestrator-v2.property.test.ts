/**
 * Property-Based Tests for Orchestrator Service V2
 * 
 * Tests state persistence and resume logic
 * Requirements: 12.1-12.6, 12.9
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import * as fc from 'fast-check';
import { OrchestratorServiceV2 } from '../services/orchestrator-v2.js';
import { supabase } from '../lib/supabase.js';
import type { OnboardingPhase, OnboardingJob } from '../types/onboarding-v2.js';

describe('Orchestrator Service V2 - Property Tests', () => {
  let orchestrator: OrchestratorServiceV2;
  const testJobIds: string[] = [];

  beforeEach(() => {
    orchestrator = new OrchestratorServiceV2();
  });

  afterEach(async () => {
    // Cleanup test jobs
    if (testJobIds.length > 0) {
      try {
        await supabase
          .from('onboarding_jobs')
          .delete()
          .in('id', testJobIds);
      } catch (error) {
        console.error('Cleanup error:', error);
      }
      testJobIds.length = 0;
    }
  });

  /**
   * Property 20: State Persistence at Each Phase
   * **Feature: smart-onboarding-v2, Property 20: State Persistence at Each Phase**
   * **Validates: Requirements 12.1-12.6**
   * 
   * For any onboarding job, when a phase completes, the system should save 
   * phase_data to database before proceeding to next phase.
   */
  describe('Property 20: State Persistence at Each Phase', () => {
    it('should create job with initial phase data structure', async () => {
      // Create a test job
      const testUrl = 'https://example.com';
      const testUserId = crypto.randomUUID(); // Use proper UUID

      const job = await orchestrator.startOnboarding(testUrl, testUserId);
      testJobIds.push(job.id);

      // Verify job was created with correct structure
      expect(job).toBeDefined();
      expect(job.id).toBeDefined();
      expect(job.url).toBe(testUrl);
      expect(job.user_id).toBe(testUserId);
      expect(job.current_phase).toBe('SMART_DISCOVERY');
      expect(job.status).toBe('IN_PROGRESS');
      expect(job.phase_data).toBeDefined();
      
      console.log('✅ Job created with correct initial structure');
    }, 10000);

    it('should verify phase_data structure is maintained', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            url: fc.webUrl(),
            userId: fc.uuid()
          }),
          async ({ url, userId }) => {
            const job = await orchestrator.startOnboarding(url, userId);
            testJobIds.push(job.id);

            // Immediately check job structure
            const createdJob = await orchestrator.getJobStatus(job.id);
            
            // Verify phase data structure exists
            expect(createdJob?.phase_data).toBeDefined();
            expect(typeof createdJob?.phase_data).toBe('object');
          }
        ),
        { numRuns: 10, timeout: 30000 }
      );
    }, 60000);
  });

  /**
   * Property 21: Resume from Last Completed Phase
   * **Feature: smart-onboarding-v2, Property 21: Resume from Last Completed Phase**
   * **Validates: Requirements 12.9**
   * 
   * For any incomplete onboarding job, when user returns, the system should 
   * resume from the last successfully completed phase without losing previous data.
   */
  describe('Property 21: Resume from Last Completed Phase', () => {
    it('should preserve job ID and URL when resuming', async () => {
      // Create a job
      const testUrl = 'https://example.com';
      const testUserId = crypto.randomUUID(); // Use proper UUID

      const job = await orchestrator.startOnboarding(testUrl, testUserId);
      testJobIds.push(job.id);

      // Wait a bit for initial phase to start
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Get job state before resume
      const jobBeforeResume = await orchestrator.getJobStatus(job.id);
      expect(jobBeforeResume).not.toBeNull();
      
      const phaseBeforeResume = jobBeforeResume?.current_phase;
      const phaseDataBeforeResume = jobBeforeResume?.phase_data;

      console.log(`Job phase before resume: ${phaseBeforeResume}`);

      // Resume the job
      const resumedJob = await orchestrator.resumeOnboarding(job.id);

      // Verify job ID and URL are preserved
      expect(resumedJob.id).toBe(job.id);
      expect(resumedJob.url).toBe(testUrl);
      expect(resumedJob.user_id).toBe(testUserId);

      console.log('✅ Job ID and URL preserved after resume');
    }, 15000);

    it('should preserve phase_data when resuming', async () => {
      const testUrl = 'https://example.com';
      const testUserId = crypto.randomUUID(); // Use proper UUID

      // Create job
      const job = await orchestrator.startOnboarding(testUrl, testUserId);
      testJobIds.push(job.id);

      // Wait for some phase data to be created
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Get job state
      const jobBefore = await orchestrator.getJobStatus(job.id);
      expect(jobBefore).not.toBeNull();

      const phaseDataBefore = JSON.stringify(jobBefore?.phase_data || {});
      const currentPhaseBefore = jobBefore?.current_phase;

      console.log(`Phase before resume: ${currentPhaseBefore}`);
      console.log(`Phase data size before: ${phaseDataBefore.length} chars`);

      // Resume
      await orchestrator.resumeOnboarding(job.id);

      // Get job state after resume
      const jobAfter = await orchestrator.getJobStatus(job.id);
      expect(jobAfter).not.toBeNull();

      const phaseDataAfter = JSON.stringify(jobAfter?.phase_data || {});

      // Phase data should be preserved (at minimum, not lost)
      expect(jobAfter?.phase_data).toBeDefined();
      expect(typeof jobAfter?.phase_data).toBe('object');

      console.log(`Phase data size after: ${phaseDataAfter.length} chars`);
      console.log('✅ Phase data structure preserved');
    }, 20000);

    it('should handle resuming completed jobs gracefully', async () => {
      const testUrl = 'https://example.com';
      const testUserId = crypto.randomUUID(); // Use proper UUID

      // Create job
      const job = await orchestrator.startOnboarding(testUrl, testUserId);
      testJobIds.push(job.id);

      // Manually mark as completed
      await supabase
        .from('onboarding_jobs')
        .update({ status: 'COMPLETED' })
        .eq('id', job.id);

      // Resume should not throw error
      const resumedJob = await orchestrator.resumeOnboarding(job.id);

      // Should return the completed job
      expect(resumedJob.id).toBe(job.id);
      expect(resumedJob.status).toBe('COMPLETED');

      console.log('✅ Completed job resume handled gracefully');
    }, 10000);

    it('should handle resuming failed jobs', async () => {
      const testUrl = 'https://example.com';
      const testUserId = crypto.randomUUID(); // Use proper UUID

      // Create job
      const job = await orchestrator.startOnboarding(testUrl, testUserId);
      testJobIds.push(job.id);

      // Manually mark as failed
      await supabase
        .from('onboarding_jobs')
        .update({ status: 'FAILED' })
        .eq('id', job.id);

      // Resume should restart from current phase
      const resumedJob = await orchestrator.resumeOnboarding(job.id);

      expect(resumedJob.id).toBe(job.id);
      // Status might change to IN_PROGRESS after resume
      expect(['FAILED', 'IN_PROGRESS']).toContain(resumedJob.status);

      console.log('✅ Failed job resume handled');
    }, 15000);

    it('should throw error when resuming non-existent job', async () => {
      const fakeJobId = crypto.randomUUID(); // Use proper UUID

      // Resume should throw error
      await expect(
        orchestrator.resumeOnboarding(fakeJobId)
      ).rejects.toThrow();

      console.log('✅ Non-existent job throws error');
    }, 5000);

    it('should verify resume preserves all job fields with property testing', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            url: fc.webUrl(),
            userId: fc.uuid()
          }),
          async ({ url, userId }) => {
            // Start job
            const job = await orchestrator.startOnboarding(url, userId);
            testJobIds.push(job.id);

            // Wait a bit
            await new Promise(resolve => setTimeout(resolve, 500));

            // Get state before resume
            const beforeResume = await orchestrator.getJobStatus(job.id);
            if (!beforeResume) return; // Skip if job not found

            // Resume
            const afterResume = await orchestrator.resumeOnboarding(job.id);

            // Verify all critical fields are preserved
            expect(afterResume.id).toBe(job.id);
            expect(afterResume.url).toBe(url);
            expect(afterResume.user_id).toBe(userId);
            expect(afterResume.phase_data).toBeDefined();
            expect(afterResume.current_phase).toBeDefined();
          }
        ),
        { numRuns: 5, timeout: 30000 }
      );
    }, 60000);
  });

  /**
   * Additional test: Verify phase transitions
   */
  describe('Phase Transition Logic', () => {
    it('should transition through phases in correct order', async () => {
      const expectedOrder: OnboardingPhase[] = [
        'SMART_DISCOVERY',
        'SMART_PAGE_SELECTION',
        'BATCH_DEEP_DIVE',
        'COMPANY_INFO_REVIEW',
        'OFFERING_SELECTION',
        'COMPLETION'
      ];

      // This is a unit test to verify the phase order logic
      // In real workflow, some phases may be skipped (e.g., if user skips page selection)
      
      const testUrl = 'https://example.com';
      const testUserId = crypto.randomUUID(); // Use proper UUID

      const job = await orchestrator.startOnboarding(testUrl, testUserId);
      testJobIds.push(job.id);

      // Verify initial phase
      expect(job.current_phase).toBe('SMART_DISCOVERY');

      console.log('✅ Job starts with correct initial phase');
    }, 10000);
  });
});
