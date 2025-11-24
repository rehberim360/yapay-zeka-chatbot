YAPAYZEKA CHATBOT SİSTEMİ - www.yapayzekachatbot.com
📌 PROJE AMACI VE KULLANIM ALANI
Ana Amaç
İşletmelerin web sitelerinden otomatik olarak bilgi toplayarak, yapay zeka destekli chatbot oluşturan ve müşteri etkileşimlerini yöneten SaaS (Software as a Service) platformu. En önemli özelliği otomatik kurulumu kısa sürede hazır hale gelmesi

Hedef Kullanıcılar
Küçük ve orta ölçekli işletmeler (KOBİ)
Hizmet sektörü (kuaförler, klinikler, oteller, restoranlar vb. gibi hizmet veren tüm sektörler)
E-ticaret siteleri
Danışmanlık firmaları
Temel Kullanım Senaryoları
Otomatik Kurulum: İşletme web sitesi URL'i girilir → Sistem otomatik bilgi toplar → Chatbot hazır
Müşteri İletişimi: Web sitesine gömülen widget ile 7/24 müşteri desteği
Randevu Yönetimi: AI ile otomatik randevu alma, çakışma kontrolü
Bilgi Tabanı: SSS, hizmetler, ürünler otomatik organize edilir
🏗️ SİSTEM MİMARİSİ
Genel Yapı (3 Katmanlı)
┌─────────────────────────────────────────────────────┐
│                   FRONTEND                          │
│         (Next.js 15 + React 19)                     │
│   Dashboard + Landing Page + Auth Pages            │
└─────────────────────────────────────────────────────┘
                        ↕ REST API / WebSocket
┌─────────────────────────────────────────────────────┐
│                   BACKEND                           │
│         (Node.js + Express + TypeScript)            │
│   API + AI Engine + WebSocket Server                │
└─────────────────────────────────────────────────────┘
                        ↕ SQL / Cache
┌─────────────────────────────────────────────────────┐
│              DATABASE + CACHE                       │
│      Supabase (PostgreSQL) + Redis                  │
└─────────────────────────────────────────────────────┘
                        ↕ Embed Script
┌─────────────────────────────────────────────────────┐
│                   WIDGET                            │
│         (React + Vite + Socket.io)                  │
│   Müşteri web sitelerine gömülen chat widget   
(Sektör Standartlarında Chat Hizmeti Whatsapp wb Sohbet penceresi)    │
└─────────────────────────────────────────────────────┘
🎨 FRONTEND (Dashboard + Web Sitesi)
Teknoloji Stack
Framework: Next.js 15 (App Router)
UI Library: React 19
Styling: Tailwind CSS 4
Component Library: Radix UI + shadcn/ui
State Management: React Hooks + SWR
Form Management: React Hook Form + Zod
Real-time: Socket.io Client
Charts: Recharts
Animations: Framer Motion
Ana Bölümler
1. Landing Page (Pazarlama)
Ürün tanıtımı
Özellikler ve fiyatlandırma
Demo ve kayıt formları
2. Authentication (Kimlik Doğrulama)
Kayıt olma (Google - Email Giriş)
Giriş yapma
Şifre sıfırlama
Multi-tenant desteği
3. Dashboard (Yönetim Paneli)
Ana Modüller:

a) AI Otomatik Kurulum

URL girişi
Web scraping (Puppeteer/Firecrawl)
AI ile veri çıkarma (2 fazlı sistem)
Önizleme ve onaylama
Otomatik kayıt
b) Bot Yapılandırması

Sistem talimatları
Bilgi tabanı yönetimi
Fonksiyon yönetimi
Prompt şablonları
c) Hizmet Yönetimi

Hizmet ekleme/düzenleme
Kategori yönetimi
Fiyatlandırma
Görseller ve detaylar
AI destekli import
d) Randevu Sistemi

