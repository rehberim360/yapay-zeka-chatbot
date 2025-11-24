# 🏗️ Sistem Mimarisi

**Proje:** AI-Powered Chatbot Platform + ARMA Device  
**Versiyon:** 2.0 (ARMA Dahil)  
**Güncelleme:** 24 Kasım 2025

---

## 📊 Genel Mimari

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND LAYER                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ Web Widget   │  │  Dashboard   │  │ ARMA Device  │         │
│  │ (React)      │  │  (Next.js)   │  │ (ESP32)      │         │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘         │
└─────────┼──────────────────┼──────────────────┼─────────────────┘
          │                  │                  │
          │ WebSocket        │ REST API         │ WebSocket
          │                  │                  │
┌─────────▼──────────────────▼──────────────────▼─────────────────┐
│                        BACKEND LAYER                            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              API Gateway (Express.js)                     │  │
│  │  - Rate Limiting                                          │  │
│  │  - Authentication (JWT)                                   │  │
│  │  - Request Validation                                     │  │
│  └──────────────────────┬───────────────────────────────────┘  │
│                         │                                       │
│  ┌──────────────────────▼───────────────────────────────────┐  │
│  │              Business Logic Layer                         │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │  │
│  │  │   Bot       │  │ Appointment │  │   Product   │      │  │
│  │  │  Service    │  │   Service   │  │   Service   │      │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘      │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │  │
│  │  │  Scraper    │  │  Offerings  │  │   Device    │      │  │
│  │  │  Service    │  │   Service   │  │   Service   │      │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘      │  │
│  └──────────────────────┬───────────────────────────────────┘  │
└─────────────────────────┼───────────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────────┐
│                     EXTERNAL SERVICES                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  Gemini AI   │  │  Supabase    │  │    Redis     │         │
│  │  (Google)    │  │  (Database)  │  │   (Cache)    │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  Firecrawl   │  │   Stripe     │  │   Twilio     │         │
│  │  (Scraping)  │  │  (Payment)   │  │   (SMS)      │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Offerings Sistemi (Çekirdek)

**Offerings tablosu** hem hizmetleri hem de ürünleri tek bir yapıda tutar:

### Database Schema

```sql
CREATE TABLE offerings (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  
  -- Temel Bilgiler
  name VARCHAR(255) NOT NULL,
  description TEXT,
  offering_type VARCHAR(50) NOT NULL, -- 'service' veya 'product'
  category VARCHAR(100),
  
  -- Fiyatlandırma
  price DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'TRY',
  
  -- Esnek Veri (JSONB)
  meta_info JSONB DEFAULT '{}'::jsonb,
  
  -- Durum
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_offerings_tenant ON offerings(tenant_id);
CREATE INDEX idx_offerings_type ON offerings(offering_type);
CREATE INDEX idx_offerings_active ON offerings(is_active) WHERE is_active = true;
CREATE INDEX idx_offerings_meta ON offerings USING GIN (meta_info);
```

### Offering Types

#### 1. Service (Hizmet - Randevu Gerektirir)

```json
{
  "offering_type": "service",
  "name": "Saç Kesimi",
  "price": 150.00,
  "meta_info": {
    "duration_minutes": 30,
    "requires_appointment": true,
    "staff_required": true,
    "staff_ids": ["uuid-1", "uuid-2"],
    "preparation_time": 5,
    "cleanup_time": 5,
    "max_concurrent": 3,
    "booking_advance_days": 30,
    "cancellation_hours": 24
  }
}
```

**Function Calls:**
- `list_services()` - Tüm hizmetleri listele
- `get_service_details(service_id)` - Hizmet detayları
- `check_availability(service_id, date)` - Müsaitlik kontrolü
- `create_appointment(service_id, date, time, customer)` - Randevu oluştur

#### 2. Product (Ürün - Satış)

```json
{
  "offering_type": "product",
  "name": "Nemlendirici Krem",
  "price": 450.00,
  "meta_info": {
    "sku": "KREM-001",
    "stock_quantity": 25,
    "stock_tracking": true,
    "low_stock_threshold": 5,
    "weight_grams": 50,
    "dimensions": "5x5x10 cm",
    "shipping_required": true,
    "shipping_cost": 0,
    "tax_rate": 0.18,
    "brand": "XYZ Kozmetik",
    "ingredients": ["Su", "Gliserin", "..."],
    "usage": "Günde 2 kez uygulayın"
  }
}
```

**Function Calls:**
- `list_products(category?)` - Ürünleri listele
- `get_product_details(product_id)` - Ürün detayları
- `check_stock(product_id)` - Stok kontrolü
- `create_order(product_id, quantity, customer, shipping)` - Sipariş oluştur
- `calculate_total(items[])` - Toplam hesapla (vergi, kargo dahil)

---

## 🤖 Bot Service (Chatbot Logic)

