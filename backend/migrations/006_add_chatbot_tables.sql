-- ⚠️ SUPABASE SQL EDITOR'de ÇALIŞTIRIN
-- Migration: Chatbot System - Core Tables
-- Tarih: 24 Kasım 2025
-- Amaç: İlk müşteri için minimal chatbot sistemi

-- ============================================
-- 1. OFFERINGS TABLOSUNA YENİ ALANLAR
-- ============================================

-- Randevu sistemi için gerekli alanlar
ALTER TABLE offerings 
ADD COLUMN IF NOT EXISTS provider_type TEXT,
ADD COLUMN IF NOT EXISTS provider_name TEXT,
ADD COLUMN IF NOT EXISTS buffer_minutes INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS source_url TEXT,
ADD COLUMN IF NOT EXISTS description TEXT;

-- ============================================
-- 2. TENANTS TABLOSUNA GÜVENLİK ALANLARI
-- ============================================

-- Widget güvenliği ve rate limiting için
ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS allowed_domains TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS plan VARCHAR(20) DEFAULT 'free' 
    CHECK (plan IN ('free', 'basic', 'premium', 'enterprise')),
ADD COLUMN IF NOT EXISTS business_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS bot_purpose VARCHAR(50);

-- ============================================
-- 3. USERS TABLE (Kullanıcı Yönetimi)
-- ============================================

CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255),
    full_name VARCHAR(255),
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'user', 'viewer')),
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tenant_id, email)
);

-- ============================================
-- 4. CUSTOMERS TABLE (Müşteri Bilgileri)
-- ============================================

CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    email VARCHAR(255),
    phone VARCHAR(50),
    full_name VARCHAR(255),
    metadata JSONB DEFAULT '{}'::jsonb,
    first_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    total_conversations INTEGER DEFAULT 0,
    total_appointments INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tenant_id, email),
    UNIQUE(tenant_id, phone)
);

-- ============================================
-- 5. BOT_CONFIGS TABLE (Bot Ayarları)
-- ============================================

CREATE TABLE IF NOT EXISTS public.bot_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE UNIQUE,
    system_instructions TEXT NOT NULL,
    personality VARCHAR(50) DEFAULT 'professional' 
        CHECK (personality IN ('professional', 'friendly', 'casual', 'formal')),
    language VARCHAR(10) DEFAULT 'tr',
    features JSONB DEFAULT '{
        "appointments": true,
        "knowledge_base": true,
        "handover": true
    }'::jsonb,
    ai_model VARCHAR(50) DEFAULT 'gemini-2.0-flash-exp',
    temperature DECIMAL(3,2) DEFAULT 0.7,
    max_tokens INTEGER DEFAULT 2048,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 6. BOT_KNOWLEDGE_BASE TABLE (SSS, Bilgi)
-- ============================================

CREATE TABLE IF NOT EXISTS public.bot_knowledge_base (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category VARCHAR(100),
    keywords TEXT[],
    priority INTEGER DEFAULT 0,
    usage_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 7. CONVERSATIONS TABLE (Sohbet Oturumları)
-- ============================================

CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    session_id VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'active' 
        CHECK (status IN ('active', 'closed', 'handed_over')),
    context JSONB DEFAULT '{}'::jsonb,
    source VARCHAR(50) DEFAULT 'widget',
    message_count INTEGER DEFAULT 0,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    closed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 8. MESSAGES TABLE (Mesajlar)
-- ============================================

CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    model VARCHAR(50),
    tokens_used INTEGER,
    latency_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 9. APPOINTMENTS TABLE (Randevular)
-- ============================================

CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    offering_id UUID REFERENCES offerings(id) ON DELETE SET NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
    
    -- Customer info (denormalized for reliability)
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255),
    customer_phone VARCHAR(50),
    
    -- Schedule
    scheduled_date DATE NOT NULL,
    scheduled_time TIME NOT NULL,
    duration_minutes INTEGER NOT NULL,
    end_time TIME, -- Computed via trigger instead of GENERATED column
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending' 
        CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'no_show')),
    priority INTEGER DEFAULT 0,
    notes TEXT,
    cancellation_reason TEXT,
    
    -- Timestamps
    confirmed_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 10. NOTIFICATIONS TABLE (Bildirimler)
-- ============================================

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL 
        CHECK (type IN ('appointment_created', 'appointment_cancelled', 'new_conversation', 'handover_request')),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    action_url TEXT,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 11. PERFORMANCE INDEXES
-- ============================================

-- Offerings indexes
CREATE INDEX IF NOT EXISTS idx_offerings_tenant ON offerings(tenant_id);
CREATE INDEX IF NOT EXISTS idx_offerings_available ON offerings(tenant_id) WHERE is_available = true;
CREATE INDEX IF NOT EXISTS idx_offerings_provider ON offerings(tenant_id, provider_type, provider_name);

-- Tenants indexes
CREATE INDEX IF NOT EXISTS idx_tenants_plan ON tenants(plan);
CREATE INDEX IF NOT EXISTS idx_tenants_business_type ON tenants(business_type);

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_tenant ON users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Customers indexes
CREATE INDEX IF NOT EXISTS idx_customers_tenant ON customers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(tenant_id, email);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(tenant_id, phone);

-- Bot configs indexes
CREATE INDEX IF NOT EXISTS idx_bot_configs_tenant ON bot_configs(tenant_id);

