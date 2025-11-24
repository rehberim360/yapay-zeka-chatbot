# 🎙️ YZBot: Fiziksel AI Asistan Cihazı

**YZBot** = **A**sistan + **R**andevu + **M**ağaza **A**sistanı

---

## 🎯 Vizyon

Türkiye'nin ilk **AI-powered fiziksel asistan cihazı** ile KOBİ'lere 7/24 sesli müşteri hizmeti sunmak.

---

## 📊 2026-2027 Hedefler (Rakamlarla)

### Sadece Yazılım (Mevcut Plan)

| Hedef | 2026 Sonu (12 ay) | 2027 Sonu (24 ay) |
|-------|-------------------|-------------------|
| Ücretli KOBİ | 4.500-6.000 | 15.000-20.000 |
| ARR | 35-50M ₺ | 120-160M ₺ |
| Türkiye Pazar Payı | %35-40 | %55-65 |
| Global KOBİ | 500+ | 5.000+ |
| **Toplam ARR** | **45-60M ₺** | **200-300M ₺** |

### Yazılım + YZBot Cihazı

| Hedef | 2026 Sonu (12 ay) | 2027 Sonu (24 ay) |
|-------|-------------------|-------------------|
| Ücretli KOBİ | 6.000-8.000 | 25.000-35.000 |
| ARR | 80-120M ₺ | 300-500M ₺ |
| Cihaz Satışı | 5.000+ | 20.000+ |
| Cihaz Geliri | 7.5-10M ₺ | 30-40M ₺ |
| Türkiye Pazar Payı | %50-60 | %75-85 |
| Global KOBİ | 1.500+ | 10.000+ |
| **Toplam ARR** | **150-250M ₺** | **1-1.5 Milyar ₺** |

**Sonuç:** Cihaz eklendiğinde **2.5-3.5× büyüme** + **%85+ retention** (donanım bağımlılığı)

---

## 🔧 Cihaz Özellikleri (Donanım)

### Teknik Spesifikasyonlar

| Özellik | Detay |
|---------|-------|
| **Bağlantı** | Bluetooth 5.2 (10m menzil) + Wi-Fi (opsiyonel) |
| **Mikrofon** | Gürültü önleyici çift mikrofon (far-field) |
| **Hoparlör** | 3W yüksek kaliteli stereo |
| **Batarya** | 2000mAh, 12 saat kullanım |
| **Şarj** | Manyetik şarj dock (USB-C) |
| **LED Ring** | RGB LED (durum göstergesi) |
| **Buton** | Tek buton (bas/uzun bas/kapat) |
| **Boyut** | 70×40×30 mm (AirPods kutusu kadar) |
| **Ağırlık** | 85g |
| **Renk** | Beyaz, Siyah, Gümüş (özel renk sponsor tier) |

### Maliyet Analizi

| Bileşen | Birim Maliyet (Toplu) |
|---------|----------------------|
| PCB + Elektronik | $12 |
| Mikrofon + Hoparlör | $6 |
| Batarya + Şarj | $5 |
| Kasa (plastik) | $4 |
| Paketleme | $2 |
| **Toplam Maliyet** | **$29-35** |
| **Türkiye Satış Fiyatı** | **1.499-1.999 ₺** |
| **Kâr Marjı** | **%60-65** |

---

## 🎤 Cihaz Ne Yapacak?

### 1. Müşterilere Cevap Verir
```
Müşteri: "Yarın randevum var mıydı?"
YZBot: "Evet Derya Hanım, yarın saat 14:00'da randevunuz var."
```

### 2. Randevu Alır
```
Müşteri: "Mehmet Bey müsait mi?"
YZBot: "Mehmet Bey bugün 14:00, 15:30 ve 17:00'da müsait. Hangisini tercih edersiniz?"
Müşteri: "14:00"
YZBot: "Tamam, 14:00'da randevunuzu aldım. SMS ile onay gönderdim."
```

### 3. Ürün Satışı Yapar
```
Müşteri: "Bu krem stokta mı?"
YZBot: "Evet, Nemlendirici Krem 450₺. Kargo ücretsiz. Hemen sipariş vereyim mi?"
Müşteri: "Evet"
YZBot: "Sipariş alındı. Yarın kargoda."
```

### 4. Kampanya Bildirir
```
YZBot: "Dikkat! Bugün topuz yapımı %40 indirimli, sadece 3 saat!"
```

