# 🚀 Vercel Deployment Guide

## Ön Hazırlık

Alan adınız: **www.yapayzekachatbot.com**

---

## Adım 1: Vercel'e Giriş Yap

1. https://vercel.com adresine git
2. GitHub hesabınla giriş yap
3. Dashboard'a ulaş

---

## Adım 2: Yeni Proje Oluştur

1. **"Add New..."** → **"Project"** tıkla
2. **"Import Git Repository"** seç
3. GitHub'dan **"yapay-zeka-chatbot"** repo'sunu seç
4. **"Import"** tıkla

---

## Adım 3: Proje Ayarları

### Framework Preset
```
Framework: Next.js
```

### Root Directory
⚠️ **ÖNEMLİ:** Eğer dropdown'da "frontend" görünmüyorsa:

**Yöntem A (Önerilen):**
1. "Edit" butonuna tıkla
2. Manuel olarak yaz: `frontend`
3. Enter'a bas

**Yöntem B (Alternatif):**
1. Dropdown'ı boş bırak (root olarak `.` seçili kalacak)
2. Aşağıdaki ayarları yap:
   - Build Command: `cd frontend && npm run build`
   - Output Directory: `frontend/.next`
   - Install Command: `cd frontend && npm install`

### Build Settings
```
Build Command: npm run build
Output Directory: .next
Install Command: npm install
```

### Environment Variables
Şimdilik boş bırak (backend'i daha sonra bağlayacağız)

---

## Adım 4: Deploy Et

1. **"Deploy"** butonuna tıkla
2. Build sürecini izle (2-3 dakika)
3. Deploy tamamlandığında Vercel URL'i alacaksın:
   ```
   https://yapay-zeka-chatbot-xxx.vercel.app
   ```

---

## Adım 5: Custom Domain Ekle

### 5.1 Vercel'de Domain Ayarları

1. Proje dashboard'unda **"Settings"** → **"Domains"** git
2. **"Add Domain"** tıkla
3. Domain'i gir:
   ```
   www.yapayzekachatbot.com
   ```
4. **"Add"** tıkla

### 5.2 DNS Ayarları (Domain Sağlayıcında)

Vercel sana DNS kayıtlarını gösterecek. Domain sağlayıcında (GoDaddy, Namecheap, vs.) şu kayıtları ekle:

#### A Record (Root Domain için)
```
Type: A
Name: @
Value: 76.76.21.21
TTL: 3600
```

#### CNAME Record (www için)
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600
```

### 5.3 SSL Sertifikası

Vercel otomatik olarak SSL sertifikası oluşturacak (Let's Encrypt)
- 5-10 dakika içinde aktif olur
- HTTPS otomatik çalışır

---

## Adım 6: Test Et

1. https://www.yapayzekachatbot.com adresini aç
2. Pop-up'ın açıldığını kontrol et
3. Geri sayımın çalıştığını doğrula
4. GitHub linkinin doğru olduğunu test et

---

## Adım 7: Production Optimizasyonları

### 7.1 Vercel Analytics Aktif Et
```
Settings → Analytics → Enable
```

### 7.2 Speed Insights Aktif Et
```
Settings → Speed Insights → Enable
```

### 7.3 Automatic Deployments
```
Settings → Git → Enable Automatic Deployments
```
Her push'ta otomatik deploy olacak!

---

## Sorun Giderme

### Build Hatası Alırsam?

1. Local'de build test et:
   ```bash
   cd frontend
   npm run build
   ```

2. Hata varsa düzelt ve push et:
   ```bash
   git add .
   git commit -m "fix: Build error"
   git push
   ```

### Domain Bağlanmıyorsa?

1. DNS propagation bekle (24 saate kadar sürebilir)
2. DNS kontrolü: https://dnschecker.org
3. Vercel'de domain status'ü kontrol et

### Pop-up Açılmıyorsa?

1. Browser console'u aç (F12)
2. Hata var mı kontrol et
3. Local'de test et:
   ```bash
   cd frontend
   npm run dev
   ```

---

## Backend'i Bağlama (İleride)

Backend'i deploy ettiğinde:

1. Backend URL'ini al (örn: https://api.yapayzekachatbot.com)
2. Vercel'de Environment Variables ekle:
   ```
   NEXT_PUBLIC_API_URL=https://api.yapayzekachatbot.com
   ```
3. Redeploy et

---

## Hızlı Komutlar

```bash
# Local test
cd frontend
npm run dev

# Build test
npm run build

# Deploy (otomatik)
git push origin main
```

---

## Faydalı Linkler

- Vercel Dashboard: https://vercel.com/dashboard
- Vercel Docs: https://vercel.com/docs
- Next.js Deployment: https://nextjs.org/docs/deployment
- DNS Checker: https://dnschecker.org

---

## ✅ Checklist

- [ ] Vercel'e giriş yaptım
- [ ] Projeyi import ettim
- [ ] Root directory'yi "frontend" olarak ayarladım
- [ ] İlk deploy'u yaptım
- [ ] Custom domain ekledim
- [ ] DNS kayıtlarını güncelledim
- [ ] SSL sertifikası aktif oldu
- [ ] Site açılıyor ve çalışıyor
- [ ] Pop-up test edildi
- [ ] Analytics aktif edildi

---

**Başarılar! 🎉**