Randevu oluşturma
Takvim görünümü
Çakışma kontrolü
Durum yönetimi
Real-time güncellemeler
e) Sohbet Yönetimi

Aktif konuşmalar 
Mesaj geçmişi
Müşteri bilgileri
Canlı destek devralma
f) Analitik ve Raporlar

Sohbet istatistikleri
Randevu metrikleri
Gelir analizi
Popüler hizmetler
⚙️ BACKEND (API + AI Engine)
Teknoloji Stack
Runtime: Node.js 20 LTS
Framework: Express.js 5
Language: TypeScript
Database: Supabase (PostgreSQL)
Cache: Redis + IORedis
Queue: BullMQ
WebSocket: Socket.io
AI: Google Gemini 2.5 
Web Scraping: Puppeteer + Firecrawl
Validation: Zod
Logging: Winston
Servis Mimarisi
1. Core Services (Temel Servisler)
a) Authentication Service

JWT token yönetimi
Multi-tenant izolasyonu
Rol tabanlı yetkilendirme
b) Bot Service

Gemini AI entegrasyonu
Konuşma yönetimi
Function calling

c) Cache Service

Redis cache yönetimi
TTL stratejileri
Invalidation mekanizması
2. AI Setup Services (Otomatik Kurulum)
a) Scraper Orchestrator

Puppeteer scraper
Firecrawl scraper
Multi-page scraping
Retry mekanizması
b) Two-Phase Extractor

Faz 1: Özet çıkarma (homepage)
Şirket bilgileri
Sektör tespiti
Tespit edilen öğeler (hizmet/ürün/personel)
Faz 2: Detay çıkarma (item pages)
Link eşleştirme
Detaylı bilgi çıkarma
Görsel ve fiyat bilgileri
c) Link Matcher

Exact matching
Fuzzy matching
Content-based matching
d) Multi-Stage Extractor (Alternatif)

5 aşamalı extraction
Stage-by-stage kontrol
Session recovery
3. Business Services (İş Mantığı)
a) Service Management

CRUD operasyonları
Kategori yönetimi
Availability kontrolü
b) Appointment Service

Randevu oluşturma
Conflict detection (provider-based)
Availability checking
Cache invalidation
Google Takvim uyumlu
c) Resource Service

Kaynak yönetimi
Kapasite kontrolü
Çakışma önleme
d) Conversation Service

Sohbet yönetimi
Mesaj kaydetme
Real-time events
Sektör standartlarında Sohbet sistemi
e) Knowledge Base Service

SSS yönetimi
Otomatik kategorileme
Arama ve filtreleme
4. AI Pipeline Services (Import Sistemi)
a) Pipeline Orchestrator

Servis/ürün/personel import
Deep scraping
Queue yönetimi
b) Specialized Extractors

Service extractor
Product extractor
Personnel extractor
Feature generator
Sector detector
🗄️ DATABASE (Supabase PostgreSQL)
Multi-Tenant Yapı
Her tablo tenant_id ile izole edilmiş, Row Level Security (RLS) aktif.