### Conversation Flow

```typescript
// 1. Müşteri mesajı gelir
const userMessage = "Yarın saç kesimi randevusu alabilir miyim?";

// 2. Gemini AI'a gönderilir (streaming)
const response = await gemini.generateContentStream({
  model: 'gemini-2.5-flash',
  systemInstruction: buildSystemPrompt(tenant),
  messages: conversationHistory,
  functions: [
    listServicesFunction,
    checkAvailabilityFunction,
    createAppointmentFunction,
    listProductsFunction,
    createOrderFunction
  ]
});

// 3. AI yanıt verir veya function call yapar
for await (const chunk of response.stream) {
  if (chunk.functionCall) {
    // Function call varsa çalıştır
    const result = await executeFunctionCall(chunk.functionCall);
    // Sonucu AI'a geri gönder
  } else {
    // Normal yanıt, müşteriye stream et
    yield chunk.text;
  }
}
```

### Function Calling Examples

#### Randevu Alma

```typescript
// AI'ın function call'u
{
  "name": "create_appointment",
  "arguments": {
    "service_id": "uuid-123",
    "date": "2025-11-25",
    "time": "14:00",
    "customer": {
      "name": "Ahmet Yılmaz",
      "phone": "+905551234567",
      "email": "ahmet@example.com"
    },
    "notes": "Sakal kesimi de istiyorum"
  }
}

// Backend'in yanıtı
{
  "success": true,
  "appointment_id": "uuid-456",
  "confirmation_code": "ABC123",
  "message": "Randevunuz oluşturuldu. SMS ile onay gönderildi."
}
```

#### Ürün Satışı

```typescript
// AI'ın function call'u
{
  "name": "create_order",
  "arguments": {
    "items": [
      {
        "product_id": "uuid-789",
        "quantity": 2
      }
    ],
    "customer": {
      "name": "Ayşe Demir",
      "phone": "+905559876543",
      "email": "ayse@example.com",
      "address": {
        "street": "Atatürk Cad. No:123",
        "city": "İstanbul",
        "postal_code": "34000"
      }
    },
    "payment_method": "credit_card",
    "notes": "Hızlı kargo lütfen"
  }
}

// Backend'in yanıtı
{
  "success": true,
  "order_id": "uuid-101",
  "total_amount": 900.00,
  "payment_link": "https://pay.example.com/xyz",
  "estimated_delivery": "2025-11-27",
  "message": "Sipariş alındı. Ödeme linki SMS ile gönderildi."
}
```

---

## 🎙️ ARMA Device Integration

### Voice Flow

```
1. Müşteri ARMA'ya konuşur
   ↓
2. ESP32 mikrofon → Bluetooth → Gateway
   ↓
3. Gateway → WebSocket → Backend
   ↓
4. Backend → Gemini Speech-to-Text
   ↓
5. Metin → Bot Service (normal flow)
   ↓
6. Bot yanıtı → Google TTS
   ↓
7. Ses → WebSocket → Gateway → Bluetooth → Hoparlör
```

### Device Management

```typescript
// Cihaz kaydı
POST /api/devices/register
{
  "serial_number": "ARMA-2025-001",
  "tenant_id": "uuid-tenant",
  "location": "Salon girişi"
}

// Cihaz durumu
GET /api/devices/:id/status
{
  "status": "online",
  "battery_level": 85,
  "last_interaction": "2025-11-24T14:30:00Z",
  "firmware_version": "1.0.2"
}

// Firmware güncelleme (OTA)
POST /api/devices/:id/firmware
{
  "version": "1.0.3",
  "url": "https://cdn.example.com/firmware/1.0.3.bin"
}
```

---

## 💾 Database Schema (Tam)

### Core Tables

