'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { Check, X, Edit2, Trash2, ArrowRight } from 'lucide-react';
import type { Offering } from '@/types/onboarding';

interface OfferingsReviewCardProps {
    offerings: Offering[];
    onComplete: (selectedOfferings: Offering[]) => void;
}

export function OfferingsReviewCard({ offerings, onComplete }: OfferingsReviewCardProps) {
    const [selectedIds, setSelectedIds] = useState<number[]>(offerings.map((_, idx) => idx));
    const [editingId, setEditingId] = useState<number | null>(null);
    const [updatedOfferings, setUpdatedOfferings] = useState<Offering[]>(offerings);
    const [editForm, setEditForm] = useState<Offering | null>(null);

    const toggleOffering = (idx: number) => {
        setSelectedIds(prev =>
            prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
        );
    };

    const startEdit = (idx: number) => {
        setEditingId(idx);
        setEditForm({ ...updatedOfferings[idx] });
    };

    const saveEdit = () => {
        if (editingId !== null && editForm) {
            const updated = [...updatedOfferings];
            updated[editingId] = editForm;
            setUpdatedOfferings(updated);
            setEditingId(null);
            setEditForm(null);
        }
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditForm(null);
    };

    const deleteOffering = (idx: number) => {
        const updated = updatedOfferings.filter((_, i) => i !== idx);
        setUpdatedOfferings(updated);
        setSelectedIds(prev => prev.filter(i => i !== idx).map(i => i > idx ? i - 1 : i));
        if (editingId === idx) {
            setEditingId(null);
            setEditForm(null);
        }
    };

    const handleComplete = () => {
        const selected = updatedOfferings.filter((_, idx) => selectedIds.includes(idx));
        onComplete(selected);
    };

    return (
        <div className="w-full h-[calc(100vh-180px)] flex items-center justify-center">
            <div className="w-full max-w-7xl h-full">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-2xl border-t-4 border-t-indigo-500 h-full flex flex-col"
                >
                    {/* Header */}
                    <div className="p-6 border-b bg-gradient-to-br from-indigo-50 to-purple-50">
                        <h2 className="text-2xl font-bold text-gray-900">Hizmet/Ürün Seçimi</h2>
                        <p className="text-sm text-gray-600 mt-1">
                            {selectedIds.length} / {updatedOfferings.length} hizmet seçildi
                        </p>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-hidden p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 h-full overflow-y-auto">
                            {updatedOfferings.map((offering, idx) => (
                                <OfferingItem
                                    key={idx}
                                    offering={offering}
                                    index={idx}
                                    isSelected={selectedIds.includes(idx)}
                                    isEditing={editingId === idx}
                                    editForm={editForm}
                                    onToggle={() => toggleOffering(idx)}
                                    onEdit={() => startEdit(idx)}
                                    onDelete={() => deleteOffering(idx)}
                                    onSave={saveEdit}
                                    onCancel={cancelEdit}
                                    onFormChange={setEditForm}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t bg-gray-50 flex justify-between items-center">
                        <p className="text-sm text-gray-600">
                            En az 1 hizmet seçmelisiniz
                        </p>
                        <button
                            onClick={handleComplete}
                            disabled={selectedIds.length === 0}
                            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white px-8 py-3 rounded-lg font-medium transition-all flex items-center gap-2"
                        >
                            Devam Et <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

interface OfferingItemProps {
    offering: Offering;
    index: number;
    isSelected: boolean;
    isEditing: boolean;
    editForm: Offering | null;
    onToggle: () => void;
    onEdit: () => void;
    onDelete: () => void;
    onSave: () => void;
    onCancel: () => void;
    onFormChange: (form: Offering) => void;
}

function OfferingItem({
    offering,
    index,
    isSelected,
    isEditing,
    editForm,
    onToggle,
    onEdit,
    onDelete,
    onSave,
    onCancel,
    onFormChange
}: OfferingItemProps) {
    if (isEditing && editForm) {
        return (
            <motion.div
                layout
                className="bg-white border-2 border-indigo-500 rounded-xl p-4 shadow-lg"
            >
                <div className="space-y-3">
                    <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => onFormChange({ ...editForm, name: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg text-sm font-medium"
                        placeholder="Hizmet adı"
                    />
                    <textarea
                        value={editForm.description || ''}
                        onChange={(e) => onFormChange({ ...editForm, description: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg text-sm resize-none"
                        rows={3}
                        placeholder="Açıklama"
                    />
                    <div className="grid grid-cols-2 gap-2">
                        <input
                            type="number"
                            value={editForm.price || ''}
                            onChange={(e) => onFormChange({ ...editForm, price: parseFloat(e.target.value) || undefined })}
                            className="px-3 py-2 border rounded-lg text-sm"
                            placeholder="Fiyat"
                        />
                        <input
                            type="text"
                            value={editForm.currency || 'TRY'}
                            onChange={(e) => onFormChange({ ...editForm, currency: e.target.value })}
                            className="px-3 py-2 border rounded-lg text-sm"
                            placeholder="Para birimi"
                        />
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={onSave}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1"
                        >
                            <Check className="w-4 h-4" /> Kaydet
                        </button>
                        <button
                            onClick={onCancel}
                            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1"
                        >
                            <X className="w-4 h-4" /> İptal
                        </button>
                    </div>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            layout
            className={`bg-white border-2 rounded-xl p-4 cursor-pointer transition-all ${
                isSelected
                    ? 'border-indigo-500 shadow-md'
                    : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={onToggle}
        >
            <div className="flex items-start gap-3">
                <div
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        isSelected
                            ? 'bg-indigo-600 border-indigo-600'
                            : 'border-gray-300'
                    }`}
                >
                    {isSelected && <Check className="w-3 h-3 text-white" />}
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-sm mb-1 truncate">
                        {offering.name}
                    </h3>
                    {offering.description && (
                        <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                            {offering.description}
                        </p>
                    )}
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        {offering.price && (
                            <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded">
                                {offering.price} {offering.currency || 'TRY'}
                            </span>
                        )}
                        <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                            {offering.type === 'SERVICE' ? 'Hizmet' : 'Ürün'}
                        </span>
                    </div>
                </div>
            </div>
            <div className="flex gap-2 mt-3 pt-3 border-t" onClick={(e) => e.stopPropagation()}>
                <button
                    onClick={onEdit}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1"
                >
                    <Edit2 className="w-3 h-3" /> Düzenle
                </button>
                <button
                    onClick={onDelete}
                    className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1"
                >
                    <Trash2 className="w-3 h-3" /> Sil
                </button>
            </div>
        </motion.div>
    );
}
