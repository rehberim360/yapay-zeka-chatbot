# 🤖 Chatbot Quickstart Guide

İlk müşteriye giden yolda chatbot sistemini hızlıca çalıştırmak için adım adım kılavuz.

## 📋 Önkoşullar

- ✅ Supabase hesabı ve database
- ✅ Gemini API key
- ✅ Node.js 20+
- ✅ Mevcut scraping sistemi çalışıyor

## 🚀 Kurulum (15 Dakika)

### 1. Database Migration (5 dakika)

Supabase SQL Editor'de sırayla çalıştır:

```bash
# 1. Chatbot tabloları
backend/migrations/006_add_chatbot_tables.sql

# 2. Seed data (test tenant)
backend/migrations/007_seed_chatbot_data.sql
```

**Doğrulama:**
```sql
-- Tabloları kontrol et
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'customers', 'bot_configs', 'conversations', 'messages', 'appointments');

-- Test tenant'ı kontrol et
SELECT * FROM tenants WHERE id = '00000000-0000-0000-0000-000000000001';
```

### 2. Environment Variables (2 dakika)

`backend/.env` dosyasına ekle:

```env
# Gemini AI
GEMINI_API_KEY=your_gemini_api_key_here

# Supabase (zaten var)
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**Gemini API Key Alma:**
1. https://aistudio.google.com/app/apikey
2. "Create API Key" tıkla
3. Key'i kopyala ve .env'e yapıştır

### 3. Dependencies (3 dakika)

```bash
cd backend

# Yeni paketleri yükle
npm install @google/generative-ai zod

# TypeScript compile
npm run build
```

### 4. Server Başlat (1 dakika)

```bash
npm run dev
```

**Beklenen çıktı:**
```
Server is running on port 3001
```

### 5. Test Et (4 dakika)

#### Test 1: Basit Mesaj (Postman/curl)

```bash
curl -X POST http://localhost:3001/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{
    "tenant_id": "00000000-0000-0000-0000-000000000001",
    "session_id": "test-session-123",
    "message": "Merhaba, hizmetleriniz hakkında bilgi alabilir miyim?"
  }'
```

**Beklenen yanıt:**
```
data: {"chunk":"Merhaba! Tabii ki..."}
data: {"chunk":" Demo Fitness Center..."}
...
data: {"done":true}
```

#### Test 2: Hizmet Listesi

```bash
curl -X POST http://localhost:3001/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{
    "tenant_id": "00000000-0000-0000-0000-000000000001",
    "session_id": "test-session-123",
    "message": "Hangi hizmetleriniz var?"
  }'
```

#### Test 3: Randevu Alma

```bash
curl -X POST http://localhost:3001/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{
    "tenant_id": "00000000-0000-0000-0000-000000000001",
    "session_id": "test-session-123",
    "message": "Yarın saat 14:00 için kişisel antrenman randevusu almak istiyorum",
    "customer_info": {
      "name": "Ahmet Yılmaz",
      "email": "ahmet@example.com",
      "phone": "+90 555 123 4567"
    }
  }'
```

#### Test 4: Conversation Listesi

```bash
curl http://localhost:3001/api/chat/conversations?tenant_id=00000000-0000-0000-0000-000000000001
```

## ✅ Başarı Kriterleri

Aşağıdaki testler başarılı olmalı:

- [ ] Bot mesajlara yanıt veriyor
- [ ] Streaming çalışıyor (chunk chunk geliyor)
- [ ] Hizmetleri listeleyebiliyor
- [ ] Randevu oluşturabiliyor
- [ ] Conversation kaydediliyor
- [ ] Messages database'e yazılıyor

## 🐛 Sorun Giderme

### Hata: "GEMINI_API_KEY not set"

**Çözüm:**
```bash
# .env dosyasını kontrol et
cat backend/.env | grep GEMINI_API_KEY

# Yoksa ekle
echo "GEMINI_API_KEY=your_key_here" >> backend/.env

# Server'ı yeniden başlat
npm run dev
```

### Hata: "Tenant not found"

**Çözüm:**
```sql
-- Seed data'yı tekrar çalıştır
-- backend/migrations/007_seed_chatbot_data.sql
```

### Hata: "Failed to create conversation"

**Çözüm:**
```sql
-- Tabloları kontrol et
SELECT * FROM conversations LIMIT 1;

-- RLS policy'leri kontrol et
SELECT * FROM pg_policies WHERE tablename = 'conversations';
```

### Bot yanıt vermiyor

**Çözüm:**
1. Gemini API key'i doğru mu?
2. Internet bağlantısı var mı?
3. Logs'u kontrol et: `backend/logs/app.log`

## 📊 Database Kontrol Sorguları

```sql
-- Conversations
SELECT 
  c.id,
  c.session_id,
  c.status,
  c.message_count,
  cu.full_name as customer_name
FROM conversations c
LEFT JOIN customers cu ON c.customer_id = cu.id
WHERE c.tenant_id = '00000000-0000-0000-0000-000000000001'
ORDER BY c.last_message_at DESC;

-- Messages
SELECT 
  m.role,
  LEFT(m.content, 50) as content_preview,
  m.created_at
FROM messages m
JOIN conversations c ON m.conversation_id = c.id
WHERE c.tenant_id = '00000000-0000-0000-0000-000000000001'
ORDER BY m.created_at DESC
LIMIT 10;

-- Appointments
SELECT 
  a.customer_name,
  o.name as service_name,
  a.scheduled_date,
  a.scheduled_time,
  a.status
FROM appointments a
JOIN offerings o ON a.offering_id = o.id
WHERE a.tenant_id = '00000000-0000-0000-0000-000000000001'
ORDER BY a.created_at DESC;
```

## 🎯 Sonraki Adımlar

Chatbot çalışıyor! Şimdi:

1. **Widget Oluştur** (Hafta 4)
   - React widget
   - Socket.io entegrasyonu
   - Embed script

2. **Dashboard Ekle** (Hafta 3)
   - Conversations listesi
   - Bot ayarları
   - Canlı sohbet

3. **Pilot Müşteri** (Hafta 7)
   - Gerçek site scrape et
   - Bot'u özelleştir
   - Widget'ı ekle

## 📚 Daha Fazla Bilgi

- [COMPLETE_DEVELOPMENT_PLAN.md](./master-plan/COMPLETE_DEVELOPMENT_PLAN.md) - Tam geliştirme planı
- [Bot Service](../src/services/bot.service.ts) - Chatbot motoru
- [System Prompt Builder](../src/services/system-prompt-builder.ts) - Prompt sistemi
- [Chat Routes](../src/routes/chat.routes.ts) - API endpoints

## 🎉 Tebrikler!

Chatbot sistemi çalışıyor! İlk müşteriye giden yolda önemli bir adım attın. 🚀