### 5. Teknik Destek Verir
```
Müşteri: "Cihazım çalışmıyor"
YZBot: "LED kırmızı yanıp sönüyorsa şarj edin. Yeşil yanıyorsa Bluetooth bağlantısını kontrol edin."
```

### 6. Mağaza İçi Yönlendirme
```
Müşteri: "Kuaför nerede?"
YZBot: "Sağdan ikinci kapı, 2. kat."
```

---

## 🏗️ Teknik Mimari

### Sistem Entegrasyonu

```
┌─────────────────────────────────────────────┐
│           YZBot Cihazı (Fiziksel)            │
│  Mikrofon → Bluetooth → Gateway → Backend   │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│         Bluetooth Gateway (ESP32)           │
│  WebSocket → Backend API                    │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│         Backend API (Mevcut)                │
│  - Gemini 2.5 Flash (ses → metin)          │
│  - PostgreSQL (bilgi tabanı)               │
│  - WebSocket (gerçek zamanlı)              │
│  - TTS (metin → ses)                       │
└─────┬───────────┬───────────┬───────────────┘
      │           │           │
      ▼           ▼           ▼
┌──────────┐ ┌──────────┐ ┌──────────┐
│ Randevu  │ │  Ürün    │ │  Bilgi   │
│ Sistemi  │ │  Satışı  │ │  Bankası │
└──────────┘ └──────────┘ └──────────┘
```

### Yeni Modüller (2-3 Hafta)

1. **Sesli Yanıt API** (`/api/voice/stream`)
   - Gemini Speech-to-Text
   - Mevcut chatbot logic
   - Google TTS (Text-to-Speech)
   - WebSocket streaming

2. **Bluetooth Gateway** (ESP32)
   - Bluetooth LE server
   - Audio streaming
   - WebSocket client
   - LED control

3. **Cihaz Yönetimi** (`/api/devices`)
   - Cihaz kaydı
   - Durum izleme
   - Firmware güncelleme (OTA)
   - Kullanım istatistikleri

---

## 💰 İş Modeli

### Fiyatlandırma Stratejisi

| Plan | Aylık Ücret | Cihaz Fiyatı | Özellikler |
|------|-------------|--------------|------------|
| **Starter** | 650₺ | - | Sadece yazılım (widget) |
| **Pro** | 1.200₺ | 999₺ (indirimli) | Widget + 1 YZBot cihazı |
| **Business** | 2.500₺ | 799₺/cihaz | Widget + 3 YZBot cihazı |
| **Enterprise** | 5.000₺+ | 599₺/cihaz | Sınırsız cihaz |

### Gelir Akışları

1. **SaaS Abonelik** (Ana gelir)
   - ARPU: 650-2.500₺/ay
   - Retention: %85+ (cihaz bağımlılığı)

2. **Cihaz Satışı** (Tek seferlik)
   - Satış fiyatı: 1.499-1.999₺
   - Maliyet: 900-1.100₺
   - Kâr: 400-900₺/cihaz

3. **Ek Cihaz Satışı**
   - Mevcut müşterilere: 1.299₺
   - Toplu alım (3+): 999₺/cihaz

4. **Aksesuar Satışı**
   - Şarj dock: 199₺
   - Duvar montaj: 149₺
   - Renkli kılıf: 99₺

### Finansal Projeksiyonlar

| Metrik | 2026 Q2 | 2026 Q4 | 2027 Q4 |
|--------|---------|---------|---------|
| Cihaz Satışı | 500 | 5.000 | 20.000 |
| Cihaz Geliri | 750K ₺ | 7.5M ₺ | 30M ₺ |
| SaaS MRR | 5M ₺ | 25M ₺ | 100M ₺ |
| **Toplam ARR** | **60M ₺** | **150M ₺** | **1.2 Milyar ₺** |

---

## 🚀 Lansman Planı

### Faz 1: Prototip (2026 Q1)
- ✅ 3D tasarım + mockup
- ✅ PCB tasarımı (KiCad)
- ✅ Firmware geliştirme (ESP32)
- ✅ Backend entegrasyonu
- ✅ 10 adet prototip üretimi

### Faz 2: Pilot Program (2026 Q2)
- 🎯 50 pilot KOBİ'ye ücretsiz cihaz
- 🎯 Geri bildirim toplama
- 🎯 İyileştirmeler
- 🎯 Viral pazarlama (video, sosyal medya)

### Faz 3: Toplu Üretim (2026 Q3)
- 🎯 Çin/Türkiye fabrikası anlaşması
- 🎯 5.000 adet ilk üretim
- 🎯 Resmi lansman (basın, etkinlik)
- 🎯 E-ticaret satış başlangıcı

