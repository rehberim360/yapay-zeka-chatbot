<div align="center">

<!-- Dil Seçici -->
<p align="right">
  <a href="README.md">🇬🇧 English</a> • <a href="README_TR.md">🇹🇷 Türkçe</a>
</p>

<!-- Logo ve Başlık Yan Yana -->
<table border="0" cellpadding="0" cellspacing="0" style="border: none;">
  <tr>
    <td align="center" valign="middle" style="border: none;">
      <!-- Animasyonlu Maskot Logo -->
      <svg width="100" height="100" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#6366f1;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#7c3aed;stop-opacity:1" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <circle cx="60" cy="60" r="55" fill="url(#bodyGradient)" opacity="0.95"/>
        <circle cx="60" cy="60" r="50" fill="rgba(0,0,0,0.2)" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
        <ellipse cx="60" cy="35" rx="40" ry="20" fill="rgba(255,255,255,0.15)"/>
        <ellipse cx="45" cy="60" rx="6" ry="8" fill="#06b6d4" filter="url(#glow)">
          <animate attributeName="ry" values="8;1;8;8;8" dur="4s" repeatCount="indefinite" keyTimes="0;0.05;0.1;0.8;1"/>
        </ellipse>
        <ellipse cx="75" cy="60" rx="6" ry="8" fill="#06b6d4" filter="url(#glow)">
          <animate attributeName="ry" values="8;1;8;8;8" dur="4s" repeatCount="indefinite" keyTimes="0;0.05;0.1;0.8;1"/>
        </ellipse>
      </svg>
    </td>
    <td align="left" valign="middle" style="border: none; padding-left: 20px;">
      <h1 style="margin: 0; font-size: 2.5em;">Yapay Zeka Chatbot</h1>
      <p style="margin: 5px 0 0 0; font-size: 1.1em; color: #666;">AI-Powered Chatbot Platform</p>
    </td>
  </tr>
</table>

