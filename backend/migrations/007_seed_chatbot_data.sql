-- ⚠️ SUPABASE SQL EDITOR'de ÇALIŞTIRIN
-- Migration: Chatbot System - Seed Data
-- Tarih: 24 Kasım 2025
-- Amaç: Test ve demo için örnek veriler

-- ============================================
-- 1. TEST TENANT (Pilot Müşteri)
-- ============================================

-- Insert test tenant (if not exists)
INSERT INTO tenants (
    id,
    name,
    sector,
    business_type,
    bot_purpose,
    plan,
    allowed_domains,
    metadata
)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Demo Fitness Center',
    'Sağlık ve Spor',
    'fitness_center',
    'appointment_booking',
    'premium',
    ARRAY['localhost:3000', 'demo.example.com'],
    '{
        "address": "Atatürk Caddesi No:123, İstanbul",
        "phone": "+90 212 555 0123",
        "email": "info@demofitness.com",
        "working_hours": "Pazartesi-Cuma: 06:00-22:00, Cumartesi-Pazar: 08:00-20:00",
        "description": "Modern ekipmanlar ve uzman eğitmenlerle hizmet veren fitness merkezi"
    }'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 2. TEST USER (Admin)
-- ============================================

INSERT INTO users (
    id,
    tenant_id,
    email,
    full_name,
    role
)
VALUES (
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'admin@demofitness.com',
    'Demo Admin',
    'admin'
)
ON CONFLICT (tenant_id, email) DO NOTHING;

-- ============================================
-- 3. BOT CONFIG (Default)
-- ============================================

INSERT INTO bot_configs (
    tenant_id,
    system_instructions,
    personality,
    language,
    features,
    ai_model,
    temperature,
    max_tokens,
    is_active
)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Sen Demo Fitness Center için çalışan yardımsever bir asistansın. Müşterilere randevu almada, hizmetler hakkında bilgi vermede ve genel sorularını yanıtlamada yardımcı olursun.',
    'friendly',
    'tr',
    '{
        "appointments": true,
        "knowledge_base": true,
        "handover": true
    }'::jsonb,
    'gemini-2.5-flash-preview-09-2025',
    0.7,
    2048,
    true
)
ON CONFLICT (tenant_id) DO UPDATE SET
    system_instructions = EXCLUDED.system_instructions,
    updated_at = NOW();

-- ============================================
-- 4. SAMPLE OFFERINGS (Services)
-- ============================================

-- Personal Training
INSERT INTO offerings (
    tenant_id,
    name,
    type,
    price,
    currency,
    duration_min,
    description,
    category,
    provider_type,
    provider_name,
    buffer_minutes,
    is_available,
    attributes
)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Kişisel Antrenman',
    'SERVICE',
    250.00,
    'TRY',
    60,
    'Uzman eğitmenlerimizle birebir kişisel antrenman seansı',
    'Antrenman',
    'person',
    'Ahmet Yılmaz',
    15,
    true,
    '{
        "instructor": "Ahmet Yılmaz",
        "difficulty_level": "Tüm Seviyeler",
        "max_participants": 1,
        "equipment_included": true
    }'::jsonb
)
ON CONFLICT DO NOTHING;

-- Group Class
INSERT INTO offerings (
    tenant_id,
    name,
    type,
    price,
    currency,
    duration_min,
    description,
    category,
    provider_type,
    provider_name,
    buffer_minutes,
    is_available,
    attributes
)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Grup Yoga Dersi',
    'SERVICE',
    100.00,
    'TRY',
    45,
    'Rahatlatıcı yoga seansı, tüm seviyeler için uygun',
    'Grup Dersleri',
    'room',
    'Yoga Salonu',
    10,
    true,
    '{
        "instructor": "Ayşe Demir",
        "difficulty_level": "Başlangıç",
        "max_participants": 15,
        "equipment_provided": "Yoga matı"
    }'::jsonb
)
ON CONFLICT DO NOTHING;