### Faz 4: Ölçeklendirme (2026 Q4 - 2027)
- 🎯 20.000+ cihaz satışı
- 🎯 Global pazar (İngiltere, Almanya)
- 🎯 Yeni modeller (YZBot Pro, YZBot Mini)
- 🎯 B2B toplu satış (franchise'lar)

---

## 🎨 Marka & Tasarım

### Logo Konsepti
- **Renk:** Turkuaz + Beyaz (teknoloji + güven)
- **Şekil:** Ses dalgası + mikrofon
- **Tipografi:** Modern, yuvarlak (friendly)

### Paketleme
- Premium kutu (Apple tarzı)
- İçerik: Cihaz + Şarj dock + Hızlı başlangıç kılavuzu
- QR kod → kurulum videosu

### Pazarlama Sloganları
- "Konuşan İşletmeniz" 🎙️
- "7/24 Asistanınız, Cebinizde"
- "Müşteri Kaybetmeyin, YZBot Konuşsun"

---

## 🤝 GitHub + Sponsor Stratejisi

### Açık Kaynak Bileşenler

1. **YZBot-hardware** (GitHub repo)
   - KiCad PCB tasarımları
   - 3D modeller (STL)
   - BOM (Bill of Materials)
   - Üretim kılavuzu

2. **YZBot-firmware** (GitHub repo)
   - ESP32 firmware (C++)
   - Bluetooth protokolü
   - OTA güncelleme
   - LED kontrol

3. **YZBot-sdk** (npm package)
   - JavaScript/TypeScript SDK
   - WebSocket client
   - Ses streaming
   - Cihaz yönetimi

### Sponsor Tier'ları

| Tier | Aylık | Yıllık | Faydalar |
|------|-------|--------|----------|
| ☕ **Supporter** | $10 | $100 | İsim + logo sitede |
| 🎨 **Contributor** | $50 | $500 | + Logonuz cihazda sticker |
| 🌟 **Sponsor** | $250 | $2.500 | + Özel renk cihaz (10 adet) |
| 💎 **Gold** | $1.000 | $10.000 | + Cihazda lazer gravür logo |
| 🚀 **Platinum** | $5.000 | $50.000 | + Co-branding (YZBot by [Sponsor]) |

**Hedef:** 50 sponsor → $50K/ay ek gelir

---

## 📈 Rekabet Avantajı

### Rakip Analizi

| Özellik | YZBot | Amazon Echo | Google Nest | Yollabot |
|---------|------|-------------|-------------|----------|
| KOBİ Odaklı | ✅ | ❌ | ❌ | ✅ |
| Randevu Sistemi | ✅ | ❌ | ❌ | ❌ |
| Ürün Satışı | ✅ | ❌ | ❌ | ❌ |
| Türkçe AI | ✅ | ⚠️ | ⚠️ | ✅ |
| Fiyat | 1.499₺ | 2.500₺ | 2.000₺ | 3.500₺ |
| Açık Kaynak | ✅ | ❌ | ❌ | ❌ |

**Sonuç:** YZBot = En uygun fiyat + En fazla özellik + Açık kaynak

---

## 🎯 Hemen Yapılacaklar (Bu Hafta)

### Tasarım
- [ ] YZBot logosu tasarımı (Fiverr: 2.000₺)
- [ ] 3D mockup render (Fiverr: 1.500₺)
- [ ] Paketleme tasarımı

### Geliştirme
- [ ] Sesli yanıt API endpoint (`/api/voice/stream`)
- [ ] Gemini Speech-to-Text entegrasyonu
- [ ] Google TTS entegrasyonu
- [ ] WebSocket streaming

### GitHub
- [ ] `YZBot-hardware` repo oluştur
- [ ] `YZBot-firmware` repo oluştur
- [ ] Sponsor tier dokümanı
- [ ] README + roadmap

### Pazarlama
- [ ] İlk 50 KOBİ'ye pilot program duyurusu
- [ ] Landing page (YZBot.botunuz.com)
- [ ] Tanıtım videosu senaryosu

---

## 📞 İletişim

**Proje:** YZBot - AI Asistan Cihazı  
**Durum:** Prototip Aşaması  
**Lansman:** 2026 Q2  
**GitHub:** github.com/botunuz/YZBot-hardware

---

**Hedef:** 2027'de Türkiye'nin en değerli SaaS + Hardware girişimi 🚀

**ARR Hedefi:** 1-1.5 Milyar ₺

