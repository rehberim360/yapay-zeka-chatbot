-- Migration: Add WAITING_APPROVAL phase to onboarding workflow
-- Date: 2025-11-23
-- Description: Simplify onboarding phases by adding WAITING_APPROVAL phase

-- Drop old constraint
ALTER TABLE onboarding_jobs 
DROP CONSTRAINT IF EXISTS onboarding_jobs_current_phase_check;

-- Add new constraint with WAITING_APPROVAL phase
ALTER TABLE onboarding_jobs 
ADD CONSTRAINT onboarding_jobs_current_phase_check 
CHECK (current_phase IN (
  'SMART_DISCOVERY',
  'SMART_PAGE_SELECTION', 
  'OFFERING_PAGES_SCRAPING',
  'WAITING_APPROVAL',
  'COMPLETION'
));

-- Update any existing jobs in old phases to WAITING_APPROVAL
UPDATE onboarding_jobs 
SET current_phase = 'WAITING_APPROVAL'
WHERE current_phase IN (
  'OFFERING_DETAIL_REVIEW',
  'OTHER_PAGES_SCRAPING',
  'COMPANY_INFO_REVIEW',
  'OFFERING_SELECTION'
)
AND status = 'IN_PROGRESS';
