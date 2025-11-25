'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Mail, Phone, MapPin, ArrowRight, Sparkles, Edit2, Check, X, Settings } from 'lucide-react';
import type { CompanyInfo, Offering } from '@/types/onboarding';
import { CustomFieldEditor } from '../CustomFieldEditor';

interface SectorAnalysis {
    sector: string;
    sub_sector?: string;
    bot_purpose: string;
    bot_personality: string;
    expected_user_intent: string[];
}

interface CompanyReviewCardProps {
    initialData: CompanyInfo;
    offerings: Offering[];
    sectorAnalysis?: SectorAnalysis;
    onNext: (data: { companyInfo: CompanyInfo; extraInfo: string; selectedOfferings: Offering[] }) => void;
}

export function CompanyReviewCard({ initialData, offerings, sectorAnalysis, onNext }: CompanyReviewCardProps) {
    const [companyInfo, setCompanyInfo] = useState(initialData || {});
    const [extraInfo] = useState('');
    const [editingField, setEditingField] = useState<string | null>(null);
    const [tempValue, setTempValue] = useState('');
    const [selectedIds, setSelectedIds] = useState<number[]>(offerings.map((_, idx) => idx));
    const [editingOfferingId, setEditingOfferingId] = useState<number | null>(null);
    const [updatedOfferings, setUpdatedOfferings] = useState<Offering[]>(offerings);

    const toggleOffering = (idx: number) => {
        setSelectedIds(prev =>
            prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
        );
    };

    const handleSubmit = () => {
        const selected = updatedOfferings.filter((_, idx) => selectedIds.includes(idx));
        onNext({ companyInfo, extraInfo, selectedOfferings: selected });
    };

    const handleOfferingMetaInfoUpdate = (idx: number, updatedMetaInfo: Record<string, unknown>) => {
        const updated = [...updatedOfferings];
        updated[idx] = {
            ...updated[idx],
            meta_info: updatedMetaInfo
        };
        setUpdatedOfferings(updated);
    };

    const startEdit = (field: string, currentValue: string) => {
        setEditingField(field);
        setTempValue(currentValue || '');
    };

    const saveEdit = (field: string) => {
        const keys = field.split('.');
        if (keys.length === 1) {
            setCompanyInfo({ ...companyInfo, [field]: tempValue });
        } else if (keys[0] === 'social_media') {
            setCompanyInfo({
                ...companyInfo,
                social_media: { ...companyInfo.social_media, [keys[1]]: tempValue }
            });
        }
        setEditingField(null);
    };

    const cancelEdit = () => {
        setEditingField(null);
        setTempValue('');
    };

    return (
        <div className="w-full h-[calc(100vh-180px)] flex items-center justify-center">
            <div className="w-full max-w-7xl h-full">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
                    
                    {/* LEFT: Company Business Card */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-1 bg-white rounded-2xl shadow-2xl border-t-4 border-t-blue-500 flex flex-col overflow-hidden"
                    >
                        <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 border-b">
                            <EditableField
                                value={companyInfo.name || 'Firma Adı'}
                                isEditing={editingField === 'name'}
                                onEdit={() => startEdit('name', companyInfo.name || '')}
                                onSave={() => saveEdit('name')}
                                onCancel={cancelEdit}
                                tempValue={tempValue}
                                onChange={setTempValue}
                                className="text-2xl font-bold text-gray-900 mb-3"
                            />
                            
                            <EditableField
                                value={companyInfo.description || 'Firma açıklaması buraya gelecek...'}
                                isEditing={editingField === 'description'}
                                onEdit={() => startEdit('description', companyInfo.description || '')}
                                onSave={() => saveEdit('description')}
                                onCancel={cancelEdit}
                                tempValue={tempValue}
                                onChange={setTempValue}
                                className="text-sm text-gray-600 leading-relaxed"
                                multiline
                            />

                            <div className="flex flex-wrap items-center gap-2 mt-4">
                                <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
                                    {companyInfo.sector || sectorAnalysis?.sector || 'Sektör'}
                                </span>
                                {sectorAnalysis?.sub_sector && (
                                    <span className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-medium">
                                        {sectorAnalysis.sub_sector}
                                    </span>
                                )}
                                {sectorAnalysis?.bot_purpose && (
                                    <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
                                        {sectorAnalysis.bot_purpose}
                                    </span>
                                )}
                                <span className="text-xs text-gray-400">
                                    {companyInfo.detected_language?.toUpperCase() || 'TR'}
                                </span>
                            </div>

                            {/* Sector Analysis Details */}
                            {sectorAnalysis && (
                                <div className="mt-4 p-3 bg-white/50 rounded-lg border border-blue-200">
                                    <p className="text-xs font-semibold text-gray-700 mb-2">🤖 Chatbot Kişiliği</p>
                                    <p className="text-xs text-gray-600 mb-3">{sectorAnalysis.bot_personality}</p>
                                    
                                    {sectorAnalysis.expected_user_intent.length > 0 && (
                                        <>
                                            <p className="text-xs font-semibold text-gray-700 mb-2">💬 Beklenen Kullanıcı Niyetleri</p>
                                            <div className="flex flex-wrap gap-1">
                                                {sectorAnalysis.expected_user_intent.slice(0, 3).map((intent, idx) => (
                                                    <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                                        {intent}
                                                    </span>
                                                ))}
                                                {sectorAnalysis.expected_user_intent.length > 3 && (
                                                    <span className="text-xs text-gray-500">
                                                        +{sectorAnalysis.expected_user_intent.length - 3} daha
                                                    </span>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="flex-1 overflow-auto p-6 space-y-6">
                            {/* İletişim */}
                            <div className="space-y-3">
                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-2">
                                    <Phone className="w-3 h-3" />
                                    İletişim Bilgileri
                                </h4>
                                <div className="space-y-2">
                                    <InfoRow
                                        icon={<MapPin className="w-4 h-4 text-gray-400" />}
                                        value={companyInfo.address || 'Adres belirtilmemiş'}
                                        isEditing={editingField === 'address'}
                                        onEdit={() => startEdit('address', companyInfo.address || '')}
                                        onSave={() => saveEdit('address')}
                                        onCancel={cancelEdit}
                                        tempValue={tempValue}
                                        onChange={setTempValue}
                                    />
                                    <InfoRow
                                        icon={<Phone className="w-4 h-4 text-gray-400" />}
                                        value={companyInfo.phone || 'Telefon belirtilmemiş'}
                                        isEditing={editingField === 'phone'}
                                        onEdit={() => startEdit('phone', companyInfo.phone || '')}
                                        onSave={() => saveEdit('phone')}
                                        onCancel={cancelEdit}
                                        tempValue={tempValue}
                                        onChange={setTempValue}
                                    />
                                    <InfoRow
                                        icon={<Mail className="w-4 h-4 text-gray-400" />}
                                        value={companyInfo.email || 'E-posta belirtilmemiş'}
                                        isEditing={editingField === 'email'}
                                        onEdit={() => startEdit('email', companyInfo.email || '')}
                                        onSave={() => saveEdit('email')}
                                        onCancel={cancelEdit}
                                        tempValue={tempValue}
                                        onChange={setTempValue}
                                    />
                                </div>
                            </div>

                            {/* Sosyal Medya */}
                            <div className="space-y-3">
                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide">Sosyal Medya</h4>
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        { key: 'instagram', icon: '📷', label: 'Instagram' },
                                        { key: 'facebook', icon: '👥', label: 'Facebook' },
                                        { key: 'twitter', icon: '🐦', label: 'Twitter' },
                                        { key: 'linkedin', icon: '💼', label: 'LinkedIn' }
                                    ].map(social => (
                                        <SocialBadge
                                            key={social.key}
                                            icon={social.icon}
                                            label={social.label}
                                            value={companyInfo.social_media?.[social.key as keyof typeof companyInfo.social_media] || ''}
                                            isEditing={editingField === `social_media.${social.key}`}
                                            onEdit={() => startEdit(`social_media.${social.key}`, companyInfo.social_media?.[social.key as keyof typeof companyInfo.social_media] || '')}
                                            onSave={() => saveEdit(`social_media.${social.key}`)}
                                            onCancel={cancelEdit}
                                            tempValue={tempValue}
                                            onChange={setTempValue}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* RIGHT: Offerings Selection */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-2 bg-white rounded-2xl shadow-2xl border-t-4 border-t-purple-500 flex flex-col overflow-hidden"
                    >
                        <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-b">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-purple-600" />
                                    <h3 className="text-lg font-bold">Tespit Edilen Hizmet/Ürünler</h3>
                                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                                        {selectedIds.length} / {offerings.length}
                                    </span>
                                </div>
                            </div>
                            <p className="text-xs text-gray-600 mt-1">
                                Chatbot&apos;un öğrenmesini istediğiniz öğeleri seçin
                            </p>
                        </div>

                        <div className="flex-1 overflow-auto p-4">
                            {offerings.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">
                                    <p className="mb-2 text-sm">Ana sayfada hizmet/ürün bulunamadı</p>
                                    <p className="text-xs">Detay sayfalardan çekilecek</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                                        {updatedOfferings.map((offering, idx) => (
                                            <div
                                                key={idx}
                                                className={`relative group flex items-start gap-2 p-2.5 rounded-lg border transition-all ${
                                                    selectedIds.includes(idx)
                                                        ? 'bg-white border-purple-200 shadow-sm hover:border-purple-400 hover:shadow-md'
                                                        : 'bg-gray-100 opacity-50 border-gray-200'
                                                }`}
                                            >
                                                <div 
                                                    className="flex items-start gap-2 flex-1 cursor-pointer"
                                                    onClick={() => toggleOffering(idx)}
                                                >
                                                    <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                                                        selectedIds.includes(idx) ? 'bg-purple-500 border-purple-500' : 'bg-white border-gray-400'
                                                    }`}>
                                                        {selectedIds.includes(idx) && <Check className="w-3 h-3 text-white" />}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className={`font-medium text-xs leading-tight ${
                                                            !selectedIds.includes(idx) ? 'line-through text-gray-400' : 'text-gray-800'
                                                        }`}>
                                                            {offering.name}
                                                        </p>
                                                        <p className="text-[10px] text-gray-400 uppercase mt-0.5">{offering.type}</p>
                                                    </div>
                                                </div>
                                                {selectedIds.includes(idx) && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setEditingOfferingId(editingOfferingId === idx ? null : idx);
                                                        }}
                                                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-purple-100 rounded transition-all"
                                                        title="Özellikleri Düzenle"
                                                    >
                                                        <Settings className="w-3 h-3 text-purple-600" />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Custom Field Editor for Selected Offering */}
                                    <AnimatePresence>
                                        {editingOfferingId !== null && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="p-4 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border-2 border-purple-200">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <div>
                                                            <h4 className="font-bold text-gray-900">
                                                                {updatedOfferings[editingOfferingId].name}
                                                            </h4>
                                                            <p className="text-xs text-gray-600">Özel özellikler ekleyin</p>
                                                        </div>
                                                        <button
                                                            onClick={() => setEditingOfferingId(null)}
                                                            className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                                                        >
                                                            <X className="w-4 h-4 text-gray-500" />
                                                        </button>
                                                    </div>
                                                    <CustomFieldEditor
                                                        offeringId={String(editingOfferingId)}
                                                        metaInfo={updatedOfferings[editingOfferingId].meta_info || {}}
                                                        businessType={companyInfo.sector}
                                                        onUpdate={(updatedMetaInfo) => 
                                                            handleOfferingMetaInfoUpdate(editingOfferingId, updatedMetaInfo)
                                                        }
                                                    />
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            )}
                        </div>

                        <div className="p-3 border-t bg-white flex justify-end">
                            <button
                                onClick={handleSubmit}
                                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-semibold text-sm transition-all flex items-center gap-2 shadow-lg"
                            >
                                Onayla ve İlerle
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

// Editable Field Component
function EditableField({
    value,
    isEditing,
    onEdit,
    onSave,
    onCancel,
    tempValue,
    onChange,
    className = '',
    multiline = false
}: {
    value: string;
    isEditing: boolean;
    onEdit: () => void;
    onSave: () => void;
    onCancel: () => void;
    tempValue: string;
    onChange: (value: string) => void;
    className?: string;
    multiline?: boolean;
}) {
    return (
        <AnimatePresence mode="wait">
            {isEditing ? (
                <motion.div
                    key="editing"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex gap-2"
                >
                    {multiline ? (
                        <textarea
                            value={tempValue}
                            onChange={(e) => onChange(e.target.value)}
                            rows={3}
                            autoFocus
                            className={`flex-1 px-3 py-2 bg-white border-2 border-blue-500 rounded-lg text-sm outline-none resize-none ${className}`}
                        />
                    ) : (
                        <input
                            type="text"
                            value={tempValue}
                            onChange={(e) => onChange(e.target.value)}
                            autoFocus
                            className={`flex-1 px-3 py-2 bg-white border-2 border-blue-500 rounded-lg outline-none ${className}`}
                        />
                    )}
                    <button
                        onClick={onSave}
                        className="px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg flex-shrink-0"
                    >
                        <Check className="w-4 h-4" />
                    </button>
                    <button
                        onClick={onCancel}
                        className="px-3 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg flex-shrink-0"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </motion.div>
            ) : (
                <motion.div
                    key="display"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onEdit}
                    className={`group relative cursor-pointer ${className}`}
                >
                    <p className={!value || value.includes('belirtilmemiş') ? 'text-gray-400' : ''}>
                        {value}
                    </p>
                    <div className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Edit2 className="w-4 h-4 text-blue-600" />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

// Info Row Component
function InfoRow({
    icon,
    value,
    isEditing,
    onEdit,
    onSave,
    onCancel,
    tempValue,
    onChange
}: {
    icon: React.ReactNode;
    value: string;
    isEditing: boolean;
    onEdit: () => void;
    onSave: () => void;
    onCancel: () => void;
    tempValue: string;
    onChange: (value: string) => void;
}) {
    return (
        <AnimatePresence mode="wait">
            {isEditing ? (
                <motion.div
                    key="editing"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex gap-2"
                >
                    <input
                        type="text"
                        value={tempValue}
                        onChange={(e) => onChange(e.target.value)}
                        autoFocus
                        className="flex-1 px-2 py-1 bg-white border-2 border-blue-500 rounded text-sm outline-none"
                    />
                    <button onClick={onSave} className="px-2 bg-green-500 hover:bg-green-600 text-white rounded">
                        <Check className="w-3 h-3" />
                    </button>
                    <button onClick={onCancel} className="px-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded">
                        <X className="w-3 h-3" />
                    </button>
                </motion.div>
            ) : (
                <motion.div
                    key="display"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onEdit}
                    className="group flex items-start gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors relative"
                >
                    {icon}
                    <p className={`text-sm flex-1 ${value.includes('belirtilmemiş') ? 'text-gray-400' : 'text-gray-700'}`}>
                        {value}
                    </p>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Edit2 className="w-3 h-3 text-blue-600" />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

// Social Badge Component
function SocialBadge({
    icon,
    label,
    value,
    isEditing,
    onEdit,
    onSave,
    onCancel,
    tempValue,
    onChange
}: {
    icon: string;
    label: string;
    value: string;
    isEditing: boolean;
    onEdit: () => void;
    onSave: () => void;
    onCancel: () => void;
    tempValue: string;
    onChange: (value: string) => void;
}) {
    return (
        <AnimatePresence mode="wait">
            {isEditing ? (
                <motion.div
                    key="editing"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col gap-1"
                >
                    <input
                        type="text"
                        value={tempValue}
                        onChange={(e) => onChange(e.target.value)}
                        autoFocus
                        placeholder={`@${label.toLowerCase()}`}
                        className="px-2 py-1 bg-white border-2 border-blue-500 rounded text-xs outline-none"
                    />
                    <div className="flex gap-1">
                        <button onClick={onSave} className="flex-1 px-2 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-xs">
                            <Check className="w-3 h-3 mx-auto" />
                        </button>
                        <button onClick={onCancel} className="flex-1 px-2 py-1 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded text-xs">
                            <X className="w-3 h-3 mx-auto" />
                        </button>
                    </div>
                </motion.div>
            ) : (
                <motion.div
                    key="display"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onEdit}
                    className={`group relative flex items-center gap-1.5 px-2 py-1.5 rounded-lg cursor-pointer transition-all ${
                        value ? 'bg-gray-100 hover:bg-gray-200' : 'bg-gray-50 hover:bg-gray-100 border border-dashed border-gray-300'
                    }`}
                >
                    <span className="text-sm">{icon}</span>
                    <span className={`text-xs flex-1 truncate ${value ? 'text-gray-700' : 'text-gray-400'}`}>
                        {value || label}
                    </span>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Edit2 className="w-3 h-3 text-blue-600" />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