-- Massage
INSERT INTO offerings (
    tenant_id,
    name,
    type,
    price,
    currency,
    duration_min,
    description,
    category,
    provider_type,
    provider_name,
    buffer_minutes,
    is_available,
    attributes
)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Spor Masajı',
    'SERVICE',
    300.00,
    'TRY',
    60,
    'Kas gevşetici profesyonel spor masajı',
    'Wellness',
    'person',
    'Mehmet Kaya',
    20,
    true,
    '{
        "therapist": "Mehmet Kaya",
        "massage_type": "Spor Masajı",
        "oils_used": "Doğal yağlar"
    }'::jsonb
)
ON CONFLICT DO NOTHING;

-- ============================================
-- 5. KNOWLEDGE BASE (SSS)
-- ============================================

-- Genel Bilgiler
INSERT INTO bot_knowledge_base (
    tenant_id,
    question,
    answer,
    category,
    keywords,
    priority,
    is_active
)
VALUES
(
    '00000000-0000-0000-0000-000000000001',
    'Çalışma saatleriniz nedir?',
    'Hafta içi 06:00-22:00, hafta sonu 08:00-20:00 arası hizmet veriyoruz.',
    'Genel',
    ARRAY['saat', 'açılış', 'kapanış', 'çalışma'],
    10,
    true
),
(
    '00000000-0000-0000-0000-000000000001',
    'Üyelik ücretleri nedir?',
    'Aylık üyelik 500 TL, 3 aylık 1.350 TL (10% indirim), yıllık 4.800 TL (20% indirim) şeklindedir.',
    'Üyelik',
    ARRAY['ücret', 'fiyat', 'üyelik', 'paket'],
    9,
    true
),
(
    '00000000-0000-0000-0000-000000000001',
    'İlk defa geliyorum, ne yapmalıyım?',
    'İlk ziyaretinizde resepsiyondan üyelik formunu doldurabilir ve ücretsiz deneme seansınızı kullanabilirsiniz. Eğitmenlerimiz size ekipmanları tanıtacak ve hedeflerinize uygun program hazırlayacaktır.',
    'Genel',
    ARRAY['ilk', 'yeni', 'başlangıç', 'deneme'],
    8,
    true
),
(
    '00000000-0000-0000-0000-000000000001',
    'Randevumu iptal edebilir miyim?',
    'Evet, randevunuzu en az 24 saat önceden iptal edebilirsiniz. Daha geç iptallerde ücret iadesi yapılmamaktadır.',
    'Randevu',
    ARRAY['iptal', 'randevu', 'değiştir'],
    7,
    true
),
(
    '00000000-0000-0000-0000-000000000001',
    'Hangi ekipmanlar mevcut?',
    'Salonumuzda koşu bantları, eliptik bisikletler, ağırlık makineleri, serbest ağırlıklar, TRX, pilates reformer ve fonksiyonel antrenman ekipmanları bulunmaktadır.',
    'Ekipman',
    ARRAY['ekipman', 'alet', 'makine', 'spor'],
    6,
    true
)
ON CONFLICT DO NOTHING;

-- ============================================
-- 6. SAMPLE CUSTOMER
-- ============================================

INSERT INTO customers (
    id,
    tenant_id,
    email,
    phone,
    full_name,
    metadata
)
VALUES (
    '00000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000001',
    'test@example.com',
    '+90 555 123 4567',
    'Test Müşteri',
    '{
        "source": "widget",
        "first_visit": "2025-11-24"
    }'::jsonb
)
ON CONFLICT (tenant_id, email) DO NOTHING;

-- ============================================
-- 7. VERIFICATION QUERIES
-- ============================================

-- Check tenant
SELECT id, name, business_type, plan FROM tenants 
WHERE id = '00000000-0000-0000-0000-000000000001';

-- Check offerings
SELECT name, type, price, duration_min FROM offerings 
WHERE tenant_id = '00000000-0000-0000-0000-000000000001';

-- Check knowledge base
SELECT question, category FROM bot_knowledge_base 
WHERE tenant_id = '00000000-0000-0000-0000-000000000001';

-- Check bot config
SELECT personality, language, is_active FROM bot_configs 
WHERE tenant_id = '00000000-0000-0000-0000-000000000001';

-- ✅ TAMAMLANDI!
-- Seed data başarıyla eklendi.
-- Test tenant ID: 00000000-0000-0000-0000-000000000001
