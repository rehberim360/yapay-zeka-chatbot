# 🚀 YZBot: Hemen Yapılacaklar Listesi

**Hedef:** 2026 Q2'de YZBot cihazını lansmanlamak için bu hafta başlayacağımız görevler.

---

## 📅 Bu Hafta (Kasım 25-30, 2025)

### 🎨 Tasarım (Öncelik: Yüksek)

#### 1. Logo Tasarımı
- [ ] **Platform:** Fiverr / 99designs
- [ ] **Bütçe:** 2.000₺
- [ ] **Gereksinimler:**
  - YZBot yazısı + ses dalgası ikonu
  - Turkuaz + Beyaz renk paleti
  - Modern, yuvarlak tipografi
  - SVG + PNG formatları
  - Farklı boyutlar (favicon, sosyal medya, baskı)
- [ ] **Teslim:** 3-5 gün

#### 2. 3D Mockup Render
- [ ] **Platform:** Fiverr (3D designer)
- [ ] **Bütçe:** 1.500₺
- [ ] **Gereksinimler:**
  - Cihaz boyutu: 70×40×30 mm
  - LED ring görünümü
  - Tek buton
  - Manyetik şarj dock
  - 3 renk varyasyonu (Beyaz, Siyah, Gümüş)
  - Yüksek çözünürlük render (4K)
- [ ] **Teslim:** 5-7 gün

#### 3. Paketleme Tasarımı
- [ ] **Platform:** Canva Pro / Fiverr
- [ ] **Bütçe:** 1.000₺
- [ ] **Gereksinimler:**
  - Premium kutu tasarımı (Apple tarzı)
  - Ürün fotoğrafları
  - Teknik özellikler
  - QR kod (kurulum videosu)
  - Hızlı başlangıç kılavuzu
- [ ] **Teslim:** 7 gün

---

### 💻 Geliştirme (Öncelik: Yüksek)

#### 4. Sesli Yanıt API Endpoint
```typescript
// backend/src/routes/voice.routes.ts
POST /api/voice/stream
- Input: Audio stream (WebSocket)
- Process: Gemini Speech-to-Text → Chatbot Logic → Google TTS
- Output: Audio stream (WebSocket)
```

**Görevler:**
- [ ] WebSocket endpoint oluştur
- [ ] Gemini Speech-to-Text entegrasyonu
- [ ] Mevcut chatbot logic'i kullan (zaten var!)
- [ ] Google Cloud TTS entegrasyonu
- [ ] Audio streaming (opus codec)
- [ ] Test suite yazma

**Tahmini Süre:** 2-3 gün

#### 5. Cihaz Yönetimi API
```typescript
// backend/src/routes/devices.routes.ts
POST /api/devices/register
GET /api/devices/:id/status
PUT /api/devices/:id/config
POST /api/devices/:id/firmware
```

**Görevler:**
- [ ] Device registry tablosu (PostgreSQL)
- [ ] Cihaz kaydı endpoint
- [ ] Durum izleme (online/offline)
- [ ] Konfigürasyon yönetimi
- [ ] Firmware OTA güncelleme
- [ ] Kullanım istatistikleri

**Tahmini Süre:** 2 gün

