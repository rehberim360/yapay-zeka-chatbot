-- ⚠️ SUPABASE SQL EDITOR'de ÇALIŞTIRIN
-- Migration: Update Onboarding Phases - Add New Phases

-- ============================================
-- 1. DROP OLD CHECK CONSTRAINT
-- ============================================

ALTER TABLE public.onboarding_jobs 
DROP CONSTRAINT IF EXISTS onboarding_jobs_current_phase_check;

-- ============================================
-- 2. ADD NEW CHECK CONSTRAINT WITH ALL PHASES
-- ============================================

ALTER TABLE public.onboarding_jobs 
ADD CONSTRAINT onboarding_jobs_current_phase_check 
CHECK (
    current_phase IN (
        'SMART_DISCOVERY',
        'SMART_PAGE_SELECTION',
        'OFFERING_PAGES_SCRAPING',
        'OFFERING_DETAIL_REVIEW',
        'OTHER_PAGES_SCRAPING',
        'COMPANY_INFO_REVIEW',
        'OFFERING_SELECTION',
        'COMPLETION',
        -- Legacy phases (backward compatibility)
        'BATCH_DEEP_DIVE'
    )
);

-- ============================================
-- 3. VERIFICATION
-- ============================================

-- Verify constraint was updated
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'onboarding_jobs'::regclass 
AND conname = 'onboarding_jobs_current_phase_check';

-- ✅ TAMAMLANDI!
-- Yeni phase'ler eklendi:
-- - OFFERING_PAGES_SCRAPING
-- - OFFERING_DETAIL_REVIEW
-- - OTHER_PAGES_SCRAPING

