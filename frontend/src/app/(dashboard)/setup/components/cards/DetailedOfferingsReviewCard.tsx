'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Settings, ArrowRight } from 'lucide-react';
import type { Offering } from '@/types/onboarding';
import { CustomFieldEditor } from '../CustomFieldEditor';

interface DetailedOfferingsReviewCardProps {
    offerings: Offering[];
    businessType?: string;
    botPurpose?: string; // APPOINTMENT, RESERVATION, BOOKING, ORDER, LEAD, INFO
    onComplete: (reviewedOfferings: Offering[]) => void;
}

export function DetailedOfferingsReviewCard({ 
    offerings, 
    businessType,
    botPurpose,
    onComplete 
}: DetailedOfferingsReviewCardProps) {
    // Süre alanı sadece APPOINTMENT için gösterilsin
    const showDuration = botPurpose === 'APPOINTMENT';
    const [currentIndex, setCurrentIndex] = useState(0);
    const [reviewedOfferings, setReviewedOfferings] = useState<Offering[]>(offerings);
    const [showCustomFields, setShowCustomFields] = useState(false);

    const currentOffering = reviewedOfferings[currentIndex];
    const isFirst = currentIndex === 0;
    const isLast = currentIndex === reviewedOfferings.length - 1;

    const handleNext = () => {
        if (!isLast) {
            setCurrentIndex(currentIndex + 1);
            setShowCustomFields(false);
        }
    };

    const handlePrevious = () => {
        if (!isFirst) {
            setCurrentIndex(currentIndex - 1);
            setShowCustomFields(false);
        }
    };

    const handleUpdate = (field: keyof Offering, value: unknown) => {
        const updated = [...reviewedOfferings];
        updated[currentIndex] = {
            ...updated[currentIndex],
            [field]: value
        };
        setReviewedOfferings(updated);
    };

    const handleMetaInfoUpdate = (updatedMetaInfo: Record<string, unknown>) => {
        const updated = [...reviewedOfferings];
        updated[currentIndex] = {
            ...updated[currentIndex],
            meta_info: updatedMetaInfo
        };
        setReviewedOfferings(updated);
    };

    const handleDelete = () => {
        const updated = reviewedOfferings.filter((_, idx) => idx !== currentIndex);
        setReviewedOfferings(updated);
        
        if (updated.length === 0) {
            onComplete([]);
        } else if (currentIndex >= updated.length) {
            setCurrentIndex(updated.length - 1);
        }
    };

    const handleComplete = () => {
        onComplete(reviewedOfferings);
    };

    if (reviewedOfferings.length === 0) {
        return (
            <div className="w-full h-[calc(100vh-180px)] flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600 mb-4">Tüm hizmetler silindi</p>
                    <button
                        onClick={() => onComplete([])}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg"
                    >
                        Devam Et
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-[calc(100vh-180px)] flex items-center justify-center">
            <div className="w-full max-w-4xl h-full">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-2xl border-t-4 border-t-indigo-500 h-full flex flex-col"
                >
                    {/* Header */}
                    <div className="p-6 border-b bg-gradient-to-br from-indigo-50 to-purple-50">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Detaylı Hizmet Bilgileri</h2>
                            <p className="text-sm text-gray-600 mt-1">
                                {currentIndex + 1} / {reviewedOfferings.length} - Bilgileri kontrol edin ve özelleştirin
                            </p>
                        </div>
                    </div>

                    {/* Content - Tek Kart, Tüm Bilgiler */}
                    <div className="flex-1 overflow-y-auto p-6">
                        <div className="space-y-6">
                            {/* Temel Bilgiler */}
                            <div className="space-y-4">
                                {/* Name */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Hizmet/Ürün Adı *
                                    </label>
                                    <input
                                        type="text"
                                        value={currentOffering.name}
                                        onChange={(e) => handleUpdate('name', e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-400 outline-none transition-all"
                                    />
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Açıklama
                                    </label>
                                    <textarea
                                        value={currentOffering.description || ''}
                                        onChange={(e) => handleUpdate('description', e.target.value)}
                                        rows={3}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-400 outline-none transition-all resize-none"
                                    />
                                </div>

                                {/* Price, Currency, Duration (conditional), Type - Compact Grid */}
                                <div className={`grid gap-3 ${showDuration ? 'grid-cols-4' : 'grid-cols-3'}`}>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                                            Fiyat
                                        </label>
                                        <input
                                            type="number"
                                            value={currentOffering.price || ''}
                                            onChange={(e) => handleUpdate('price', parseFloat(e.target.value) || undefined)}
                                            className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-indigo-400 outline-none transition-all text-sm"
                                            placeholder="0"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                                            Para Birimi
                                        </label>
                                        <select
                                            value={currentOffering.currency || 'TRY'}
                                            onChange={(e) => handleUpdate('currency', e.target.value)}
                                            className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-indigo-400 outline-none transition-all text-sm"
                                        >
                                            <option value="TRY">TRY</option>
                                            <option value="USD">USD</option>
                                            <option value="EUR">EUR</option>
                                        </select>
                                    </div>
                                    {showDuration && (
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                                                Süre (dk)
                                            </label>
                                            <input
                                                type="number"
                                                value={currentOffering.duration || ''}
                                                onChange={(e) => handleUpdate('duration', parseInt(e.target.value) || undefined)}
                                                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-indigo-400 outline-none transition-all text-sm"
                                                placeholder="0"
                                            />
                                        </div>
                                    )}
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                                            Tip
                                        </label>
                                        <select
                                            value={currentOffering.type}
                                            onChange={(e) => handleUpdate('type', e.target.value as 'SERVICE' | 'PRODUCT')}
                                            className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-indigo-400 outline-none transition-all text-sm"
                                        >
                                            <option value="SERVICE">Hizmet</option>
                                            <option value="PRODUCT">Ürün</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Category */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                                        Kategori
                                    </label>
                                    <input
                                        type="text"
                                        value={currentOffering.category || ''}
                                        onChange={(e) => handleUpdate('category', e.target.value)}
                                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-indigo-400 outline-none transition-all text-sm"
                                        placeholder="Örn: Konaklama, Yeme-İçme"
                                    />
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="border-t border-gray-200"></div>

                            {/* AI Bulunan Özellikler - Compact */}
                            {currentOffering.meta_info && Object.keys(currentOffering.meta_info).filter(k => k !== '_custom_fields').length > 0 && (
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                        <Settings className="w-4 h-4 text-purple-500" />
                                        Detaylı Özellikler
                                    </h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        {Object.entries(currentOffering.meta_info || {})
                                            .filter(([key]) => key !== '_custom_fields')
                                            .map(([key, value]) => (
                                                <div key={key} className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                                                    <p className="text-xs font-semibold text-purple-700 mb-1 capitalize">
                                                        {key.replace(/_/g, ' ')}
                                                    </p>
                                                    <p className="text-sm text-gray-900">
                                                        {Array.isArray(value) ? value.join(', ') : String(value)}
                                                    </p>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            )}

                            {/* Custom Field Editor - Minimal */}
                            <div>
                                <button
                                    onClick={() => setShowCustomFields(!showCustomFields)}
                                    className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
                                >
                                    {showCustomFields ? '− Özel Alanları Gizle' : '+ Özel Alan Ekle'}
                                </button>
                                {showCustomFields && (
                                    <div className="mt-3">
                                        <CustomFieldEditor
                                            metaInfo={currentOffering.meta_info || {}}
                                            businessType={businessType}
                                            onUpdate={handleMetaInfoUpdate}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t bg-gray-50">
                        <div className="flex items-center justify-between">
                            {/* Navigation */}
                            <div className="flex gap-2">
                                <button
                                    onClick={handlePrevious}
                                    disabled={isFirst}
                                    className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 rounded-lg font-medium text-gray-700 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    Önceki
                                </button>
                                <button
                                    onClick={handleNext}
                                    disabled={isLast}
                                    className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 rounded-lg font-medium text-gray-700 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    Sonraki
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2">
                                <button
                                    onClick={handleDelete}
                                    className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-medium transition-all flex items-center gap-2"
                                >
                                    <X className="w-4 h-4" />
                                    Sil
                                </button>
                                {isLast && (
                                    <button
                                        onClick={handleComplete}
                                        className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-all flex items-center gap-2"
                                    >
                                        Tümünü Onayla
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
