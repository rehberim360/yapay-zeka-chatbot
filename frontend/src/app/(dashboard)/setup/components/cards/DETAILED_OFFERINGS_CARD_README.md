# DetailedOfferingsReviewCard

## 📋 Genel Bakış

Yeni onboarding akışında kullanılan, detaylı hizmet/ürün bilgilerini gözden geçirme ve özelleştirme kartı.

**State:** `REVIEW_DETAILED_OFFERINGS`  
**Phase:** `OFFERING_PAGES_SCRAPING` → `OFFERING_DETAIL_REVIEW`

---

## 🎯 Amaç

Kullanıcı, hizmet/ürün sayfalarından taranan detaylı bilgileri:
1. Tek tek gözden geçirir
2. Düzenler (isim, açıklama, fiyat, süre vs.)
3. **Özel özellikler ekler** (Custom Field Management)
4. Onaylar

---

## ✨ Özellikler

### 1. Tek Tek Gözden Geçirme (Carousel)
- Her hizmet/ürün ayrı bir kart olarak gösterilir
- "Önceki" / "Sonraki" butonları ile gezinme
- İlerleme göstergesi (1/12, 2/12 vs.)

### 2. Temel Bilgiler Düzenleme
- **İsim**: Hizmet/ürün adı
- **Açıklama**: Detaylı açıklama
- **Fiyat**: Fiyat ve para birimi (TRY, USD, EUR)
- **Süre**: Dakika cinsinden süre
- **Kategori**: Hizmet kategorisi
- **Tip**: Hizmet veya Ürün

### 3. Özel Özellikler (Custom Fields)
- "Özel Özellikler" butonuna tıklandığında `CustomFieldEditor` açılır
- AI tarafından bulunan özellikler gösterilir (mor badge)
- Kullanıcı manuel özellik ekleyebilir (mavi badge)
- Sektöre özel öneriler sunulur

### 4. Silme
- İstenmeyen hizmetler silinebilir
- Silinen hizmet listeden çıkar
- Tüm hizmetler silinirse direkt devam edilir

### 5. Onaylama
- Son hizmette "Tümünü Onayla" butonu görünür
- Onaylanan hizmetler backend'e gönderilir
- `OTHER_PAGES_SCRAPING` phase'i başlar

---

## 🔄 Akış

```
OFFERING_PAGES_SCRAPING (Backend hizmet sayfalarını tarıyor)
    ↓
REVIEW_DETAILED_OFFERINGS (Kullanıcı detaylı hizmetleri gözden geçiriyor)
    ↓
    [Hizmet 1/12]
    - Temel bilgileri düzenle
    - Özel özellikler ekle
    - Sonraki →
    ↓
    [Hizmet 2/12]
    - ...
    ↓
    [Hizmet 12/12]
    - Tümünü Onayla
    ↓
OTHER_PAGES_SCRAPING (Backend diğer sayfaları tarıyor)
```

---

## 📦 Props

```typescript
interface DetailedOfferingsReviewCardProps {
    offerings: Offering[];           // Taranan detaylı hizmetler
    businessType?: string;            // Sektör (BEAUTY, FOOD, etc.)
    onComplete: (reviewedOfferings: Offering[]) => void;  // Onay callback
}
```

---

## 🎨 UI Bileşenleri

### Header
- Başlık: "Detaylı Hizmet Bilgileri"
- İlerleme: "1 / 12 - Bilgileri kontrol edin ve özelleştirin"
- "Özel Özellikler" toggle butonu

### Content (2 Mod)

#### Mod 1: Temel Bilgiler
- İsim input
- Açıklama textarea
- Fiyat & Para birimi (grid)
- Süre & Kategori (grid)
- Tip (radio buttons)

#### Mod 2: Özel Özellikler
- `CustomFieldEditor` component
- AI bulunan özellikler
- Manuel eklenen özellikler
- "Özellik Ekle" butonu

### Footer
- Sol: "Önceki" / "Sonraki" butonları
- Sağ: "Sil" butonu + "Tümünü Onayla" (son hizmette)

---

## 🔧 Kullanım

