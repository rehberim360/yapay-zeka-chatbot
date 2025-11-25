'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { X, Sparkles } from 'lucide-react';
import type { MetaInfoField } from './CustomFieldEditor';

interface CustomFieldModalProps {
  existingField?: MetaInfoField | null;
  existingKeys: string[];
  businessType?: string;
  onSave: (field: MetaInfoField) => void;
  onClose: () => void;
}

// Suggested fields by business type
const SUGGESTED_FIELDS: Record<string, Array<{ key: string; label: string; type: string }>> = {
  BEAUTY: [
    { key: 'garanti_suresi', label: 'Garanti Süresi', type: 'string' },
    { key: 'kullanilan_urun', label: 'Kullanılan Ürün', type: 'string' },
    { key: 'iptal_politikasi', label: 'İptal Politikası', type: 'string' },
    { key: 'randevu_gerekli', label: 'Randevu Gerekli', type: 'boolean' }
  ],
  FOOD: [
    { key: 'teslimat_suresi', label: 'Teslimat Süresi', type: 'string' },
    { key: 'minimum_siparis', label: 'Minimum Sipariş', type: 'number' },
    { key: 'soguk_zincir', label: 'Soğuk Zincir', type: 'boolean' },
    { key: 'alerjenler', label: 'Alerjenler', type: 'string' }
  ],
  HEALTHCARE: [
    { key: 'sigorta_kapsami', label: 'Sigorta Kapsamı', type: 'boolean' },
    { key: 'kontrol_suresi', label: 'Kontrol Süresi', type: 'string' },
    { key: 'uzman_doktor', label: 'Uzman Doktor', type: 'string' },
    { key: 'rapor_suresi', label: 'Rapor Süresi', type: 'string' }
  ],
  SERVICE: [
    { key: 'garanti_suresi', label: 'Garanti Süresi', type: 'string' },
    { key: 'acil_hizmet', label: 'Acil Hizmet', type: 'boolean' },
    { key: 'hizmet_alani', label: 'Hizmet Alanı', type: 'string' },
    { key: 'markalar', label: 'Desteklenen Markalar', type: 'string' }
  ],
  EDUCATION: [
    { key: 'sertifika', label: 'Sertifika', type: 'boolean' },
    { key: 'sinif_mevcudu', label: 'Sınıf Mevcudu', type: 'number' },
    { key: 'online_destek', label: 'Online Destek', type: 'boolean' },
    { key: 'egitmen', label: 'Eğitmen', type: 'string' }
  ]
};

