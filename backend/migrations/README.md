# Database Migrations

Bu klasör, veritabanı şemasındaki değişiklikleri takip eden migration dosyalarını içerir.

## Migration Dosyaları

### 001_add_waiting_approval.sql
- `scraping_jobs` tablosuna `WAITING_APPROVAL` status'ü eklendi
- `pending_approvals` tablosu oluşturuldu
- İlgili indeksler ve RLS policy'leri eklendi

### 002_add_home_data_to_approvals.sql
- `pending_approvals` tablosuna `home_data` JSONB kolonu eklendi
- Ana sayfadan çıkarılan firma bilgilerini saklamak için

### 003_add_onboarding_v2_tables.sql
**Smart Onboarding V2 için yeni tablolar:**

#### onboarding_jobs
- Smart Onboarding V2 workflow'unun durumunu ve ilerlemesini takip eder
- Her fazın verilerini `phase_data` JSONB kolonunda saklar
- Kesintiye uğrayan işlemlerin devam ettirilmesini sağlar

#### security_logs
- Prompt injection denemeleri gibi güvenlik olaylarını kaydeder
- Rate limiting kararları için kullanılır
- Şüpheli aktiviteleri izler

**Eklenen İndeksler:**
- `tenant_id` ve `user_id` üzerinde B-tree indeksler
- `metadata`, `attributes`, `phase_data` üzerinde JSONB GIN indeksler
- Performans optimizasyonu için çeşitli indeksler

## Migration Uygulama

### Supabase'de Uygulama

1. Supabase Dashboard'a git: https://supabase.com/dashboard
2. Projenizi seçin
3. Sol menüden **SQL Editor**'ü açın
4. Migration dosyasının içeriğini kopyalayıp yapıştırın
5. **Run** butonuna tıklayın
6. Sonuçları kontrol edin

### Lokal PostgreSQL'de Uygulama

```bash
# Tek bir migration dosyası
psql -U postgres -d your_database -f migrations/003_add_onboarding_v2_tables.sql

# Tüm migration'ları sırayla
for file in migrations/*.sql; do
  echo "Applying $file..."
  psql -U postgres -d your_database -f "$file"
done
```

## Migration Sırası

Migration'lar numaralandırılmış sırada uygulanmalıdır:
1. 001_add_waiting_approval.sql
2. 002_add_home_data_to_approvals.sql
3. 003_add_onboarding_v2_tables.sql

## Doğrulama

Migration'ların başarıyla uygulandığını doğrulamak için:

```sql
-- Tabloları kontrol et
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('onboarding_jobs', 'security_logs');

-- İndeksleri kontrol et
SELECT indexname, tablename 
FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename IN ('onboarding_jobs', 'security_logs', 'tenants', 'offerings')
ORDER BY tablename, indexname;

-- JSONB GIN indekslerini kontrol et
SELECT 
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
AND indexdef LIKE '%USING gin%'
ORDER BY tablename;
```

## Rollback

Eğer bir migration'ı geri almak isterseniz:

```sql
-- onboarding_jobs ve security_logs tablolarını kaldır
DROP TABLE IF EXISTS security_logs CASCADE;
DROP TABLE IF EXISTS onboarding_jobs CASCADE;

-- JSONB GIN indekslerini kaldır
DROP INDEX IF EXISTS idx_tenants_metadata;
DROP INDEX IF EXISTS idx_offerings_attributes;
```

⚠️ **DİKKAT:** Rollback işlemi veri kaybına neden olabilir. Production'da dikkatli kullanın!

## Production Notları

### RLS (Row Level Security)

Şu anda development policy'leri aktif (tüm erişim açık). Production'a geçerken:

1. Development policy'lerini kaldırın:
```sql
DROP POLICY "Enable all access for dev" ON onboarding_jobs;
DROP POLICY "Enable all access for dev" ON security_logs;
```

2. Tenant-based policy'ler ekleyin:
```sql
-- Örnek: Kullanıcılar sadece kendi tenant'larının verilerini görebilir
CREATE POLICY "Users can view own tenant data" 
ON onboarding_jobs 
FOR SELECT 
USING (tenant_id IN (
  SELECT id FROM tenants WHERE user_id = auth.uid()
));
```

### Performans İzleme

Migration sonrası performansı izleyin:

```sql
-- İndeks kullanımını kontrol et
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan as index_scans,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;

-- Tablo boyutlarını kontrol et
SELECT 
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

## Yardım

Sorun yaşarsanız:
1. Migration dosyasındaki verification query'leri çalıştırın
2. Hata mesajlarını kontrol edin
3. `backend/DATABASE.md` dosyasına bakın
4. Supabase loglarını inceleyin
