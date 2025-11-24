-- ⚠️ SUPABASE SQL EDITOR'de ÇALIŞTIRIN

-- pending_approvals tablosuna home_data kolonu ekle
ALTER TABLE public.pending_approvals 
ADD COLUMN IF NOT EXISTS home_data JSONB DEFAULT '{}'::jsonb;

-- Yorum ekle
COMMENT ON COLUMN pending_approvals.home_data IS 'Ana sayfadan çıkarılan firma bilgileri ve offerings';

-- ✅ TAMAMLANDI!
-- Test etmek için:
SELECT id, job_id, home_data FROM pending_approvals LIMIT 1;
