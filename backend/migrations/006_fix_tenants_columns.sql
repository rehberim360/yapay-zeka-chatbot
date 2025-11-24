-- ⚠️ SUPABASE SQL EDITOR'de ÇALIŞTIRIN
-- Migration Fix: Tenants tablosuna eksik kolonları ekle
-- Tarih: 24 Kasım 2025

-- Önce mevcut kolonları kontrol et
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'tenants'
ORDER BY ordinal_position;

-- Eksik kolonları ekle (IF NOT EXISTS ile güvenli)
DO $$ 
BEGIN
    -- business_type kolonu
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'tenants' 
        AND column_name = 'business_type'
    ) THEN
        ALTER TABLE tenants ADD COLUMN business_type VARCHAR(50);
        RAISE NOTICE 'business_type kolonu eklendi';
    ELSE
        RAISE NOTICE 'business_type kolonu zaten mevcut';
    END IF;

    -- bot_purpose kolonu
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'tenants' 
        AND column_name = 'bot_purpose'
    ) THEN
        ALTER TABLE tenants ADD COLUMN bot_purpose VARCHAR(50);
        RAISE NOTICE 'bot_purpose kolonu eklendi';
    ELSE
        RAISE NOTICE 'bot_purpose kolonu zaten mevcut';
    END IF;

    -- allowed_domains kolonu
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'tenants' 
        AND column_name = 'allowed_domains'
    ) THEN
        ALTER TABLE tenants ADD COLUMN allowed_domains TEXT[] DEFAULT ARRAY[]::TEXT[];
        RAISE NOTICE 'allowed_domains kolonu eklendi';
    ELSE
        RAISE NOTICE 'allowed_domains kolonu zaten mevcut';
    END IF;

    -- plan kolonu
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'tenants' 
        AND column_name = 'plan'
    ) THEN
        ALTER TABLE tenants ADD COLUMN plan VARCHAR(20) DEFAULT 'free' 
            CHECK (plan IN ('free', 'basic', 'premium', 'enterprise'));
        RAISE NOTICE 'plan kolonu eklendi';
    ELSE
        RAISE NOTICE 'plan kolonu zaten mevcut';
    END IF;
END $$;

-- Tekrar kontrol et
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'tenants'
ORDER BY ordinal_position;

-- ✅ TAMAMLANDI!
-- Şimdi 007_seed_chatbot_data.sql dosyasını çalıştırabilirsin.