-- Knowledge base indexes
CREATE INDEX IF NOT EXISTS idx_kb_tenant ON bot_knowledge_base(tenant_id);
CREATE INDEX IF NOT EXISTS idx_kb_active ON bot_knowledge_base(tenant_id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_kb_keywords ON bot_knowledge_base USING GIN(keywords);

-- Conversations indexes (CRITICAL FOR PERFORMANCE)
CREATE INDEX IF NOT EXISTS idx_conversations_tenant ON conversations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_conversations_customer ON conversations(customer_id);
CREATE INDEX IF NOT EXISTS idx_conversations_session ON conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message ON conversations(last_message_at DESC);

-- Messages indexes
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at DESC);

-- Appointments indexes (CRITICAL FOR CONFLICT DETECTION)
CREATE INDEX IF NOT EXISTS idx_appointments_tenant ON appointments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_appointments_offering ON appointments(offering_id);
CREATE INDEX IF NOT EXISTS idx_appointments_customer ON appointments(customer_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(tenant_id, scheduled_date);
CREATE INDEX IF NOT EXISTS idx_appointments_datetime ON appointments(tenant_id, scheduled_date, scheduled_time);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(tenant_id, status);

-- Composite index for conflict detection
CREATE INDEX IF NOT EXISTS idx_appointments_conflict ON appointments(
    tenant_id, offering_id, scheduled_date, status
) WHERE status IN ('pending', 'confirmed');

-- Covering index for availability queries
CREATE INDEX IF NOT EXISTS idx_appointments_covering ON appointments(
    tenant_id, scheduled_date, scheduled_time
) INCLUDE (status, customer_name, duration_minutes, offering_id)
WHERE status IN ('pending', 'confirmed');

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_tenant ON notifications(tenant_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(tenant_id, user_id) WHERE is_read = false;

-- ============================================
-- 12. TRIGGERS
-- ============================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_offerings_updated_at 
    BEFORE UPDATE ON offerings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bot_configs_updated_at 
    BEFORE UPDATE ON bot_configs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at 
    BEFORE UPDATE ON appointments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Calculate appointment end_time
CREATE OR REPLACE FUNCTION calculate_appointment_end_time()
RETURNS TRIGGER AS $$
BEGIN
    NEW.end_time := (NEW.scheduled_time + (NEW.duration_minutes || ' minutes')::INTERVAL)::TIME;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_end_time 
    BEFORE INSERT OR UPDATE ON appointments
    FOR EACH ROW EXECUTE FUNCTION calculate_appointment_end_time();

-- Increment conversation message count
CREATE OR REPLACE FUNCTION increment_conversation_message_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE conversations
    SET 
        message_count = message_count + 1,
        last_message_at = NEW.created_at
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER increment_message_count 
    AFTER INSERT ON messages
    FOR EACH ROW EXECUTE FUNCTION increment_conversation_message_count();

-- Update customer stats
CREATE OR REPLACE FUNCTION update_customer_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_TABLE_NAME = 'conversations' THEN
        UPDATE customers
        SET 
            total_conversations = total_conversations + 1,
            last_seen_at = NEW.started_at
        WHERE id = NEW.customer_id;
    ELSIF TG_TABLE_NAME = 'appointments' THEN
        UPDATE customers
        SET total_appointments = total_appointments + 1
        WHERE id = NEW.customer_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_customer_conversations 
    AFTER INSERT ON conversations
    FOR EACH ROW EXECUTE FUNCTION update_customer_stats();

CREATE TRIGGER update_customer_appointments 
    AFTER INSERT ON appointments
    FOR EACH ROW EXECUTE FUNCTION update_customer_stats();

-- ============================================
-- 13. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all new tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Development policies (Geliştirme için tüm erişim açık)
-- ⚠️ PRODUCTION'A GEÇERKEN BU POLİCY'LERİ SİL VE GERÇEK POLİCY'LERİ YAZ
CREATE POLICY "Enable all for dev" ON users FOR ALL USING (true);
CREATE POLICY "Enable all for dev" ON customers FOR ALL USING (true);
CREATE POLICY "Enable all for dev" ON bot_configs FOR ALL USING (true);
CREATE POLICY "Enable all for dev" ON bot_knowledge_base FOR ALL USING (true);
CREATE POLICY "Enable all for dev" ON conversations FOR ALL USING (true);
CREATE POLICY "Enable all for dev" ON messages FOR ALL USING (true);
CREATE POLICY "Enable all for dev" ON appointments FOR ALL USING (true);
CREATE POLICY "Enable all for dev" ON notifications FOR ALL USING (true);

-- ============================================
-- 14. COMMENTS & DOCUMENTATION
-- ============================================

COMMENT ON TABLE users IS 'System users who manage tenants (admin, staff)';
COMMENT ON TABLE customers IS 'End customers who interact with the chatbot';
COMMENT ON TABLE bot_configs IS 'Bot configuration and personality settings per tenant';
COMMENT ON TABLE bot_knowledge_base IS 'FAQ and knowledge base for bot responses';
COMMENT ON TABLE conversations IS 'Chat conversation sessions';
COMMENT ON TABLE messages IS 'Individual messages within conversations';
COMMENT ON TABLE appointments IS 'Scheduled appointments created through bot';
COMMENT ON TABLE notifications IS 'System notifications for users';

-- ============================================
-- 15. VERIFICATION QUERIES
-- ============================================

-- Verify tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'users', 'customers', 'bot_configs', 'bot_knowledge_base',
    'conversations', 'messages', 'appointments', 'notifications'
)
ORDER BY table_name;

-- Verify indexes were created
SELECT indexname, tablename 
FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename IN (
    'users', 'customers', 'bot_configs', 'bot_knowledge_base',
    'conversations', 'messages', 'appointments', 'notifications',
    'offerings', 'tenants'
)
ORDER BY tablename, indexname;

-- ✅ TAMAMLANDI!
-- Chatbot tabloları başarıyla oluşturuldu.
-- Şimdi backend/src/services/bot.service.ts dosyasını oluşturun.
