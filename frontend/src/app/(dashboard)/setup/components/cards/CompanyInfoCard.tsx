'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { MascotBubble } from '../mascot/MascotBubble';
import { mascotMessages } from '../mascot/mascot-messages';
import type { CompanyInfo } from '@/types/onboarding';

interface CompanyInfoCardProps {
    initialData: CompanyInfo;
    onSave: (companyInfo: CompanyInfo) => void;
}

// Ton seçenekleri
const toneOptions = [
    { value: 'professional', label: '🎩 Profesyonel', description: 'Resmi ve kurumsal' },
    { value: 'friendly', label: '😊 Samimi', description: 'Sıcak ve dostane' },
    { value: 'casual', label: '😎 Rahat', description: 'Günlük ve sohbet tarzı' },
    { value: 'enthusiastic', label: '🚀 Coşkulu', description: 'Enerjik ve heyecanlı' },
    { value: 'informative', label: '📚 Bilgilendirici', description: 'Detaylı ve açıklayıcı' }
];

// Dil seçenekleri
const languageOptions = [
    { value: 'tr', label: '🇹🇷 Türkçe' },
    { value: 'en', label: '🇬🇧 English' },
    { value: 'de', label: '🇩🇪 Deutsch' },
    { value: 'fr', label: '🇫🇷 Français' },
    { value: 'es', label: '🇪🇸 Español' }
];

export function CompanyInfoCard({ initialData, onSave }: CompanyInfoCardProps) {
    const [formData, setFormData] = useState<CompanyInfo>(initialData);
    const [errors, setErrors] = useState<Partial<Record<keyof CompanyInfo, string>>>({});
    const [mascotMessage, setMascotMessage] = useState(mascotMessages.companyInfo);
    const [isEditing, setIsEditing] = useState(false);

    // Validate field
    const validateField = (field: keyof CompanyInfo, value: string): string | null => {
        switch (field) {
            case 'name':
                if (!value.trim()) return 'Firma adı boş olamaz';
                if (value.trim().length < 2) return 'Firma adı çok kısa';
                if (value.trim().length > 100) return 'Firma adı çok uzun';
                return null;

            case 'sector':
                if (!value.trim()) return 'Sektör bilgisi gerekli';
                if (value.trim().length < 2) return 'Sektör adı çok kısa';
                return null;

            default:
                return null;
        }
    };

    // Handle change
    const handleChange = (field: keyof CompanyInfo, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setIsEditing(true);

        // Clear error when user types
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }

        // Reset mascot to default if was showing validation error
        if (mascotMessage.emotion === 'warning') {
            setMascotMessage(mascotMessages.companyInfo);
        }
    };

    // Validate all
    const validateAll = (): boolean => {
        const newErrors: Partial<Record<keyof CompanyInfo, string>> = {};

        (Object.keys(formData) as Array<keyof CompanyInfo>).forEach(field => {
            const value = formData[field];
            const error = validateField(field, typeof value === 'string' ? value : JSON.stringify(value));
            if (error) newErrors[field] = error;
        });

        setErrors(newErrors);

        // Show mascot validation message
        if (newErrors.name) {
            if (!formData.name.trim()) {
                setMascotMessage(mascotMessages.companyInfoValidation.nameEmpty);
            } else {
                setMascotMessage(mascotMessages.companyInfoValidation.nameTooShort);
            }
        } else if (newErrors.sector) {
            setMascotMessage(mascotMessages.companyInfoValidation.sectorEmpty);
        }

        return Object.keys(newErrors).length === 0;
    };

    // Handle save
    const handleSave = () => {
        if (validateAll()) {
            setMascotMessage(mascotMessages.companyInfoValidation.success);
            setTimeout(() => {
                onSave(formData);
            }, 1000); // Başarı mesajını göstermek için delay
        }
    };

    return (
        <>
            {/* Maskot Bubble */}
            <MascotBubble
                emotion={mascotMessage.emotion}
                message={mascotMessage.text}
                icon={mascotMessage.icon}
                position="top-center"
            />

            {/* Main Card */}
            <motion.div
                className="w-full max-w-2xl mx-auto mt-32"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
            >
                <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">

                    {/* Header */}
                    <div className="text-center mb-8">
                        <motion.div
                            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 mb-4 shadow-lg"
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            transition={{ type: 'spring', stiffness: 300 }}
                        >
                            <span className="text-4xl">🏢</span>
                        </motion.div>
                        <h2 className="text-3xl font-bold text-white mb-2">
                            Firma Bilgileriniz
                        </h2>
                        <p className="text-white/70">
                            Lütfen bilgilerinizi kontrol edin ve gerekirse düzenleyin
                        </p>
                    </div>

                    {/* Form */}
                    <div className="space-y-6">

                        {/* Firma Adı */}
                        <FormField
                            icon="🏢"
                            label="Firma Adı"
                            value={formData.name}
                            onChange={(value) => handleChange('name', value)}
                            error={errors.name}
                            placeholder="Örn: Acme Teknoloji"
                        />

                        {/* Sektör */}
                        <FormField
                            icon="🌍"
                            label="Sektör"
                            value={formData.sector || ''}
                            onChange={(value) => handleChange('sector', value)}
                            error={errors.sector}
                            placeholder="Örn: Yazılım, E-ticaret, Danışmanlık"
                            suggestions={['Yazılım', 'E-ticaret', 'Danışmanlık', 'Eğitim', 'Sağlık', 'Finans', 'Üretim', 'Hizmet']}
                        />

                        {/* Ton */}
                        <SelectField
                            icon="🗣️"
                            label="Konuşma Tonu"
                            value={formData.tone_of_voice || ''}
                            onChange={(value) => handleChange('tone_of_voice', value)}
                            options={toneOptions}
                        />

                        {/* Dil */}
                        <SelectField
                            icon="🌐"
                            label="Dil"
                            value={formData.detected_language || ''}
                            onChange={(value) => handleChange('detected_language', value)}
                            options={languageOptions}
                        />

                    </div>

                    {/* Actions */}
                    <div className="mt-8 flex gap-4">
                        <motion.button
                            onClick={handleSave}
                            className="flex-1 py-4 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 rounded-2xl text-white font-semibold text-lg shadow-lg transition-all"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            {isEditing ? '💾 Kaydet & İleri' : 'İleri'} ▶
                        </motion.button>
                    </div>

                    {/* Info Note */}
                    <motion.div
                        className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <p className="text-blue-200 text-sm text-center">
                            💡 Bu bilgiler chatbot'unuzun kişiliğini belirler
                        </p>
                    </motion.div>

                </div>
            </motion.div>
        </>
    );
}