#### 6. Database Migration (Cihaz Tabloları)
```sql
-- backend/migrations/008_add_YZBot_devices.sql
CREATE TABLE devices (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  serial_number VARCHAR(50) UNIQUE,
  firmware_version VARCHAR(20),
  status VARCHAR(20), -- online, offline, charging
  last_seen TIMESTAMP,
  config JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE device_usage (
  id UUID PRIMARY KEY,
  device_id UUID REFERENCES devices(id),
  interaction_type VARCHAR(50), -- voice, button
  duration_seconds INTEGER,
  success BOOLEAN,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Tahmini Süre:** 1 saat

---

### 🔧 GitHub (Öncelik: Orta)

#### 7. YZBot-hardware Repository
- [ ] **Repo:** `github.com/botunuz/YZBot-hardware`
- [ ] **İçerik:**
  - README.md (proje tanıtımı)
  - LICENSE (MIT)
  - /pcb (KiCad dosyaları - şimdilik placeholder)
  - /3d-models (STL dosyaları - şimdilik placeholder)
  - /docs (teknik doküman)
  - BOM.md (Bill of Materials - şimdilik taslak)
- [ ] **Sponsor Tier Dokümanı:** SPONSORS.md

**Tahmini Süre:** 2 saat

#### 8. YZBot-firmware Repository
- [ ] **Repo:** `github.com/botunuz/YZBot-firmware`
- [ ] **İçerik:**
  - README.md
  - LICENSE (MIT)
  - /src (ESP32 firmware - şimdilik boilerplate)
  - /examples (örnek kodlar)
  - platformio.ini (ESP32 config)
- [ ] **Placeholder Firmware:** Bluetooth LE + LED blink

**Tahmini Süre:** 3 saat

#### 9. YZBot-sdk Repository (npm package)
- [ ] **Repo:** `github.com/botunuz/YZBot-sdk`
- [ ] **İçerik:**
  - TypeScript SDK
  - WebSocket client
  - Device management API
  - Audio streaming helpers
- [ ] **npm publish:** `@botunuz/YZBot-sdk`

**Tahmini Süre:** 4 saat

---

### 📢 Pazarlama (Öncelik: Orta)

#### 10. Landing Page (YZBot.botunuz.com)
- [ ] **Platform:** Next.js (mevcut frontend'e ekle)
- [ ] **İçerik:**
  - Hero section (3D render + slogan)
  - Özellikler (6 kullanım senaryosu)
  - Teknik özellikler
  - Fiyatlandırma
  - Pilot program başvuru formu
  - FAQ
- [ ] **CTA:** "Pilot Programa Katıl" (50 KOBİ)

**Tahmini Süre:** 1 gün

#### 11. Pilot Program Duyurusu
- [ ] **Hedef:** İlk 50 KOBİ (mevcut müşteriler + bekleme listesi)
- [ ] **Kanal:**
  - Email kampanyası
  - LinkedIn post
  - Twitter thread
  - WhatsApp Business
- [ ] **Mesaj:**
  ```
  🎙️ YZBot Pilot Programı Açıldı!
  
  Türkiye'nin ilk AI-powered fiziksel asistan cihazını
  ÜCRETSİZ test edin!
  
  ✅ 50 KOBİ'ye özel
  ✅ Ücretsiz cihaz
  ✅ 3 ay ücretsiz premium plan
  ✅ Öncelikli destek
  
  Başvuru: YZBot.botunuz.com/pilot
  Son tarih: 15 Aralık 2025
  ```

**Tahmini Süre:** 2 saat

#### 12. Tanıtım Videosu Senaryosu
- [ ] **Format:** 60 saniye (Instagram Reels, TikTok, YouTube Shorts)
- [ ] **Senaryo:**
  1. Problem (0-10s): "Müşteri geldi, kimse yok, kayıp satış"
  2. Çözüm (10-30s): "YZBot devreye giriyor, randevu alıyor"
  3. Özellikler (30-50s): Hızlı montaj, 6 kullanım senaryosu
  4. CTA (50-60s): "Pilot programa katıl, ücretsiz dene"
- [ ] **Çekim:** Smartphone (iPhone 14+)
- [ ] **Montaj:** CapCut / Premiere Pro

**Tahmini Süre:** Senaryo 1 saat, çekim/montaj 1 gün

---

## 📅 Gelecek Hafta (Aralık 2-6, 2025)

### 🔧 Donanım Tasarımı (Öncelik: Yüksek)

#### 13. PCB Tasarımı (KiCad)
- [ ] **Bileşenler:**
  - ESP32-WROOM-32 (Wi-Fi + Bluetooth)
  - INMP441 mikrofon (×2)
  - MAX98357A amplifikatör
  - 3W hoparlör
  - TP4056 şarj IC
  - 2000mAh LiPo batarya
  - WS2812B LED ring (12 LED)
  - Tactile buton
- [ ] **Schematic:** KiCad
- [ ] **PCB Layout:** 2-layer (maliyet optimizasyonu)
- [ ] **Gerber dosyaları:** JLCPCB için

**Tahmini Süre:** 5-7 gün (freelancer ile)

#### 14. 3D Kasa Tasarımı (Fusion 360)
- [ ] **Boyut:** 70×40×30 mm
- [ ] **Malzeme:** ABS plastik (injection molding)
- [ ] **Özellikler:**
  - LED ring için şeffaf halka
  - Mikrofon delikleri
  - Hoparlör ızgarası
  - Manyetik şarj konektörü
  - Buton yuvası
- [ ] **STL dosyaları:** 3D baskı için

**Tahmini Süre:** 5-7 gün (freelancer ile)

---

### 🧪 Test & Prototip (Öncelik: Orta)

#### 15. Breadboard Prototip
- [ ] **Bileşenler:** Yukarıdaki listeden satın al (AliExpress/Robotistan)
- [ ] **Bütçe:** 1.500₺
- [ ] **Test:**
  - Bluetooth bağlantı
  - Mikrofon kayıt
  - Hoparlör çalma
  - LED kontrol
  - Batarya şarj
- [ ] **Firmware:** Temel ESP32 kodu

**Tahmini Süre:** 3-4 gün

#### 16. Backend Entegrasyon Testi
- [ ] WebSocket bağlantı
- [ ] Ses streaming (mikrofon → backend)
- [ ] Gemini Speech-to-Text
- [ ] Chatbot yanıt
- [ ] Google TTS
- [ ] Ses streaming (backend → hoparlör)
- [ ] Latency ölçümü (<2s hedef)

**Tahmini Süre:** 2 gün

---

## 📊 Kilometre Taşları

| Tarih | Milestone | Durum |
|-------|-----------|-------|
| **30 Kasım 2025** | Logo + 3D mockup tamamlandı | ⏳ |
| **6 Aralık 2025** | Sesli API + GitHub repo'lar hazır | ⏳ |
| **15 Aralık 2025** | Landing page + pilot program lansmanı | ⏳ |
| **31 Aralık 2025** | PCB + 3D tasarım tamamlandı | ⏳ |
| **15 Ocak 2026** | Breadboard prototip çalışıyor | ⏳ |
| **31 Ocak 2026** | İlk 10 PCB üretimi (JLCPCB) | ⏳ |
| **28 Şubat 2026** | 50 pilot cihaz üretimi | ⏳ |
| **31 Mart 2026** | Pilot program tamamlandı, geri bildirim | ⏳ |
| **30 Nisan 2026** | Toplu üretim anlaşması (5.000 adet) | ⏳ |
| **30 Haziran 2026** | **YZBot Resmi Lansmanı** 🚀 | ⏳ |

---

## 💰 Bütçe (İlk 3 Ay)

| Kategori | Detay | Maliyet |
|----------|-------|---------|
| **Tasarım** | Logo + 3D render + paketleme | 4.500₺ |
| **Prototip** | Elektronik bileşenler | 1.500₺ |
| **PCB Tasarımı** | Freelancer (KiCad) | 5.000₺ |
| **3D Tasarım** | Freelancer (Fusion 360) | 5.000₺ |
| **İlk PCB Üretimi** | JLCPCB (10 adet) | 3.000₺ |
| **Pilot Üretim** | 50 adet (toplu) | 45.000₺ |
| **Pazarlama** | Landing page + video | 5.000₺ |
| **Toplam** | | **69.000₺** |

**Finansman:**
- Sponsor kredileri: 20.000₺
- Pilot müşteri ön ödemesi: 30.000₺ (50 × 600₺)
- Kendi bütçe: 19.000₺

---

## 🎯 Başarı Kriterleri

### Teknik
- ✅ Sesli yanıt latency <2s
- ✅ Bluetooth menzil >8m
- ✅ Batarya ömrü >10 saat
- ✅ Ses kalitesi >85% anlaşılabilirlik

### İş
- ✅ 50 pilot KOBİ başvurusu
- ✅ %80+ pilot memnuniyeti
- ✅ %60+ pilot'tan ücretli dönüşüm
- ✅ 5.000 adet ön sipariş (Q2 2026)

### Topluluk
- ✅ 100+ GitHub star (YZBot-hardware)
- ✅ 10+ sponsor ($5-100/ay)
- ✅ 5+ açık kaynak katkıcı
- ✅ 1.000+ landing page ziyareti

---

## 📞 İletişim & Koordinasyon

**Proje Yöneticisi:** [Senin adın]  
**Slack/Discord:** #YZBot-device  
**Haftalık Toplantı:** Her Pazartesi 10:00  
**Durum Raporu:** Her Cuma (bu doküman güncellenir)

---

**Hedef:** 2026 Q2'de YZBot'yı lansmanlamak ve Türkiye'nin en inovatif SaaS+Hardware girişimi olmak! 🚀

**Şimdi gaza basma zamanı!** 💪

