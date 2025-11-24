# 🤖 Yapay Zeka Chatbot - AI-Powered Business Assistant

Modern işletmeler için otomatik onboarding ve AI destekli müşteri hizmetleri platformu.

## 📚 Dokümantasyon

### 🎯 Hızlı Başlangıç
- **[PROGRESS_REPORT.md](PROGRESS_REPORT.md)** - İlerleme raporu ve genel bakış
- **[CHATBOT_CORE_COMPLETE.md](CHATBOT_CORE_COMPLETE.md)** - Chatbot sistemi özeti

### 🤖 Chatbot Sistemi (✅ Tamamlandı - 24 Kasım 2025)
- **[CHATBOT_QUICKSTART.md](backend/docs/CHATBOT_QUICKSTART.md)** - 15 dakikada başla
- **[CHATBOT_SYSTEM.md](backend/docs/CHATBOT_SYSTEM.md)** - Sistem dokümantasyonu
- **[SESSION_2025-11-24.md](backend/docs/SESSION_2025-11-24.md)** - Geliştirme oturumu detayları
- **[CHANGELOG.md](backend/docs/CHANGELOG.md)** - Versiyon geçmişi

### 📋 Master Plan & Checklist
- **[IMPLEMENTATION_CHECKLIST_V2.md](backend/docs/master-plan/IMPLEMENTATION_CHECKLIST_V2.md)** - Ana implementation checklist (%23 tamamlandı)
- **[COMPLETE_DEVELOPMENT_PLAN.md](backend/docs/master-plan/COMPLETE_DEVELOPMENT_PLAN.md)** - Kapsamlı geliştirme planı

### Backend Dokümantasyonu
- **[DATABASE.md](backend/DATABASE.md)** - Veritabanı şeması ve tablo yapıları
- **[SCRAPING_FLOW.md](backend/SCRAPING_FLOW.md)** - Web scraping ve AI extraction süreci
  - 4 fazlı scraping mimarisi
  - Gemini AI promptları
  - Veri akış şemaları
  - Hata yönetimi stratejileri

### Frontend Dokümantasyonu
*(Yakında eklenecek)*

## 🚀 Hızlı Başlangıç

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## 🏗️ Proje Yapısı

```
yapay-zeka-chatbot-com/
├── backend/
│   ├── src/
│   │   ├── controllers/     # API endpoint controllers
│   │   ├── services/        # Business logic
│   │   │   ├── orchestrator.ts   # Scraping orkestrasyon
│   │   │   ├── scraper.ts        # Puppeteer web scraping
│   │   │   └── ai-extractor.ts   # Gemini AI veri çıkarımı
│   │   ├── types/           # TypeScript type definitions
│   │   └── lib/             # Utilities (Supabase client)
│   ├── schema.sql           # Database şeması
│   ├── DATABASE.md          # Database dokümantasyonu
│   └── SCRAPING_FLOW.md     # Scraping süreci dokümantasyonu
│
├── frontend/
│   └── src/
│       └── app/
│           └── setup/       # Onboarding wizard
│
└── widget/                  # Chatbot widget (yakında)
```

## 🛠️ Teknolojiler

### Backend
- **Node.js + TypeScript** - Runtime ve tip güvenliği
- **Express** - Web framework
- **Puppeteer** - Web scraping
- **Gemini AI** - Veri çıkarımı ve analiz
- **Supabase** - PostgreSQL veritabanı
- **Turndown** - HTML → Markdown dönüştürme

### Frontend
- **Next.js 15** - React framework
- **TailwindCSS** - Styling
- **Framer Motion** - Animations
- **React Hook Form** - Form yönetimi
- **Sonner** - Toast notifications

## 📋 Özellikler

### ✅ Tamamlanan (Hafta 1-2)
- [x] Web scraping mimarisi (4 fazlı)
- [x] AI-powered veri çıkarımı
- [x] Onboarding wizard UI
- [x] Database schema & migrations (17 tablo)
- [x] Real-time scraping progress
- [x] **Chatbot Core Sistemi** 🎉
  - [x] Bot Service (Gemini AI entegrasyonu)
  - [x] System Prompt Builder (dinamik prompt)
  - [x] Chat API Routes (5 endpoint)
  - [x] Streaming responses (SSE)
  - [x] Conversation management
  - [x] Customer tracking
  - [x] 8 yeni tablo (users, customers, bot_configs, vb.)
  - [x] 58 performance index
  - [x] Test scripts ve dokümantasyon

### 🚧 Geliştiriliyor (Hafta 3-8)
- [ ] Dashboard (Hafta 3)
- [ ] Chatbot widget (Hafta 4)
- [ ] Appointment system (Hafta 5)
- [ ] Landing page (Hafta 6)
- [ ] Integration & testing (Hafta 7)
- [ ] Pilot müşteri feedback (Hafta 8)
- [ ] Multi-tenancy support
- [ ] Analytics dashboard
- [ ] RAG (Retrieval-Augmented Generation)

## 🔐 Güvenlik

- RLS (Row Level Security) aktif
- Service role key ile backend erişimi
- CORS yapılandırması
- Environment variables ile secret yönetimi

## 📝 Lisans

*(Lisans bilgisi eklenecek)*

## 👥 Katkıda Bulunma

*(Katkı kuralları eklenecek)*

## 🎯 İlerleme Durumu

```
Hafta 1-2: Core Bot          ████████████████████ 100% ✅
Hafta 3:   Dashboard         ░░░░░░░░░░░░░░░░░░░░   0% ⏳
Hafta 4:   Widget            ░░░░░░░░░░░░░░░░░░░░   0% ⏳
Hafta 5:   Appointments      ░░░░░░░░░░░░░░░░░░░░   0% ⏳
Hafta 6:   Landing Page      ░░░░░░░░░░░░░░░░░░░░   0% ⏳
Hafta 7:   Integration       ░░░░░░░░░░░░░░░░░░░░   0% ⏳
Hafta 8:   Feedback          ░░░░░░░░░░░░░░░░░░░░   0% ⏳

Toplam İlerleme: ██░░░░░░░░░░░░░░░░░░ 12.5%
```

**Hedef:** 8 hafta sonra 1 pilot müşteri aktif! 🚀

---

**Son Güncelleme:** 24 Kasım 2025  
**Durum:** Hafta 1-2 Tamamlandı ✅  
**Sonraki:** Dashboard (Hafta 3)