```tsx
import { DetailedOfferingsReviewCard } from './cards/DetailedOfferingsReviewCard';

function SetupPage() {
  const [scrapedData, setScrapedData] = useState<ScrapedData | null>(null);
  const [homeData, setHomeData] = useState<HomeData | null>(null);

  const handleDetailedOfferingsApprove = async (reviewedOfferings: Offering[]) => {
    // Backend'e gönder
    await fetch(`${API_BASE_URL}/api/onboarding/approve-offerings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        jobId, 
        reviewedOfferings
      })
    });

    // Sonraki state'e geç
    setState('PROCESSING_OTHER');
  };

  return (
    <DetailedOfferingsReviewCard
      offerings={scrapedData.offerings}
      businessType={homeData.company_info.sector}
      onComplete={handleDetailedOfferingsApprove}
    />
  );
}
```

---

## 🎯 Custom Field Management Entegrasyonu

### Nasıl Çalışır?

1. Kullanıcı "Özel Özellikler" butonuna tıklar
2. `showCustomFields` state true olur
3. `CustomFieldEditor` component render edilir
4. Kullanıcı özellik ekler/düzenler/siler
5. `handleMetaInfoUpdate` ile `meta_info` güncellenir
6. Güncellenmiş hizmet `reviewedOfferings` array'ine kaydedilir

### Örnek Meta Info

```json
{
  "duration": "30 dk",
  "includes": ["Yıkama", "Fön"],
  "garanti_suresi": "6 ay",
  "kullanilan_urun": "Loreal Professional",
  "_custom_fields": [
    {
      "key": "duration",
      "label": "Süre",
      "type": "string",
      "added_by": "ai",
      "added_at": "2025-11-23T10:00:00Z"
    },
    {
      "key": "garanti_suresi",
      "label": "Garanti Süresi",
      "type": "string",
      "added_by": "user",
      "added_at": "2025-11-23T11:00:00Z"
    }
  ]
}
```

---

## 🚀 Avantajlar

### Kullanıcı Deneyimi
- ✅ Tek tek gözden geçirme (overwhelming değil)
- ✅ Her hizmet için özel özellikler ekleyebilme
- ✅ Gereksiz hizmetleri kolayca silme
- ✅ İlerleme göstergesi (motivasyon)

### Teknik
- ✅ Custom Field Management tam entegre
- ✅ AnimatePresence ile smooth geçişler
- ✅ Local state management (performans)
- ✅ Type-safe (TypeScript)

---

## 📊 Karşılaştırma

### Eski `OfferingsReviewCard`
- Tüm hizmetler grid'de gösterilir
- Checkbox ile seçim
- Basit düzenleme (modal)
- Custom field yok

### Yeni `DetailedOfferingsReviewCard`
- Tek tek carousel
- Her hizmet için detaylı düzenleme
- Custom Field Management entegre
- Daha fazla kontrol

---

## 🧪 Test Senaryosu

1. Hizmet sayfaları tarandı (8 hizmet bulundu)
2. `REVIEW_DETAILED_OFFERINGS` state'ine geçildi
3. Kullanıcı 1. hizmeti görüyor:
   - İsim: "Saç Kesimi"
   - Fiyat: 500 TRY
   - Süre: 30 dk
4. "Özel Özellikler" butonuna tıklıyor
5. AI bulunan özellikler görünüyor:
   - duration: "30 dk"
   - includes: ["Yıkama", "Fön"]
6. "Özellik Ekle" butonuna tıklıyor
7. "Garanti Süresi" ekliyor: "6 ay"
8. "Sonraki" butonuna tıklıyor
9. 2. hizmeti görüyor...
10. Son hizmette "Tümünü Onayla" butonuna tıklıyor
11. Backend'e 8 hizmet gönderiliyor
12. `PROCESSING_OTHER` state'ine geçiliyor

---

## 📝 Notlar

- Backend API hazır: `POST /api/onboarding/approve-offerings`
- Custom Field Management sistemi tamamen entegre
- AnimatePresence ile smooth geçişler
- Responsive design (mobile-friendly)
- Production-ready ✅

---

## 🔮 Gelecek İyileştirmeler

1. **Toplu Düzenleme**: Birden fazla hizmete aynı özelliği ekleme
2. **Şablon Kaydetme**: Sık kullanılan özellik setlerini kaydetme
3. **Önizleme**: Chatbot'ta nasıl görüneceğini önizleme
4. **Sıralama**: Hizmetleri drag & drop ile sıralama
5. **Filtreleme**: Kategoriye göre filtreleme
