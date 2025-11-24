-- ⚠️ SUPABASE SQL EDITOR'de ÇALIŞTIRINhttps://nyrthljbfokagcwyujbo.supabase.co/project/_/sql

-- 1. Job status'e WAITING_APPROVAL ekle
-- (Eğer constraint error alırsanız, constraint'i drop edip yeniden oluşturun)

-- Önce mevcut constraint'i kaldır
ALTER TABLE scraping_jobs DROP CONSTRAINT IF EXISTS scraping_jobs_status_check;

-- Yeni constraint ekle (WAITING_APPROVAL dahil)
ALTER TABLE scraping_jobs ADD CONSTRAINT scraping_jobs_status_check 
CHECK (status IN ('PENDING', 'DISCOVERY', 'STRATEGY', 'WAITING_APPROVAL', 'DEEP_DIVE', 'COMPLETED', 'FAILED'));

-- 2. pending_approvals tablosunu oluştur
CREATE TABLE IF NOT EXISTS public.pending_approvals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID REFERENCES scraping_jobs(id) ON DELETE CASCADE,
    suggested_pages JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. RLS aktif et
ALTER TABLE pending_approvals ENABLE ROW LEVEL SECURITY;

-- 4. Dev policy ekle
CREATE POLICY "Enable all access for dev" ON pending_approvals FOR ALL USING (true);

-- 5. Index ekle (performance için)
CREATE INDEX IF NOT EXISTS idx_pending_approvals_job_id ON pending_approvals(job_id);

-- ✅ TAMAMLANDI!
-- Test etmek için:
SELECT * FROM scraping_jobs LIMIT 1;
