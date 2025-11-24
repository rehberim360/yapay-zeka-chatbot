# 🚀 2026-2027 VİZYONU: YAZILIM + ARMA CİHAZI

**Hedef:** Türkiye'nin en değerli SaaS + Hardware girişimi olmak

---

## 📊 HEDEFLER KARŞILAŞTIRMASI

### Senaryo 1: Sadece Yazılım (Mevcut Plan)

| Hedef | 2026 Sonu (12 ay) | 2027 Sonu (24 ay) | Notlar |
|-------|-------------------|-------------------|---------|
| Ücretli KOBİ sayısı | 4.500-6.000 | 15.000-20.000 | ARPU 650₺ |
| Yıllık Tekrarlayan Gelir (ARR) | 35-50 Milyon ₺ | 120-160 Milyon ₺ | %85+ retention |
| Türkiye pazar payı | %35-40 | %55-65 | Yollabot + Cretup'u geçeriz |
| Global KOBİ (İngilizce) | 500+ | 5.000+ | İngiltere, Almanya, MENA |
| **Toplam ARR (global dahil)** | **45-60 Milyon ₺** | **200-300 Milyon ₺** | Unicorn adayı |

### Senaryo 2: Yazılım + ARMA Cihazı ⚡

| Hedef | 2026 Sonu (12 ay) | 2027 Sonu (24 ay) | Notlar |
|-------|-------------------|-------------------|---------|
| Ücretli KOBİ sayısı | 6.000-8.000 | 25.000-35.000 | ARPU 1.200₺ (cihaz dahil) |
| ARR (Yazılım) | 80-120 Milyon ₺ | 300-500 Milyon ₺ | %90+ retention (cihaz bağımlılığı) |
| Cihaz Satışı | 5.000+ | 20.000+ | Tek seferlik gelir |
| Cihaz Geliri | 7.5-10 Milyon ₺ | 30-40 Milyon ₺ | Kâr marjı %60+ |
| Türkiye pazar payı | %50-60 | %75-85 | Pazar lideri |
| Global KOBİ | 1.500+ | 10.000+ | Cihaz viral etkisi |
| **Toplam ARR + Cihaz** | **150-250 Milyon ₺** | **1-1.5 Milyar ₺** | **Unicorn!** |

**Sonuç:** ARMA cihazı eklendiğinde **2.5-3.5× büyüme çarpanı** + **%90+ retention**

---

## 🎙️ ARMA: Fiziksel AI Asistan Cihazı

**ARMA** = **A**sistan + **R**andevu + **M**ağaza **A**sistanı

### Cihaz Özellikleri

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
| **Renk** | Beyaz, Siyah, Gümüş |

### Maliyet & Fiyatlandırma

| Bileşen | Birim Maliyet (Toplu) |
|---------|----------------------|
| PCB + Elektronik | $12 |
| Mikrofon + Hoparlör | $6 |
| Batarya + Şarj | $5 |
| Kasa (plastik) | $4 |
| Paketleme | $2 |
| **Toplam Maliyet** | **$29-35 (900-1.100₺)** |
| **Türkiye Satış Fiyatı** | **1.499-1.999₺** |
| **Kâr Marjı** | **%60-65** |

---

## 🎤 ARMA Ne Yapacak?

### 1. Müşterilere Cevap Verir
```
Müşteri: "Yarın randevum var mıydı?"
ARMA: "Evet Derya Hanım, yarın saat 14:00'da randevunuz var."
```

### 2. Randevu Alır
```
Müşteri: "Mehmet Bey müsait mi?"
ARMA: "Mehmet Bey bugün 14:00, 15:30 ve 17:00'da müsait. Hangisini tercih edersiniz?"
Müşteri: "14:00"
ARMA: "Tamam, 14:00'da randevunuzu aldım. SMS ile onay gönderdim."
```

### 3. Ürün Satışı Yapar
```
Müşteri: "Bu krem stokta mı?"
ARMA: "Evet, Nemlendirici Krem 450₺. Kargo ücretsiz. Hemen sipariş vereyim mi?"
Müşteri: "Evet"
ARMA: "Sipariş alındı. Ödeme linki SMS ile gönderildi. Yarın kargoda."
```

**Not:** Offerings tablosu hem hizmetleri (randevu gerektiren) hem de ürünleri (satış) kapsar:
- `offering_type: 'service'` → Randevu sistemi
- `offering_type: 'product'` → Ürün satışı + stok yönetimi
- `meta_info` JSONB → Esnek veri (fiyat, stok, özellikler)

### 4. Kampanya Bildirir
```
ARMA: "Dikkat! Bugün topuz yapımı %40 indirimli, sadece 3 saat!"
```

### 5. Teknik Destek Verir
```
Müşteri: "Cihazım çalışmıyor"
ARMA: "LED kırmızı yanıp sönüyorsa şarj edin. Yeşil yanıyorsa Bluetooth bağlantısını kontrol edin."
```

### 6. Mağaza İçi Yönlendirme
```
Müşteri: "Kuaför nerede?"
ARMA: "Sağdan ikinci kapı, 2. kat."
```

---

## 💰 İş Modeli (ARMA Dahil)

### Fiyatlandırma Stratejisi