<p><strong>Otomatik kurulum, çok kiracılı mimari ve yapay zeka destekli müşteri hizmetleri ile akıllı chatbot sistemi</strong></p>

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black.svg)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green.svg)](https://supabase.com/)
[![Gemini AI](https://img.shields.io/badge/Gemini-2.5%20Flash-orange.svg)](https://ai.google.dev/)

[Demo](#-demo) • [Özellikler](#-özellikler) • [Mimari](#-mimari) • [Hızlı Başlangıç](#-hızlı-başlangıç) • [Yol Haritası](#-yol-haritası)

</div>

---

## 🌟 Genel Bakış

Herhangi bir işletme web sitesini **5 dakikadan kısa sürede** akıllı bir yapay zeka chatbot'una dönüştürün. Platformumuz otomatik olarak web sitenizi tarar, analiz eder ve müşteri sorularını yanıtlayan, randevu alan ve 7/24 destek sağlayan özel bir chatbot oluşturur.

**YENİ:** **YZBot** ile tanışın - Türkiye'nin ilk işletmeler için yapay zeka destekli fiziksel asistan cihazı! 🎙️

### 🎯 Çözüm Sunduğumuz Sorunlar

- **Manuel Kurulum:** Geleneksel chatbot'lar haftalarca manuel yapılandırma gerektirir
- **Zayıf Bağlam:** İşletmenizi anlamayan genel yanıtlar
- **Entegrasyon Yok:** Hizmetleriniz ve randevu sistemlerinizden kopuk
- **Yüksek Maliyet:** Kurumsal çözümler ayda 500-2000$ maliyetli
- **Ses Desteği Yok:** Sadece metin tabanlı chatbot'lar yüz yüze müşterileri kaçırıyor

### ✨ Çözümümüz

- **5 Dakikalık Kurulum:** Yapay zeka destekli web sitesi tarama ve otomatik yapılandırma
- **Akıllı Bağlam:** Hizmetlerinizi, fiyatlandırmanızı ve iş mantığınızı anlar
- **Yerli Entegrasyon:** Dahili randevu alma ve CRM
- **Uygun Fiyat:** Ayda 49$'dan başlayan fiyatlar (yakında başlatılıyor)
- **YZBot Cihazı:** Mağaza içi müşteri hizmetleri için fiziksel ses asistanı (2026 Q2)

---

## 🚀 Demo

### Canlı Demo
🔗 **[Web Sitesini Ziyaret Edin](https://www.yapayzekachatbot.com)** - 60 gün içinde başlatılıyor!

### Platform Önizlemesi

<div align="center">

![YapayZeka Chatbot Platform](docs/images/yapay-zeka-chatbot-site-hero-section.jpg)

*Herhangi bir işletme web sitesini akıllı bir asistana dönüştüren yapay zeka destekli chatbot platformu*

</div>

---

## ✨ Özellikler

### 🤖 Yapay Zeka Destekli Çekirdek

- **Akıllı Web Sitesi Tarama** - İşletme bilgilerini otomatik olarak keşfeder ve çıkarır
- **Gemini AI Entegrasyonu** - Gelişmiş doğal dil anlama
- **Dinamik Promptlar** - Her işletmeye özel bağlam farkında yanıtlar
- **Fonksiyon Çağırma** - Yerli randevu alma, hizmet sorguları ve daha fazlası
- **Akış Yanıtları** - Gerçek zamanlı, parça parça yanıtlar (SSE)
- **Ses Desteği** - YZBot cihazı için konuşmadan metne ve metinden konuşmaya

### 💼 İşletme Özellikleri

- **Çok Kiracılı Mimari** - Tek platformdan sınırsız işletmeye hizmet
- **Randevu Sistemi** - Çakışma tespiti, müsaitlik kontrolü, bildirimler
- **Ürün/Hizmet Satışı** - Ödeme entegrasyonu ile sohbet üzerinden doğrudan satış
- **Teklifler Yönetimi** - Hizmetler (randevular) ve ürünler (satışlar) için birleşik sistem
- **Bilgi Bankası** - Anlamsal arama ile SSS yönetimi
- **Analitik Panosu** - Konuşma metrikleri, müşteri içgörüleri, performans takibi
- **Canlı Sohbet Devralma** - İnsan ajanlar konuşmaları sorunsuz bir şekilde devralabilir
- **Ödeme Entegrasyonu** - Stripe, PayPal, yerel ödeme ağ geçitleri (planlanıyor)

### 🎨 Kullanıcı Deneyimi

- **Gömülebilir Widget** - Herhangi bir web sitesi için tek satırlık entegrasyon
- **YZBot Cihazı** - Mağaza içi hizmet için fiziksel ses asistanı (YENİ!)
- **Özelleştirilebilir Tasarım** - Marka renklerinize, logonuza ve stilinize uygun
- **Mobil Öncelikli** - Tüm cihazlar için duyarlı tasarım
- **Erişilebilirlik** - WCAG 2.1 AA uyumlu
- **Karanlık Mod** - Otomatik tema değiştirme

### 🔒 Kurumsal Düzey

- **Satır Düzeyinde Güvenlik** - Tam kiracı izolasyonu
- **Hız Sınırlama** - Kötüye kullanımı önleme ve maliyetleri kontrol etme
- **Prompt Enjeksiyon Koruması** - Gelişmiş güvenlik önlemleri
- **%99.9 Çalışma Süresi** - Üretime hazır altyapı
- **GDPR Uyumlu** - Gizlilik öncelikli mimari

---

## 🏗️ Mimari

### Teknoloji Yığını

```
Frontend:  Next.js 15 + React 19 + TypeScript + Tailwind CSS
Backend:   Node.js + Express + TypeScript
Veritabanı: Supabase (PostgreSQL)
AI:        Google Gemini 2.5 Flash
Gerçek Zamanlı: Socket.io + Server-Sent Events
Hosting:   Vercel + Cloudflare CDN
```

---

## 🚀 Hızlı Başlangıç

> **Not:** Bu proje şu anda aktif geliştirme aşamasındadır. Tam kaynak kodu lansmanla birlikte yayınlanacaktır.

### Sponsorlar ve Katkıda Bulunanlar İçin

Projeye sponsor olmak, erken erişim veya ortaklık fırsatları için:
- [Sponsorluk Fırsatları](docs/sponsors/README.md) sayfamızı kontrol edin
- Doğrudan bizimle iletişime geçin

### Yakında (60 Gün İçinde)

- ✅ Tam kaynak kodu yayını
- ✅ Detaylı kurulum kılavuzu
- ✅ API dokümantasyonu
- ✅ Widget entegrasyon örnekleri
- ✅ Video eğitimleri

### Önizleme Erişimi

[www.yapayzekachatbot.com](https://www.yapayzekachatbot.com) adresini ziyaret edin:
- Platformu çalışırken görün
- Bekleme listesine katılın
- Erken kuş fiyatlandırması alın

---

## 📊 Mevcut Durum

### ✅ Tamamlandı (v0.2.0)

- [x] **Veritabanı Mimarisi** - 17 tablo, 58 indeks, RLS politikaları
- [x] **AI Tarama Sistemi** - Akıllı keşif, sayfa seçimi, veri çıkarma
- [x] **Chatbot Çekirdeği** - Gemini entegrasyonu, akış yanıtları, konuşma yönetimi
- [x] **API Uç Noktaları** - SSE akışı ile 5 REST uç noktası
- [x] **Sistem Prompt Oluşturucu** - Dinamik, kiracıya özel promptlar
- [x] **Randevu Sistemi** - Çakışma tespiti, müsaitlik kontrolü

### 🚧 Devam Ediyor (v0.3.0)

- [ ] **Premium Widget** - Modern UI, animasyonlar, dosya yükleme
- [ ] **Pano** - Bot yapılandırması, analitik, canlı sohbet
- [ ] **Performans Optimizasyonu** - Redis önbellek, <200ms yanıt süresi
- [ ] **Üretim Dağıtımı** - CDN, yük dengeleme, izleme
- [ ] **YZBot Cihazı** - Prototip tasarım ve firmware geliştirme

### 📅 Yol Haritası

**Q1 2026**
- [ ] Ses API uç noktaları (konuşmadan metne, metinden konuşmaya)
- [ ] Çoklu dil desteği (10+ dil)
- [ ] Gelişmiş analitik (duygu analizi, konu kümeleme)
- [ ] WhatsApp/Telegram entegrasyonu

**Q2 2026 - YZBot Lansmanı** 🎙️
- [ ] YZBot cihaz prototipi (50 adet)
- [ ] Pilot program (50 işletme)
- [ ] Seri üretim (5.000 adet)
- [ ] Açık kaynak donanım yayını

**Q3-Q4 2026**
- [ ] 5.000+ YZBot cihazı dağıtıldı
- [ ] Beyaz etiket çözümü
- [ ] Küresel genişleme (İngiltere, Almanya, MENA)
- [ ] Kurumsal özellikler

**2027 Hedefleri**
- [ ] 20.000+ YZBot cihazı
- [ ] 25.000-35.000 ödeme yapan işletme
- [ ] 1-1.5 Milyar ₺ ARR
- [ ] Türkiye'nin #1 AI chatbot platformu

---

## 📈 Performans ve Hedefler

### Teknik Metrikler

| Metrik | Hedef | Mevcut |
|--------|-------|--------|
| Yanıt Süresi | <500ms | ~2-4s ⚠️ |
| Veritabanı Sorgusu | <100ms | ~50ms ✅ |
| Çalışma Süresi | >%99.9 | %100 ✅ |
| Hata Oranı | <%0.1 | %0 ✅ |
| Eşzamanlı Kullanıcı | 1000+ | Test Ediliyor |

### İş Hedefleri (2026-2027)

| Metrik | 2026 Sonu | 2027 Sonu |
|--------|-----------|-----------|
| **Sadece Yazılım** | | |
| Ödeme Yapan İşletme | 4.500-6.000 | 15.000-20.000 |
| ARR | 45-60M ₺ | 200-300M ₺ |
| **Yazılım + YZBot** | | |
| Ödeme Yapan İşletme | 6.000-8.000 | 25.000-35.000 |
| Satılan YZBot Cihazı | 5.000+ | 20.000+ |
| Toplam ARR | 150-250M ₺ | **1-1.5M ₺** |
| Türkiye Pazar Payı | %50-60 | %75-85 |

**Etki:** YZBot cihazı **2.5-3.5× büyüme çarpanı** + **%85+ elde tutma** ekler

---

## 🤝 Katkıda Bulunma

Katkılarınızı bekliyoruz! Detaylar için [Katkıda Bulunma Kılavuzu](CONTRIBUTING.md) sayfasına bakın.

---

## 📄 Lisans

Bu proje MIT Lisansı altında lisanslanmıştır - detaylar için [LICENSE](LICENSE) dosyasına bakın.

---

## 🙏 Teşekkürler

Harika açık kaynak teknolojileri ile oluşturuldu:

- [Next.js](https://nextjs.org/) - React framework
- [Supabase](https://supabase.com/) - Backend as a service
- [Gemini AI](https://ai.google.dev/) - Google'ın AI modeli
- [shadcn/ui](https://ui.shadcn.com/) - UI bileşenleri
- [Tailwind CSS](https://tailwindcss.com/) - Stil

---

## 📞 İletişim

- **E-posta:** founder@yapayzekachatbot.com
- **WhatsApp:** +90 532 612 6901
- **Web Sitesi:** [www.yapayzekachatbot.com](https://www.yapayzekachatbot.com)
- **GitHub:** [github.com/rehberim360/yapay-zeka-chatbot](https://github.com/rehberim360/yapay-zeka-chatbot)
- **Durum:** 🚧 Aktif Geliştirme - 60 Gün İçinde Lansman!

---

## 🌟 Yıldız Geçmişi

[![Star History Chart](https://api.star-history.com/svg?repos=rehberim360/yapay-zeka-chatbot&type=Date)](https://star-history.com/#rehberim360/yapay-zeka-chatbot&Date)

---

<div align="center">

**Türkiye'de ❤️ ile yapıldı | [www.yapayzekachatbot.com](https://www.yapayzekachatbot.com)**

🚀 **60 Gün İçinde Başlatılıyor** | 🌟 **GitHub'da Yıldızlayın** | 💼 **[Sponsor Arıyoruz](docs/sponsors/README.md)**

[⬆ başa dön](#yapay-zeka-chatbot)

</div>
