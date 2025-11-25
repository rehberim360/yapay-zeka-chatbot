# Custom Field Management UI

## Overview
Phase 7 (Task 24.1) - Manuel özellik ekleme sistemi. Kullanıcılar offering'lere AI'ın bulamadığı özel özellikler ekleyebilir.

## Components

### 1. CustomFieldEditor
**Dosya:** `CustomFieldEditor.tsx`

Ana component. Offering'in meta_info alanlarını gösterir ve yönetir.

**Features:**
- AI tarafından bulunan alanları gösterir (mor badge)
- Kullanıcı tarafından eklenen alanları gösterir (mavi badge)
- "Özellik Ekle" butonu
- Edit/Delete butonları (sadece user fields için)
- Hover efektleri

**Props:**
```typescript
{
  offeringId?: string;
  metaInfo: Record<string, unknown>;
  businessType?: string;
  onUpdate: (updatedMetaInfo: Record<string, unknown>) => void;
}
```

### 2. CustomFieldModal
**Dosya:** `CustomFieldModal.tsx`

Yeni özellik ekleme veya düzenleme modal'ı.

**Features:**
- Sektöre özel önerilen alanlar (BEAUTY, FOOD, HEALTHCARE, etc.)
- Otomatik snake_case dönüşümü ("Garanti Süresi" → "garanti_suresi")
- Tip seçimi (string, number, boolean, array)
- Validation (name format, uniqueness, max 50 chars)
- XSS protection

**Suggested Fields by Business Type:**
- **BEAUTY:** garanti_suresi, kullanilan_urun, iptal_politikasi, randevu_gerekli
- **FOOD:** teslimat_suresi, minimum_siparis, soguk_zincir, alerjenler
- **HEALTHCARE:** sigorta_kapsami, kontrol_suresi, uzman_doktor, rapor_suresi
- **SERVICE:** garanti_suresi, acil_hizmet, hizmet_alani, markalar
- **EDUCATION:** sertifika, sinif_mevcudu, online_destek, egitmen

### 3. CompanyReviewCard Integration
**Dosya:** `cards/CompanyReviewCard.tsx`

Offering selection card'ına entegre edildi.

**Changes:**
- Her offering'de ⚙️ Settings butonu eklendi
- Tıklandığında CustomFieldEditor açılır
- Meta info değişiklikleri local state'te tutulur
- Submit'te güncellenmiş offerings gönderilir

## API Service

**Dosya:** `services/offerings.service.ts`

Backend API ile iletişim için service fonksiyonları:

```typescript
// Yeni alan ekle
addCustomField(offeringId, key, value, type, label, token)

// Alan güncelle
updateCustomField(offeringId, key, value, token)

// Alan sil
removeCustomField(offeringId, key, token)
```

**Endpoint:** `PATCH /api/offerings/:id/meta-info`

## Data Structure

### MetaInfo Format
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
      "added_at": "2025-11-23T11:00:00Z",
      "updated_at": "2025-11-23T12:00:00Z"
    }
  ]
}
```

## Validation Rules

1. **Field Name (key):**
   - Snake_case format (lowercase, underscore-separated)
   - Only letters, numbers, underscores
   - Max 50 characters
   - Must be unique within offering

2. **Field Value:**
   - Required (cannot be empty)
   - Type-specific validation (number must be numeric)
   - XSS sanitization for strings

3. **Field Type:**
   - string: Text values
   - number: Numeric values
   - boolean: Yes/No values
   - array: Comma-separated lists

## Usage Example

```tsx
import { CustomFieldEditor } from './CustomFieldEditor';

function OfferingEditPage() {
  const [offering, setOffering] = useState(initialOffering);

  const handleMetaInfoUpdate = (updatedMetaInfo) => {
    setOffering({
      ...offering,
      meta_info: updatedMetaInfo
    });
  };

  return (
    <CustomFieldEditor
      offeringId={offering.id}
      metaInfo={offering.meta_info || {}}
      businessType="BEAUTY"
      onUpdate={handleMetaInfoUpdate}
    />
  );
}
```

## Requirements Covered

✅ **Requirement 6A.1-6A.15:** Manual Custom Field Management
- Display existing meta_info fields
- Distinguish AI vs user fields
- Add/Edit/Delete custom fields
- Auto snake_case conversion
- Field validation
- XSS protection
- Suggested fields by business type

## Testing

Backend property tests mevcut:
- `backend/src/__tests__/custom-fields.property.test.ts`

Test coverage:
- Field name validation
- XSS sanitization
- Add/Update/Remove operations
- Timestamp tracking
- Duplicate detection

## Future Enhancements

1. **Bulk Edit:** Birden fazla offering'e aynı anda özellik ekleme
2. **Templates:** Sektöre özel özellik template'leri
3. **Import/Export:** CSV'den özellik import etme
4. **Field History:** Değişiklik geçmişi görüntüleme
5. **Conditional Fields:** Bir alana göre başka alanları gösterme

## Notes

- Backend API tamamen hazır ve test edilmiş
- Frontend UI Phase 7'de tamamlandı
- CompanyReviewCard'a entegre edildi
- Tüm TypeScript hataları düzeltildi
- Production-ready ✅