// Form Field Component
function FormField({
    icon,
    label,
    value,
    onChange,
    error,
    placeholder,
    suggestions
}: {
    icon: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    error?: string;
    placeholder?: string;
    suggestions?: string[];
}) {
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    return (
        <div className="relative">
            <label className="flex items-center gap-2 text-white font-medium mb-2">
                <span className="text-2xl">{icon}</span>
                {label}
            </label>

            <div className="relative">
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onFocus={() => {
                        setIsFocused(true);
                        if (suggestions) setShowSuggestions(true);
                    }}
                    onBlur={() => {
                        setIsFocused(false);
                        setTimeout(() => setShowSuggestions(false), 200);
                    }}
                    placeholder={placeholder}
                    className={`w-full px-5 py-4 bg-white/10 border-2 rounded-xl text-white placeholder-white/40 focus:outline-none focus:bg-white/15 transition-all ${error
                            ? 'border-red-500 focus:border-red-400'
                            : isFocused
                                ? 'border-purple-500 focus:border-purple-400'
                                : 'border-white/20 focus:border-purple-400'
                        }`}
                />

                {/* Suggestions Dropdown */}
                <AnimatePresence>
                    {showSuggestions && suggestions && suggestions.length > 0 && (
                        <motion.div
                            className="absolute top-full mt-2 w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl overflow-hidden z-10 shadow-2xl"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            {suggestions.map((suggestion, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => {
                                        onChange(suggestion);
                                        setShowSuggestions(false);
                                    }}
                                    className="w-full px-5 py-3 text-left text-white hover:bg-white/10 transition-colors"
                                >
                                    {suggestion}
                                </button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Error Message */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        className="mt-2 flex items-center gap-2 text-red-300 text-sm"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                    >
                        <span>⚠️</span>
                        {error}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// Select Field Component
function SelectField({
    icon,
    label,
    value,
    onChange,
    options
}: {
    icon: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: Array<{ value: string; label: string; description?: string }>;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const selectedOption = options.find(opt => opt.value === value);

    return (
        <div className="relative">
            <label className="flex items-center gap-2 text-white font-medium mb-2">
                <span className="text-2xl">{icon}</span>
                {label}
            </label>

            {/* Selected Display */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-5 py-4 bg-white/10 border-2 border-white/20 rounded-xl text-white flex items-center justify-between hover:bg-white/15 focus:border-purple-400 transition-all"
            >
                <span>{selectedOption?.label || 'Seçiniz'}</span>
                <motion.span
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                >
                    ▼
                </motion.span>
            </button>

            {/* Dropdown */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="absolute top-full mt-2 w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl overflow-hidden z-20 shadow-2xl"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        {options.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => {
                                    onChange(option.value);
                                    setIsOpen(false);
                                }}
                                className={`w-full px-5 py-4 text-left hover:bg-white/10 transition-colors ${option.value === value ? 'bg-white/15' : ''
                                    }`}
                            >
                                <div className="text-white font-medium">{option.label}</div>
                                {option.description && (
                                    <div className="text-white/60 text-sm mt-1">{option.description}</div>
                                )}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </div>
    );
}
