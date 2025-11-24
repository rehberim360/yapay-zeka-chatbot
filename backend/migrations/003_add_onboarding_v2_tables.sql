-- ⚠️ SUPABASE SQL EDITOR'de ÇALIŞTIRIN
-- Migration: Smart Onboarding V2 - Onboarding Jobs ve Security Logs

-- ============================================
-- 1. ONBOARDING JOBS TABLE
-- ============================================

-- Onboarding Jobs Table (Onboarding sürecini takip eder)
CREATE TABLE IF NOT EXISTS public.onboarding_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    url TEXT NOT NULL,
    current_phase TEXT NOT NULL CHECK (
        current_phase IN (
            'SMART_DISCOVERY',
            'SMART_PAGE_SELECTION',
            'BATCH_DEEP_DIVE',
            'COMPANY_INFO_REVIEW',
            'OFFERING_SELECTION',
            'COMPLETION'
        )
    ),
    phase_data JSONB DEFAULT '{}'::jsonb,
    status TEXT DEFAULT 'IN_PROGRESS' CHECK (
        status IN ('IN_PROGRESS', 'COMPLETED', 'FAILED')
    ),
    error_log JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 2. SECURITY LOGS TABLE
-- ============================================

-- Security Logs Table (Güvenlik olaylarını kaydeder)
CREATE TABLE IF NOT EXISTS public.security_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    user_id TEXT,
    message TEXT NOT NULL,
    type TEXT NOT NULL CHECK (
        type IN (
            'PROMPT_INJECTION_ATTEMPT',
            'RATE_LIMIT_EXCEEDED',
            'SUSPICIOUS_PATTERN',
            'INPUT_SANITIZED',
            'OUTPUT_FILTERED'
        )
    ),
    metadata JSONB DEFAULT '{}'::jsonb,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 3. PERFORMANCE INDEXES
-- ============================================

-- Onboarding Jobs Indexes
CREATE INDEX IF NOT EXISTS idx_onboarding_jobs_tenant_id 
    ON onboarding_jobs(tenant_id);

CREATE INDEX IF NOT EXISTS idx_onboarding_jobs_user_id 
    ON onboarding_jobs(user_id);

CREATE INDEX IF NOT EXISTS idx_onboarding_jobs_status 
    ON onboarding_jobs(status);

CREATE INDEX IF NOT EXISTS idx_onboarding_jobs_current_phase 
    ON onboarding_jobs(current_phase);

-- JSONB GIN Index for phase_data (fast JSONB queries)
CREATE INDEX IF NOT EXISTS idx_onboarding_jobs_phase_data 
    ON onboarding_jobs USING GIN (phase_data);

-- Security Logs Indexes
CREATE INDEX IF NOT EXISTS idx_security_logs_tenant_id 
    ON security_logs(tenant_id);

CREATE INDEX IF NOT EXISTS idx_security_logs_user_id 
    ON security_logs(user_id);

CREATE INDEX IF NOT EXISTS idx_security_logs_type 
    ON security_logs(type);

CREATE INDEX IF NOT EXISTS idx_security_logs_timestamp 
    ON security_logs(timestamp DESC);

-- ============================================
-- 4. EXISTING TABLES - ADD JSONB GIN INDEXES
-- ============================================

-- Tenants metadata JSONB GIN index
CREATE INDEX IF NOT EXISTS idx_tenants_metadata 
    ON tenants USING GIN (metadata);

-- Offerings attributes JSONB GIN index
CREATE INDEX IF NOT EXISTS idx_offerings_attributes 
    ON offerings USING GIN (attributes);

-- ============================================
-- 5. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on new tables
ALTER TABLE onboarding_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_logs ENABLE ROW LEVEL SECURITY;

-- Development Policies (Geliştirme için tüm erişim açık)
-- ⚠️ PRODUCTION'A GEÇERKEN BU POLİCY'LERİ SİL VE GERÇEK POLİCY'LERİ YAZ
CREATE POLICY "Enable all access for dev" ON onboarding_jobs FOR ALL USING (true);
CREATE POLICY "Enable all access for dev" ON security_logs FOR ALL USING (true);

-- ============================================
-- 6. COMMENTS & DOCUMENTATION
-- ============================================

COMMENT ON TABLE onboarding_jobs IS 'Tracks Smart Onboarding V2 workflow state and progress';
COMMENT ON TABLE security_logs IS 'Records security events like prompt injection attempts and rate limiting';

COMMENT ON COLUMN onboarding_jobs.tenant_id IS 'Links to the tenant being configured';
COMMENT ON COLUMN onboarding_jobs.user_id IS 'User performing the onboarding for this tenant';
COMMENT ON COLUMN onboarding_jobs.current_phase IS 'Current phase in the onboarding workflow';
COMMENT ON COLUMN onboarding_jobs.phase_data IS 'Stores data for each completed phase (sector_analysis, company_info, offerings, etc.)';
COMMENT ON COLUMN onboarding_jobs.error_log IS 'Array of error objects with timestamp, phase, and error details';

COMMENT ON COLUMN security_logs.type IS 'Type of security event detected';
COMMENT ON COLUMN security_logs.metadata IS 'Additional context about the security event (patterns detected, IP address, etc.)';

-- ============================================
-- 7. VERIFICATION QUERIES
-- ============================================

-- Verify tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('onboarding_jobs', 'security_logs');

-- Verify indexes were created
SELECT indexname, tablename 
FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename IN ('onboarding_jobs', 'security_logs', 'tenants', 'offerings')
ORDER BY tablename, indexname;

-- ✅ TAMAMLANDI!
-- Migration başarıyla uygulandı.