```sql
-- Tenants (İşletmeler)
CREATE TABLE tenants (
  id UUID PRIMARY KEY,
  business_name VARCHAR(255),
  website_url VARCHAR(500),
  industry VARCHAR(100),
  settings JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Offerings (Hizmetler + Ürünler)
CREATE TABLE offerings (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  name VARCHAR(255),
  offering_type VARCHAR(50), -- 'service' | 'product'
  price DECIMAL(10,2),
  meta_info JSONB,
  is_active BOOLEAN DEFAULT true
);

-- Appointments (Randevular)
CREATE TABLE appointments (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  offering_id UUID REFERENCES offerings(id),
  customer_name VARCHAR(255),
  customer_phone VARCHAR(50),
  customer_email VARCHAR(255),
  scheduled_date DATE,
  scheduled_time TIME,
  status VARCHAR(50), -- 'pending' | 'confirmed' | 'completed' | 'cancelled'
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Orders (Siparişler)
CREATE TABLE orders (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  customer_name VARCHAR(255),
  customer_phone VARCHAR(50),
  customer_email VARCHAR(255),
  total_amount DECIMAL(10,2),
  status VARCHAR(50), -- 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled'
  payment_method VARCHAR(50),
  payment_status VARCHAR(50),
  shipping_address JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Order Items (Sipariş Kalemleri)
CREATE TABLE order_items (
  id UUID PRIMARY KEY,
  order_id UUID REFERENCES orders(id),
  offering_id UUID REFERENCES offerings(id),
  quantity INTEGER,
  unit_price DECIMAL(10,2),
  total_price DECIMAL(10,2)
);

-- Conversations (Sohbetler)
CREATE TABLE conversations (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  customer_identifier VARCHAR(255),
  channel VARCHAR(50), -- 'web' | 'arma' | 'whatsapp'
  status VARCHAR(50),
  started_at TIMESTAMP DEFAULT NOW(),
  ended_at TIMESTAMP
);

-- Messages (Mesajlar)
CREATE TABLE messages (
  id UUID PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id),
  role VARCHAR(50), -- 'user' | 'assistant' | 'system'
  content TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Devices (ARMA Cihazları)
CREATE TABLE devices (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  serial_number VARCHAR(50) UNIQUE,
  firmware_version VARCHAR(20),
  status VARCHAR(20), -- 'online' | 'offline' | 'charging'
  battery_level INTEGER,
  location VARCHAR(255),
  last_seen TIMESTAMP,
  config JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Device Usage (Cihaz Kullanım İstatistikleri)
CREATE TABLE device_usage (
  id UUID PRIMARY KEY,
  device_id UUID REFERENCES devices(id),
  interaction_type VARCHAR(50), -- 'voice' | 'button'
  duration_seconds INTEGER,
  success BOOLEAN,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔄 API Endpoints

### Bot API

```
POST   /api/chat/message          # Mesaj gönder (streaming)
GET    /api/chat/history/:id      # Sohbet geçmişi
POST   /api/chat/handover         # İnsana devret
```

### Offerings API

```
GET    /api/offerings             # Tüm offerings
GET    /api/offerings/:id         # Offering detayı
POST   /api/offerings             # Yeni offering
PUT    /api/offerings/:id         # Offering güncelle
DELETE /api/offerings/:id         # Offering sil
```

### Appointments API

```
GET    /api/appointments          # Randevular
POST   /api/appointments          # Randevu oluştur
GET    /api/appointments/availability  # Müsaitlik kontrolü
PUT    /api/appointments/:id      # Randevu güncelle
DELETE /api/appointments/:id      # Randevu iptal
```

### Orders API

```
GET    /api/orders                # Siparişler
POST   /api/orders                # Sipariş oluştur
GET    /api/orders/:id            # Sipariş detayı
PUT    /api/orders/:id/status     # Sipariş durumu güncelle
POST   /api/orders/:id/payment    # Ödeme işle
```

### Devices API (ARMA)

```
POST   /api/devices/register      # Cihaz kaydet
GET    /api/devices/:id/status    # Cihaz durumu
PUT    /api/devices/:id/config    # Cihaz ayarları
POST   /api/devices/:id/firmware  # Firmware güncelle
GET    /api/devices/:id/usage     # Kullanım istatistikleri
```

### Voice API (ARMA)

```
WS     /api/voice/stream          # Sesli sohbet (WebSocket)
POST   /api/voice/tts             # Text-to-Speech
POST   /api/voice/stt             # Speech-to-Text
```

---

## 🔐 Güvenlik

### Authentication
- JWT tokens (access + refresh)
- Row-Level Security (RLS) policies
- API key authentication (widget için)

### Rate Limiting
- IP-based: 100 req/min
- User-based: 1000 req/hour
- Tenant-based: 10000 req/day

### Data Protection
- HTTPS only
- Encrypted at rest (Supabase)
- GDPR/KVKK compliant
- Data retention policies

---

## 📈 Scalability

### Caching Strategy
- Redis for session data
- Query result caching (5 min TTL)
- Offerings cache (1 hour TTL)
- Conversation history cache

### Database Optimization
- Connection pooling (20 connections)
- Prepared statements
- Covering indexes
- Partitioning (future)

### Load Balancing
- Horizontal scaling (multiple instances)
- WebSocket sticky sessions
- CDN for static assets

---

## 🎯 Sonuç

Bu mimari:
- ✅ Hem hizmet (randevu) hem ürün (satış) destekler
- ✅ Web widget + ARMA cihazı entegrasyonu
- ✅ Ölçeklenebilir ve güvenli
- ✅ Multi-tenant (çoklu kiracı)
- ✅ Real-time (gerçek zamanlı)
- ✅ AI-powered (Gemini function calling)

**Hedef:** 2027'de 25.000+ işletme, 20.000+ ARMA cihazı, 1-1.5 Milyar ₺ ARR 🚀