Ana Tablo Kategorileri
1. Core Tables (Temel)
tenants: İşletme bilgileri
users: Sistem kullanıcıları
customers: Müşteri verileri
2. Bot Configuration (Bot Yapılandırması)
bot_configs: Bot ayarları, sistem talimatları
bot_knowledge_base: Bilgi tabanı girdileri
bot_functions: Aktif fonksiyonlar
3. AI & Data Collection (Veri Toplama)
ai_scraped_data: Scraping sonuçları
company_information: Şirket detayları
unified_auto_setup_sessions: Kurulum oturumları
4. Business Entities (İş Varlıkları)
services: Hizmet kataloğu
provider_type, provider_name (conflict detection için)
duration_minutes, price
is_available, category
products: Ürün kataloğu
resources: Kaynaklar (personel, oda, ekipman)
type, capacity, availability
appointments: Randevular
service_id (ZORUNLU)
resource_id (opsiyonel)
scheduled_date, scheduled_time
status, priority
5. Communication (İletişim)
conversations: Sohbet oturumları
messages: Mesajlar
notifications: Bildirimler
Database Özellikleri
RLS (Row Level Security): Tenant izolasyonu
Indexes: Performans optimizasyonu
Triggers: Otomatik işlemler
Functions: Stored procedures
💾 CACHE STRATEJİSİ (Redis)
Cache Türleri
1. Short-Term Cache (Kısa Süreli)
Hizmet listeleri: 5 dakika TTL
Müsaitlik sorguları: Manuel invalidation
Kullanıcı oturumları: 30 dakika TTL
2. Long-Term Cache (Uzun Süreli)
Prompt şablonları: Persistent
Bot yapılandırması: Persistent
Şirket bilgileri: 1 saat TTL
3. Invalidation Stratejisi
Randevu oluşturulduğunda → Availability cache temizlenir
Hizmet güncellendiğinde → Service list cache temizlenir
Bot config değiştiğinde → Prompt cache temizlenir

AI ye gönderilecek yani apiye gönderilecek verilerin hızlı olaması gerekiyor. Chache Sohbet session
🤖 YAPAY ZEKA SİSTEMİ
AI Provider
Google Gemini 2.5 Flash

Hızlı yanıt süresi
Function calling desteği
Türkçe dil desteği
Maliyet etkin
AI Kullanım Alanları
1. Otomatik Kurulum
Web sitesi içerik analizi
Şirket bilgisi çıkarma
Hizmet/ürün/Personel tespiti
Kategori belirleme
SSS oluşturma
2. Chatbot
Doğal dil anlama
Bağlam yönetimi
Function calling (randevu, hizmet listeleme)
Çok dilli destek

3. Function Calling
Mevcut Fonksiyonlar:

list_services: Hizmet listeleme
get_service_details: Hizmet detayı
check_appointment_availability: Müsaitlik kontrolü
create_appointment: Randevu oluşturma
list_appointments: Randevu listeleme
update_appointment: Randevu güncelleme
cancel_appointment: Randevu iptali
list_resources: Kaynak listeleme
search_knowledge_base: Bilgi tabanı arama
handover_to_human: Canlı desteğe yönlendirme
Prompt Sistemi (Modular)
Yapı:

System Instructions: Genel davranış kuralları
Tenant Information: İşletme bilgileri
Knowledge Base: SSS ve bilgi tabanı
Function Data: Hizmet, personel, kaynak listeleri
Rules Modules: Randevu, sipariş, destek kuralları
Özellikler:

Dinamik prompt oluşturma
Cache mekanizması
Modüler yapı (kolayca özelleştirilebilir)
Token optimizasyonu
🔄 OTOMATIK KURULUM SİSTEMİ
İki Fazlı Yaklaşım
Faz 1: Özet Çıkarma (Summary Phase)
Amaç: Hızlı genel bakış

Süreç:

Homepage scraping (Puppeteer/Firecrawl)
AI ile analiz
Çıkarılan bilgiler:
Şirket adı, sektör, açıklama
İletişim bilgileri
Tespit edilen öğeler (isimler + linkler)
Kullanıcıya özet gösterilir
Onay beklenir


Faz 2: Detay Çıkarma (Detail Phase)
Amaç: Detaylı bilgi toplama

Süreç:

Kullanıcı onayladıktan sonra başlar
Her öğe için:
Link eşleştirme (exact/fuzzy/content)
Sayfa scraping
AI ile detay çıkarma
Çıkarılan bilgiler:
Tam açıklama
Fiyat, süre
Görseller
Özellikler
Database'e kayıt
Cache güncelleme
Süre: ~2-5 dakika (öğe sayısına göre)