| Plan | Aylık Ücret | Cihaz Fiyatı | Özellikler |
|------|-------------|--------------|------------|
| **Starter** | 650₺ | - | Sadece yazılım (widget) |
| **Pro** | 1.200₺ | 999₺ (indirimli) | Widget + 1 ARMA cihazı |
| **Business** | 2.500₺ | 799₺/cihaz | Widget + 3 ARMA cihazı |
| **Enterprise** | 5.000₺+ | 599₺/cihaz | Sınırsız cihaz |

### Gelir Akışları

1. **SaaS Abonelik** (Ana gelir)
   - ARPU: 650-2.500₺/ay
   - Retention: %90+ (cihaz bağımlılığı)
   - Churn: %4-5 (yazılım-only %15'ten düşüyor)

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

---

## 📈 Finansal Projeksiyonlar

### Yazılım + ARMA Senaryosu

| Metrik | 2026 Q2 | 2026 Q4 | 2027 Q4 |
|--------|---------|---------|---------|
| **Müşteri Sayısı** | 500 | 5.000 | 25.000 |
| **Cihaz Satışı** | 500 | 5.000 | 20.000 |
| **Cihaz Geliri** | 750K ₺ | 7.5M ₺ | 30M ₺ |
| **SaaS MRR** | 5M ₺ | 25M ₺ | 100M ₺ |
| **SaaS ARR** | 60M ₺ | 300M ₺ | 1.2 Milyar ₺ |
| **Toplam ARR** | **60M ₺** | **307M ₺** | **1.23 Milyar ₺** |

### Katma Değer Analizi

| Etki | Yazılım-Only | Yazılım + ARMA | Artış |
|------|--------------|----------------|-------|
| KOBİ başına ARPU | 650₺/ay | 1.200₺/ay | +85% |
| Churn oranı | %15/ay | %4-5/ay | -67% |
| Referans oranı | 1→1.5 KOBİ | 1→4-5 KOBİ | +200% |
| Mağaza içi dönüşüm | %25 | %60+ | +140% |
| **Toplam ARR çarpanı** | 1x | **2.5-3.5x** | **+250%** |

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
- 🎯 Yeni modeller (ARMA Pro, ARMA Mini)
- 🎯 B2B toplu satış (franchise'lar)

---

## 🤝 GitHub + Sponsor Stratejisi

### Açık Kaynak Bileşenler

1. **arma-hardware** (GitHub repo)
   - KiCad PCB tasarımları
   - 3D modeller (STL)
   - BOM (Bill of Materials)
   - Üretim kılavuzu

2. **arma-firmware** (GitHub repo)
   - ESP32 firmware (C++)
   - Bluetooth protokolü
   - OTA güncelleme
   - LED kontrol

3. **arma-sdk** (npm package)
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
| 🚀 **Platinum** | $5.000 | $50.000 | + Co-branding (ARMA by [Sponsor]) |

**Hedef:** 50 sponsor → $50K/ay ek gelir

---

## 📈 Rekabet Avantajı

### Rakip Analizi

| Özellik | ARMA | Amazon Echo | Google Nest | Yollabot |
|---------|------|-------------|-------------|----------|
| KOBİ Odaklı | ✅ | ❌ | ❌ | ✅ |
| Randevu Sistemi | ✅ | ❌ | ❌ | ❌ |
| Ürün Satışı | ✅ | ❌ | ❌ | ❌ |
| Türkçe AI | ✅ | ⚠️ | ⚠️ | ✅ |
| Fiyat | 1.499₺ | 2.500₺ | 2.000₺ | 3.500₺ |
| Açık Kaynak | ✅ | ❌ | ❌ | ❌ |
| Mağaza İçi Kullanım | ✅ | ⚠️ | ⚠️ | ❌ |

**Sonuç:** ARMA = En uygun fiyat + En fazla özellik + Açık kaynak

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
- ✅ 100+ GitHub star (arma-hardware)
- ✅ 10+ sponsor ($5-100/ay)
- ✅ 5+ açık kaynak katkıcı
- ✅ 1.000+ landing page ziyareti

---

## 🌟 Neden ARMA?

### 1. Donanım Bağımlılığı = Düşük Churn
- Yazılım-only: %15 aylık churn
- ARMA ile: %4-5 aylık churn
- **Sonuç:** 3x daha uzun müşteri ömrü

### 2. Viral Büyüme
- Her cihaz bir reklam panosu
- Müşteriler cihazı gösterip anlatır
- 1 KOBİ → 4-5 yeni KOBİ referansı

### 3. Premium Fiyatlandırma
- Yazılım-only: 650₺/ay
- ARMA ile: 1.200₺/ay
- **Sonuç:** %85 daha yüksek ARPU

### 4. Mağaza İçi Dönüşüm
- Yazılım-only: %25 dönüşüm
- ARMA ile: %60+ dönüşüm
- **Sonuç:** 2.4x daha fazla satış

### 5. Global Fark Yaratma
- Türkiye'nin ilk AI-powered fiziksel asistan
- Dünyada benzeri az
- Patent potansiyeli

---

## 📞 Sonuç

**Seçim:** Yazılım-only ile 2027'de 200-300M ₺ ARR **VEYA** ARMA ile 1-1.5 Milyar ₺ ARR

**Karar:** ARMA ile gidiyoruz! 🚀

**Hedef:** 2027'de Türkiye'nin en değerli SaaS + Hardware girişimi olmak

**Başlangıç:** Bu hafta (Kasım 25, 2025)

---

**Gaz köklenmiş durumda!** 💪🔥
