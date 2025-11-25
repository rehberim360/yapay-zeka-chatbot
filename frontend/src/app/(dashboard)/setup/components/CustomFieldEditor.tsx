'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Plus, Edit2, Trash2, Sparkles, User } from 'lucide-react';
import { CustomFieldModal } from './CustomFieldModal';

export interface MetaInfoField {
  key: string;
  value: unknown;
  type: 'string' | 'number' | 'boolean' | 'array';
  label?: string;
  added_by?: 'ai' | 'user';
  added_at?: string;
  updated_at?: string;
}

interface CustomFieldEditorProps {
  offeringId?: string;
  metaInfo: Record<string, unknown>;
  businessType?: string;
  onUpdate: (updatedMetaInfo: Record<string, unknown>) => void;
}

export function CustomFieldEditor({
  metaInfo,
  businessType,
  onUpdate
}: CustomFieldEditorProps) {
  const [showModal, setShowModal] = useState(false);
  const [editingField, setEditingField] = useState<MetaInfoField | null>(null);

  // Parse meta_info fields
  const customFields = (metaInfo?._custom_fields as MetaInfoField[]) || [];
  const fields: MetaInfoField[] = Object.entries(metaInfo || {})
    .filter(([key]) => key !== '_custom_fields')
    .map(([key, value]) => {
      const metadata = customFields.find((f) => f.key === key);
      return {
        key,
        value,
        type: (metadata?.type || typeof value) as 'string' | 'number' | 'boolean' | 'array',
        label: metadata?.label || formatLabel(key),
        added_by: metadata?.added_by || 'ai',
        added_at: metadata?.added_at,
        updated_at: metadata?.updated_at
      };
    });

  const aiFields = fields.filter(f => f.added_by === 'ai');
  const userFields = fields.filter(f => f.added_by === 'user');

  const handleAddField = (field: MetaInfoField) => {
    const existingFields = (metaInfo._custom_fields as MetaInfoField[]) || [];
    const updatedMetaInfo = {
      ...metaInfo,
      [field.key]: field.value,
      _custom_fields: [
        ...existingFields,
        {
          key: field.key,
          label: field.label,
          type: field.type,
          added_by: 'user' as const,
          added_at: new Date().toISOString()
        }
      ]
    };
    onUpdate(updatedMetaInfo);
    setShowModal(false);
  };

  const handleEditField = (field: MetaInfoField) => {
    const updatedMetaInfo = {
      ...metaInfo,
      [field.key]: field.value,
      _custom_fields: ((metaInfo._custom_fields as MetaInfoField[]) || []).map((f) =>
        f.key === field.key
          ? { ...f, updated_at: new Date().toISOString() }
          : f
      )
    };
    onUpdate(updatedMetaInfo);
    setEditingField(null);
  };

  const handleDeleteField = (key: string) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { [key]: _removed, ...remainingMetaInfo } = metaInfo;
    const updatedMetaInfo = {
      ...remainingMetaInfo,
      _custom_fields: ((metaInfo._custom_fields as MetaInfoField[]) || []).filter((f) => f.key !== key)
    };
    onUpdate(updatedMetaInfo);
  };

  return (
    <div className="space-y-4">
      {/* AI-Discovered Fields */}
      {aiFields.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-purple-500" />
            <h4 className="text-sm font-semibold text-gray-700">AI Tarafından Bulunan Özellikler</h4>
            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
              {aiFields.length}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {aiFields.map((field) => (
              <FieldBadge
                key={field.key}
                field={field}
                variant="ai"
                readOnly
              />
            ))}
          </div>
        </div>
      )}

      {/* User-Added Fields */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-blue-500" />
            <h4 className="text-sm font-semibold text-gray-700">Manuel Eklenen Özellikler</h4>
            {userFields.length > 0 && (
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                {userFields.length}
              </span>
            )}
          </div>
          <button
            onClick={() => {
              setEditingField(null);
              setShowModal(true);
            }}
            className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium rounded-lg transition-colors"
          >
            <Plus className="w-3 h-3" />
            Özellik Ekle
          </button>
        </div>

        {userFields.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
            <p className="text-sm text-gray-500 mb-2">Henüz manuel özellik eklenmemiş</p>
            <p className="text-xs text-gray-400">
              İşletmenize özel detayları ekleyebilirsiniz
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {userFields.map((field) => (
              <FieldBadge
                key={field.key}
                field={field}
                variant="user"
                onEdit={() => {
                  setEditingField(field);
                  setShowModal(true);
                }}
                onDelete={() => handleDeleteField(field.key)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Custom Field Modal */}
      <AnimatePresence>
        {showModal && (
          <CustomFieldModal
            existingField={editingField}
            existingKeys={fields.map(f => f.key)}
            businessType={businessType}
            onSave={editingField ? handleEditField : handleAddField}
            onClose={() => {
              setShowModal(false);
              setEditingField(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Field Badge Component
function FieldBadge({
  field,
  variant,
  readOnly = false,
  onEdit,
  onDelete
}: {
  field: MetaInfoField;
  variant: 'ai' | 'user';
  readOnly?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  const [showActions, setShowActions] = useState(false);

  return (
    <motion.div
      className={`relative p-3 rounded-lg border-2 transition-all ${
        variant === 'ai'
          ? 'bg-purple-50 border-purple-200'
          : 'bg-blue-50 border-blue-200 hover:border-blue-300'
      }`}
      onMouseEnter={() => !readOnly && setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      {/* Badge Icon */}
      <div className="absolute -top-2 -right-2">
        {variant === 'ai' ? (
          <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-white" />
          </div>
        ) : (
          <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
            <User className="w-3 h-3 text-white" />
          </div>
        )}
      </div>

      {/* Field Content */}
      <div className="pr-6">
        <p className="text-xs font-semibold text-gray-600 mb-1">{field.label}</p>
        <p className="text-sm text-gray-900 font-medium truncate">
          {formatValue(field.value, field.type)}
        </p>
      </div>

      {/* Actions (User fields only) */}
      <AnimatePresence>
        {!readOnly && showActions && (
          <motion.div
            className="absolute top-2 right-2 flex gap-1"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <button
              onClick={onEdit}
              className="p-1 bg-white hover:bg-blue-100 rounded border border-blue-200 transition-colors"
            >
              <Edit2 className="w-3 h-3 text-blue-600" />
            </button>
            <button
              onClick={onDelete}
              className="p-1 bg-white hover:bg-red-100 rounded border border-red-200 transition-colors"
            >
              <Trash2 className="w-3 h-3 text-red-600" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Helper Functions
function formatLabel(key: string): string {
  return key
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function formatValue(value: unknown, type: string): string {
  if (value === null || value === undefined) return '-';
  
  switch (type) {
    case 'boolean':
      return value ? 'Evet' : 'Hayır';
    case 'array':
      return Array.isArray(value) ? value.join(', ') : String(value);
    default:
      return String(value);
  }
}
