-- ============================================
-- YAPAY ZEKA CHATBOT DATABASE SCHEMA
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable Vector Extension (AI hafızası için)
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================
-- CORE TABLES
-- ============================================

-- Tenants Table (İşletme/Firma Bilgileri)
CREATE TABLE IF NOT EXISTS public.tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    sector TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Offerings Table (Hizmetler ve Ürünler)
CREATE TABLE IF NOT EXISTS public.offerings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT CHECK (type IN ('SERVICE', 'PRODUCT')),
    price DECIMAL(10, 2),
    currency TEXT DEFAULT 'TRY',
    duration_min INTEGER,
    attributes JSONB DEFAULT '{}'::jsonb,
    category TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- SCRAPING & ONBOARDING TABLES
-- ============================================

-- Scraping Jobs Table (Scraping İşlemlerini Takip Eder)
CREATE TABLE IF NOT EXISTS public.scraping_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id),
    status TEXT CHECK (
        status IN ('PENDING', 'DISCOVERY', 'STRATEGY', 'WAITING_APPROVAL', 'DEEP_DIVE', 'COMPLETED', 'FAILED')
    ),
    root_url TEXT NOT NULL,
    total_pages_found INTEGER DEFAULT 0,
    processed_pages INTEGER DEFAULT 0,
    error_log TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Scraped Pages Table (Her Sayfanın Ham Verisi)
CREATE TABLE IF NOT EXISTS public.scraped_pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID REFERENCES scraping_jobs(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    page_type TEXT,
    raw_markdown TEXT,
    extracted_data JSONB,
    is_processed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pending Approvals (Kullanıcı onayı bekleyen sayfalar)
CREATE TABLE IF NOT EXISTS public.pending_approvals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID REFERENCES scraping_jobs(id) ON DELETE CASCADE,
    suggested_pages JSONB NOT NULL, -- AI'ın önerdiği sayfalar
    home_data JSONB DEFAULT '{}'::jsonb, -- Ana sayfadan çıkarılan firma bilgileri
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Onboarding Jobs Table (Smart Onboarding V2 workflow takibi)
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

-- Security Logs Table (Güvenlik olayları kaydı)
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
-- PERFORMANCE INDEXES
-- ============================================

-- Existing tables indexes
CREATE INDEX IF NOT EXISTS idx_offerings_tenant_id ON offerings(tenant_id);
CREATE INDEX IF NOT EXISTS idx_offerings_type ON offerings(type);
CREATE INDEX IF NOT EXISTS idx_tenants_sector ON tenants(sector);
CREATE INDEX IF NOT EXISTS idx_scraping_jobs_status ON scraping_jobs(status);
CREATE INDEX IF NOT EXISTS idx_scraping_jobs_tenant_id ON scraping_jobs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_scraped_pages_job_id ON scraped_pages(job_id);
CREATE INDEX IF NOT EXISTS idx_scraped_pages_page_type ON scraped_pages(page_type);

-- JSONB GIN indexes for fast JSONB queries
CREATE INDEX IF NOT EXISTS idx_tenants_metadata ON tenants USING GIN (metadata);
CREATE INDEX IF NOT EXISTS idx_offerings_attributes ON offerings USING GIN (attributes);

-- Onboarding Jobs indexes
CREATE INDEX IF NOT EXISTS idx_onboarding_jobs_tenant_id ON onboarding_jobs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_jobs_user_id ON onboarding_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_jobs_status ON onboarding_jobs(status);
CREATE INDEX IF NOT EXISTS idx_onboarding_jobs_current_phase ON onboarding_jobs(current_phase);
CREATE INDEX IF NOT EXISTS idx_onboarding_jobs_phase_data ON onboarding_jobs USING GIN (phase_data);

-- Security Logs indexes
CREATE INDEX IF NOT EXISTS idx_security_logs_tenant_id ON security_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_security_logs_user_id ON security_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_security_logs_type ON security_logs(type);
CREATE INDEX IF NOT EXISTS idx_security_logs_timestamp ON security_logs(timestamp DESC);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE offerings ENABLE ROW LEVEL SECURITY;
ALTER TABLE scraping_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE scraped_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE pending_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_logs ENABLE ROW LEVEL SECURITY;

-- Development Policies (Geliştirme için tüm erişim açık)
-- ⚠️ PRODUCTION'A GEÇERKEN BU POLİCY'LERİ SİL VE GERÇEK POLİCY'LERİ YAZ
CREATE POLICY "Enable all access for dev" ON tenants FOR ALL USING (true);
CREATE POLICY "Enable all access for dev" ON offerings FOR ALL USING (true);
CREATE POLICY "Enable all access for dev" ON scraping_jobs FOR ALL USING (true);
CREATE POLICY "Enable all access for dev" ON scraped_pages FOR ALL USING (true);
CREATE POLICY "Enable all access for dev" ON pending_approvals FOR ALL USING (true);
CREATE POLICY "Enable all access for dev" ON onboarding_jobs FOR ALL USING (true);
CREATE POLICY "Enable all access for dev" ON security_logs FOR ALL USING (true);

-- ============================================
-- COMMENTS & DOCUMENTATION
-- ============================================

COMMENT ON TABLE tenants IS 'Stores business/company information including AI-detected metadata';
COMMENT ON TABLE offerings IS 'Services and products offered by businesses';
COMMENT ON TABLE scraping_jobs IS 'Tracks website scraping jobs for onboarding';
COMMENT ON TABLE scraped_pages IS 'Stores raw scraped content and extracted data for each page';
COMMENT ON TABLE onboarding_jobs IS 'Tracks Smart Onboarding V2 workflow state and progress';
COMMENT ON TABLE security_logs IS 'Records security events like prompt injection attempts and rate limiting';

COMMENT ON COLUMN tenants.metadata IS 'Flexible JSONB field for storing business details like address, phone, working hours, etc.';
COMMENT ON COLUMN offerings.type IS 'SERVICE for bookable services, PRODUCT for purchasable items';
COMMENT ON COLUMN offerings.attributes IS 'Sector-specific attributes (e.g., hotel room amenities, restaurant dish ingredients)';
COMMENT ON COLUMN scraping_jobs.status IS 'Current status of the scraping job: PENDING -> DISCOVERY -> STRATEGY -> DEEP_DIVE -> COMPLETED/FAILED';
COMMENT ON COLUMN scraped_pages.page_type IS 'Type of page: HOME, SERVICE_DETAIL, PRODUCT_DETAIL, CONTACT, JOB_RESULT';
COMMENT ON COLUMN scraped_pages.raw_markdown IS 'Raw markdown content of the scraped page for audit trail';
COMMENT ON COLUMN scraped_pages.extracted_data IS 'Structured data extracted by AI from the page';
COMMENT ON COLUMN onboarding_jobs.tenant_id IS 'Links to the tenant being configured';
COMMENT ON COLUMN onboarding_jobs.user_id IS 'User performing the onboarding for this tenant';
COMMENT ON COLUMN onboarding_jobs.current_phase IS 'Current phase in the onboarding workflow';
COMMENT ON COLUMN onboarding_jobs.phase_data IS 'Stores data for each completed phase (sector_analysis, company_info, offerings, etc.)';
COMMENT ON COLUMN onboarding_jobs.error_log IS 'Array of error objects with timestamp, phase, and error details';
COMMENT ON COLUMN security_logs.type IS 'Type of security event detected';
COMMENT ON COLUMN security_logs.metadata IS 'Additional context about the security event (patterns detected, IP address, etc.)';