export function CustomFieldModal({
  existingField,
  existingKeys,
  businessType,
  onSave,
  onClose
}: CustomFieldModalProps) {
  const [fieldName, setFieldName] = useState(existingField?.label || '');
  const [fieldKey, setFieldKey] = useState(existingField?.key || '');
  const [fieldValue, setFieldValue] = useState<string | number | boolean>(
    existingField?.value !== undefined ? String(existingField.value) : ''
  );
  const [fieldType, setFieldType] = useState<'string' | 'number' | 'boolean' | 'array'>(
    existingField?.type || 'string'
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuggestions, setShowSuggestions] = useState(!existingField);

  const isEditing = !!existingField;
  const suggestedFields = businessType ? SUGGESTED_FIELDS[businessType] || [] : [];

  // Auto-convert field name to snake_case
  const updateFieldKey = () => {
    if (!isEditing && fieldName) {
      const snakeCase = fieldName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');
      if (snakeCase !== fieldKey) {
        setFieldKey(snakeCase);
      }
    }
  };

  useEffect(() => {
    updateFieldKey();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fieldName, isEditing]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Field name validation
    if (!fieldName.trim()) {
      newErrors.fieldName = 'Özellik adı gerekli';
    }

    // Field key validation
    if (!fieldKey.trim()) {
      newErrors.fieldKey = 'Alan adı gerekli';
    } else if (!/^[a-z0-9_]{1,50}$/.test(fieldKey)) {
      newErrors.fieldKey = 'Alan adı sadece küçük harf, rakam ve alt çizgi içerebilir (max 50 karakter)';
    } else if (!isEditing && existingKeys.includes(fieldKey)) {
      newErrors.fieldKey = 'Bu alan adı zaten mevcut';
    }

    // Field value validation
    if (!fieldValue && fieldValue !== 0 && fieldValue !== false) {
      newErrors.fieldValue = 'Değer gerekli';
    }

    if (fieldType === 'number' && (typeof fieldValue === 'string' && isNaN(Number(fieldValue)))) {
      newErrors.fieldValue = 'Geçerli bir sayı girin';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    let parsedValue = fieldValue;
    if (fieldType === 'number') {
      parsedValue = Number(fieldValue);
    } else if (fieldType === 'boolean') {
      parsedValue = fieldValue === 'true' || fieldValue === true;
    }

    onSave({
      key: fieldKey,
      value: parsedValue,
      type: fieldType,
      label: fieldName,
      added_by: 'user'
    });
  };

  const handleSuggestedFieldClick = (suggested: { key: string; label: string; type: string }) => {
    setFieldName(suggested.label);
    setFieldKey(suggested.key);
    setFieldType(suggested.type as 'string' | 'number' | 'boolean' | 'array');
    setShowSuggestions(false);
  };

  return (
    <>
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
      >
        <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-b flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                {isEditing ? 'Özelliği Düzenle' : 'Yeni Özellik Ekle'}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {isEditing ? 'Özellik değerini güncelleyin' : 'İşletmenize özel bir özellik ekleyin'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/50 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-5 overflow-y-auto max-h-[calc(90vh-200px)]">
            {/* Suggested Fields */}
            {!isEditing && showSuggestions && suggestedFields.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-purple-500" />
                  <p className="text-sm font-semibold text-gray-700">Önerilen Özellikler</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {suggestedFields
                    .filter(s => !existingKeys.includes(s.key))
                    .map((suggested) => (
                      <button
                        key={suggested.key}
                        onClick={() => handleSuggestedFieldClick(suggested)}
                        className="p-3 text-left bg-purple-50 hover:bg-purple-100 border-2 border-purple-200 hover:border-purple-300 rounded-lg transition-all"
                      >
                        <p className="text-sm font-medium text-gray-900">{suggested.label}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{suggested.key}</p>
                      </button>
                    ))}
                </div>
                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs text-gray-500 text-center">veya manuel olarak ekleyin</p>
                </div>
              </div>
            )}

            {/* Field Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Özellik Adı <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={fieldName}
                onChange={(e) => setFieldName(e.target.value)}
                placeholder="Örn: Garanti Süresi"
                disabled={isEditing}
                className={`w-full px-4 py-3 border-2 rounded-lg outline-none transition-all ${
                  errors.fieldName
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-200 focus:border-blue-400 bg-white'
                } ${isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
              />
              {errors.fieldName && (
                <p className="mt-1 text-sm text-red-600">{errors.fieldName}</p>
              )}
            </div>

            {/* Field Key (Auto-generated) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Alan Adı (Otomatik) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={fieldKey}
                readOnly
                disabled={isEditing}
                className={`w-full px-4 py-3 border-2 rounded-lg bg-gray-50 text-gray-600 font-mono text-sm ${
                  errors.fieldKey ? 'border-red-300' : 'border-gray-200'
                } ${isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
              />
              {errors.fieldKey && (
                <p className="mt-1 text-sm text-red-600">{errors.fieldKey}</p>
              )}
              {!errors.fieldKey && fieldKey && (
                <p className="mt-1 text-xs text-gray-500">
                  Veritabanında bu isimle saklanacak
                </p>
              )}
            </div>

            {/* Field Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Veri Tipi <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-4 gap-2">
                {([
                  { value: 'string', label: 'Metin', icon: '📝' },
                  { value: 'number', label: 'Sayı', icon: '🔢' },
                  { value: 'boolean', label: 'Evet/Hayır', icon: '✓' },
                  { value: 'array', label: 'Liste', icon: '📋' }
                ] as const).map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setFieldType(type.value as 'string' | 'number' | 'boolean' | 'array')}
                    disabled={isEditing}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      fieldType === type.value
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'bg-white border-gray-200 hover:border-gray-300 text-gray-700'
                    } ${isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="text-2xl mb-1">{type.icon}</div>
                    <div className="text-xs font-medium">{type.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Field Value */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Değer <span className="text-red-500">*</span>
              </label>
              {fieldType === 'boolean' ? (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setFieldValue('true')}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      fieldValue === 'true' || fieldValue === true
                        ? 'bg-green-50 border-green-500 text-green-700'
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    ✓ Evet
                  </button>
                  <button
                    onClick={() => setFieldValue('false')}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      fieldValue === 'false' || fieldValue === false
                        ? 'bg-red-50 border-red-500 text-red-700'
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    ✗ Hayır
                  </button>
                </div>
              ) : (
                <input
                  type={fieldType === 'number' ? 'number' : 'text'}
                  value={String(fieldValue || '')}
                  onChange={(e) => setFieldValue(e.target.value)}
                  placeholder={
                    fieldType === 'number'
                      ? 'Örn: 30'
                      : fieldType === 'array'
                      ? 'Virgülle ayırın: Gluten, Süt, Yumurta'
                      : 'Örn: 6 ay'
                  }
                  className={`w-full px-4 py-3 border-2 rounded-lg outline-none transition-all ${
                    errors.fieldValue
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-200 focus:border-blue-400 bg-white'
                  }`}
                />
              )}
              {errors.fieldValue && (
                <p className="mt-1 text-sm text-red-600">{errors.fieldValue}</p>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 bg-gray-50 border-t flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-white hover:bg-gray-100 border-2 border-gray-200 rounded-lg font-semibold text-gray-700 transition-colors"
            >
              İptal
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-lg font-semibold text-white transition-colors shadow-lg"
            >
              {isEditing ? 'Güncelle' : 'Ekle'}
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}