Scraping Providers
1. Puppeteer (Varsayılan)
Avantajlar: Ücretsiz, hızlı, kontrol edilebilir
Dezavantajlar: JavaScript rendering sınırlı
Kullanım: Basit siteler
2. Firecrawl (Premium)
Avantajlar: Gelişmiş scraping, markdown çıktı, çoklu sayfa
Dezavantajlar: Ücretli, API limitleri
Kullanım: Karmaşık siteler, SPA'lar
📱 WIDGET (Gömülebilir Chat)
Teknoloji Stack
Framework: React 18
Build Tool: Vite
Real-time: Socket.io Client
Styling: Inline CSS (izolasyon için)
Özellikler
Gömülebilir: Tek script tag ile entegrasyon
Özelleştirilebilir: Renk, logo, pozisyon
Responsive: Mobil ve desktop uyumlu
Multi-language: TR, EN, DE, FR
Session Persistence: LocalStorage ile oturum saklama
Unread Notifications: Okunmamış mesaj bildirimi
Full-screen Mode: Mobilde tam ekran
Lightweight: < 100KB gzipped
Entegrasyon
<script src="https://cdn.example.com/widget.js"></script>
<script>
  ChatWidget.init({
    tenantId: 'your-tenant-id',
    apiUrl: 'https://api.example.com',
    primaryColor: '#007bff'
  });
</script>
Mesaj Tipleri
Text mesajlar
Görsel mesajlar
Button'lu mesajlar
Card'lı mesajlar
Quick replies
🔐 GÜVENLİK VE YETKİLENDİRME
Authentication
JWT Token: Access + Refresh token
Cookie-based: HttpOnly, Secure
Multi-tenant: Tenant ID ile izolasyon
Authorization
Role-based: Admin, User, Customer
Row Level Security: Database seviyesinde izolasyon
API Rate Limiting: DDoS koruması
Data Security
Encryption: Hassas veriler şifreli
HTTPS: Tüm iletişim şifreli
Input Validation: Zod ile validasyon
SQL Injection: Parameterized queries
🚀 PERFORMANS OPTİMİZASYONU
Frontend
Code Splitting: Route-based lazy loading
Image Optimization: Next.js Image component
Caching: SWR ile client-side cache
Memoization: React.memo, useMemo
Backend
Redis Cache: Sık kullanılan veriler
Database Indexes: Hızlı sorgular
Connection Pooling: Database bağlantı havuzu
Queue System: BullMQ ile async işlemler
Real-time
WebSocket: Socket.io ile düşük latency
Room-based: Tenant bazlı izolasyon
Event Throttling: Gereksiz event'leri engelleme
📊 RANDEVU SİSTEMİ (Detaylı)
Service-Based Architecture
Her randevu bir hizmet üzerinden oluşturulur (service_id zorunlu).

Conflict Detection (Çakışma Önleme)
Provider-Based Mantık:

Service'in provider bilgilerini kontrol et
Aynı provider'a sahip tüm servisleri bul
Bu servislerin randevularını kontrol et
Zaman çakışması hesapla
Çakışma varsa hata döndür
Formül:

Çakışma = (requestStart < aptEnd) && (requestEnd > aptStart)
Resource Management
Opsiyonel: Bazı hizmetler kaynak gerektirir
Capacity: Kaynak kapasitesi kontrolü
Availability: Müsaitlik kontrolü
Real-time Updates
Randevu oluşturulduğunda → WebSocket event
Frontend otomatik güncellenir
Cache invalidation
🔧 DEPLOYMENT VE ALTYAPI
Hosting (Önerilen)
Frontend: Vercel / Netlify
Backend: Railway / Render / DigitalOcean
Database: Supabase (managed PostgreSQL)
Cache: Redis Cloud / Upstash
Widget: CDN (Cloudflare)
Environment Variables
Frontend: 10+ değişken (API URL, public keys)
Backend: 20+ değişken (DB, Redis, AI keys)
Widget: 3 değişken (API URL, tenant ID)
Monitoring
Logging: Winston (file + console)
Error Tracking: Sentry (opsiyonel)
Performance: New Relic (opsiyonel)
