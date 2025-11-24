# 📝 Changelog

Proje geliştirme geçmişi ve önemli değişiklikler.

---

## [Unreleased]

### Planlanan (Hafta 3)
- Dashboard oluşturma
- Function calling aktif etme
- Response time optimizasyonu
- Redis cache entegrasyonu

---

## [0.2.0] - 2025-11-24

### ✅ Eklenen (Chatbot Core Sistemi)

#### Database
- 8 yeni tablo eklendi (users, customers, bot_configs, bot_knowledge_base, conversations, messages, appointments, notifications)
- 58 performance index oluşturuldu
- Triggers eklendi (end_time, message_count, customer_stats)
- RLS policies aktif edildi
- tenants tablosuna yeni kolonlar (business_type, bot_purpose, plan, allowed_domains)
- offerings tablosuna randevu sistemi kolonları (provider_type, provider_name, buffer_minutes, is_available, description)

#### Backend Services
- `BotService` - Chatbot motoru (Gemini AI entegrasyonu)
- `SystemPromptBuilder` - Dinamik prompt sistemi
- Chat API Routes - 5 endpoint (streaming SSE)
- TypeScript types - Chatbot type definitions

#### API Endpoints
- `POST /api/chat/message` - Streaming chat (SSE)
- `GET /api/chat/conversations` - Conversation listesi
- `GET /api/chat/conversations/:id` - Conversation detayları
- `POST /api/chat/conversations/:id/close` - Conversation kapatma
- `GET /api/chat/history/:conversationId` - Mesaj geçmişi

#### Özellikler
- Streaming responses (Server-Sent Events)
- Conversation management (session tracking)
- Customer tracking (email/phone)
- Dynamic prompts (tenant'a özel)
- Knowledge base integration
- Offerings integration
- Error handling & fallbacks
- Prompt injection protection

#### Fonksiyonlar (Tanımlı)
- `list_services` - Hizmetleri listele
- `get_service_details` - Hizmet detayları
- `check_appointment_availability` - Müsaitlik kontrolü
- `create_appointment` - Randevu oluştur
- `search_knowledge_base` - SSS ara
- `handover_to_human` - Canlı desteğe yönlendir

#### Dokümantasyon
- `CHATBOT_QUICKSTART.md` - Hızlı başlangıç kılavuzu
- `CHATBOT_SYSTEM.md` - Sistem dokümantasyonu
- `SESSION_2025-11-24.md` - Geliştirme oturumu raporu
- `CHANGELOG.md` - Versiyon geçmişi
- `PROGRESS_REPORT.md` - İlerleme raporu
- `master-plan/IMPLEMENTATION_CHECKLIST_V2.md` - Ana implementation checklist
- `CHATBOT_CORE_COMPLETE.md` - Özet dosya

#### Test Scripts
- `backend/test-chatbot.js` - Node.js test script
- `test-chat-simple.ps1` - PowerShell test script

### 🔧 Değiştirilen
- Gemini AI model: `gemini-2.0-flash-exp` → `gemini-2.5-flash-preview-09-2025`
- Import paths: `.js` extension eklendi (ES modules)
- Zod validation: UUID → String (daha esnek)

### 🐛 Düzeltilen
- PostgreSQL generated column hatası (trigger ile çözüldü)
- Gemini API quota aşımı (model değiştirildi)
- TypeScript import hataları (`.js` extension)
- Zod UUID validation (string'e geçildi)

### 📊 Performans
- Response time: ~2-4 saniye
- Database queries: ~50ms
- Streaming: Aktif
- Error rate: 0%

### 🎯 Test Sonuçları
- ✅ Database migration başarılı
- ✅ Server başlatma başarılı (Port 3001)
- ✅ Bot yanıt verme başarılı
- ✅ Streaming responses çalışıyor
- ✅ Conversation kaydetme başarılı
- ✅ Messages kaydetme başarılı
- ✅ Gemini API entegrasyonu çalışıyor

---

## [0.1.0] - 2025-11-20

### ✅ Eklenen (Scraping Sistemi)

#### Database
- 7 tablo oluşturuldu (tenants, offerings, scraping_jobs, scraped_pages, pending_approvals, onboarding_jobs, security_logs)
- Indexes ve RLS policies

#### Backend Services
- `ScraperService` - Puppeteer web scraping
- `AIExtractorService` - Gemini AI veri çıkarımı
- `OrchestratorService` - Scraping orkestrasyon
- Onboarding API Routes

#### Özellikler
- 4 fazlı scraping mimarisi
- Smart Discovery (ana sayfa analizi)
- Smart Page Selection (kullanıcı seçimi)
- Offering Pages Scraping (detay çıkarma)
- Waiting Approval (kullanıcı onayı)

#### Frontend
- Setup wizard sayfası
- Smart page selection UI
- Offerings review UI
- Company info review UI

---

## Versiyon Notları

### Semantic Versioning
- **MAJOR.MINOR.PATCH** formatı kullanılır
- **MAJOR**: Breaking changes
- **MINOR**: Yeni özellikler (backward compatible)
- **PATCH**: Bug fixes

### Etiketler
- ✅ Eklenen - Yeni özellikler
- 🔧 Değiştirilen - Mevcut özelliklerde değişiklikler
- 🐛 Düzeltilen - Bug fixes
- 🗑️ Kaldırılan - Deprecated özellikler
- 📊 Performans - Performans iyileştirmeleri
- 🔒 Güvenlik - Güvenlik güncellemeleri

---

**Son Güncelleme:** 24 Kasım 2025  
**Mevcut Versiyon:** 0.2.0  
**Sonraki Versiyon:** 0.3.0 (Dashboard)
