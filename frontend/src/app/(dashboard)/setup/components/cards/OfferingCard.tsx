'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { MascotBubble } from '../mascot/MascotBubble';
import { mascotMessages } from '../mascot/mascot-messages';
import type { Offering } from '@/types/onboarding';

interface OfferingCardProps {
    offerings: Offering[];
    currentIndex: number;
    onUpdate: (index: number, offering: Offering) => void;
    onDelete: (index: number) => void;
    onNext: () => void;
    onPrevious: () => void;
    onComplete: () => void;
}

// Currency options
const currencyOptions = [
    { value: 'TRY', label: '₺', name: 'TL' },
    { value: 'USD', label: '$', name: 'USD' },
    { value: 'EUR', label: '€', name: 'EUR' },
    { value: 'GBP', label: '£', name: 'GBP' }
];

// Duration units
const durationUnits = [
    { value: 'minutes', label: 'Dakika', short: 'dk' },
    { value: 'hours', label: 'Saat', short: 'sa' },
    { value: 'days', label: 'Gün', short: 'gün' }
];

export function OfferingCard({
    offerings,
    currentIndex,
    onUpdate,
    onDelete,
    onNext,
    onPrevious,
    onComplete
}: OfferingCardProps) {
    const currentOffering = offerings[currentIndex];
    const total = offerings.length;

    const [formData, setFormData] = useState<Offering>(currentOffering);
    const [isEditing, setIsEditing] = useState(false);
    const [errors, setErrors] = useState<Partial<Record<keyof Offering, string>>>({});
    const [mascotMessage, setMascotMessage] = useState(
        mascotMessages.offeringProgress(currentIndex + 1, total)
    );
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [direction, setDirection] = useState<'left' | 'right'>('right');

    // Update form when index changes
    useEffect(() => {
        setFormData(offerings[currentIndex]);
        setIsEditing(false);
        setErrors({});
        setMascotMessage(mascotMessages.offeringProgress(currentIndex + 1, total));
    }, [currentIndex, offerings, total]);

    // Validate field
    const validateField = (field: keyof Offering, value: any): string | null => {
        switch (field) {
            case 'name':
                if (!value || !value.trim()) return 'İsim gerekli';
                if (value.trim().length < 2) return 'İsim çok kısa';
                return null;

            case 'price':
                if (value && (isNaN(value) || value < 0)) return 'Geçersiz fiyat';
                return null;

            default:
                return null;
        }
    };

    // Handle change
    const handleChange = (field: keyof Offering, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setIsEditing(true);

        // Clear error
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }

        // Reset mascot
        if (mascotMessage.emotion === 'warning') {
            setMascotMessage(mascotMessages.offeringProgress(currentIndex + 1, total));
        }
    };

    // Validate all
    const validateAll = (): boolean => {
        const newErrors: Partial<Record<keyof Offering, string>> = {};

        (Object.keys(formData) as Array<keyof Offering>).forEach(field => {
            const error = validateField(field, formData[field]);
            if (error) newErrors[field] = error;
        });

        setErrors(newErrors);

        // Show mascot validation
        if (newErrors.name) {
            setMascotMessage(mascotMessages.offeringValidation.nameEmpty);
        } else if (newErrors.price) {
            setMascotMessage(mascotMessages.offeringValidation.priceInvalid);
        }

        return Object.keys(newErrors).length === 0;
    };

    // Handle save (before navigation)
    const handleSave = () => {
        if (!validateAll()) return false;

        if (isEditing) {
            onUpdate(currentIndex, formData);
            setIsEditing(false);
            setMascotMessage(mascotMessages.offeringValidation.success);
        }

        return true;
    };

    // Handle next
    const handleNext = () => {
        if (!handleSave()) return;

        setDirection('right');

        if (currentIndex === total - 1) {
            // Son item, tamamla
            onComplete();
        } else {
            onNext();
        }
    };

    // Handle previous
    const handlePrevious = () => {
        if (!handleSave()) return;

        setDirection('left');
        onPrevious();
    };

    // Handle delete
    const handleDeleteConfirm = () => {
        setMascotMessage(mascotMessages.offeringDelete.deleted);
        setTimeout(() => {
            onDelete(currentIndex);
            setShowDeleteConfirm(false);
        }, 500);
    };

    // Slide variants
    const slideVariants = {
        enter: (direction: 'left' | 'right') => ({
            x: direction === 'right' ? 300 : -300,
            opacity: 0
        }),
        center: {
            x: 0,
            opacity: 1
        },
        exit: (direction: 'left' | 'right') => ({
            x: direction === 'right' ? -300 : 300,
            opacity: 0
        })
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
                transition={{ duration: 0.3 }}
            >
                <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">

                    {/* Progress Header */}
                    <div className="text-center mb-6">
                        <div className="flex items-center justify-center gap-2 mb-3">
                            <span className="text-4xl">📦</span>
                            <h2 className="text-2xl font-bold text-white">
                                Ürün/Hizmet {currentIndex + 1}/{total}
                            </h2>
                        </div>

                        {/* Progress Bar */}
                        <div className="relative h-2 bg-white/20 rounded-full overflow-hidden">
                            <motion.div
                                className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${((currentIndex + 1) / total) * 100}%` }}
                                transition={{ duration: 0.5 }}
                            />
                        </div>
                    </div>

                    {/* Form (Animated Carousel) */}
                    <AnimatePresence mode="wait" custom={direction}>
                        <motion.div
                            key={currentIndex}
                            custom={direction}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            className="space-y-5"
                        >

                            {/* Name */}
                            <FormField
                                icon="📋"
                                label="Ürün/Hizmet Adı"
                                value={formData.name}
                                onChange={(value) => handleChange('name', value)}
                                error={errors.name}
                                placeholder="Örn: Premium Paket, Saç Kesimi"
                                required
                            />

                            {/* Price & Currency */}
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    icon="💰"
                                    label="Fiyat"
                                    type="number"
                                    value={formData.price?.toString() || ''}
                                    onChange={(value) => handleChange('price', value ? parseFloat(value) : undefined)}
                                    error={errors.price}
                                    placeholder="0"
                                />

                                <MiniSelect
                                    icon="₺"
                                    label="Para Birimi"
                                    value={formData.currency || 'TRY'}
                                    onChange={(value) => handleChange('currency', value)}
                                    options={currencyOptions}
                                />
                            </div>

                            {/* Description */}
                            <TextAreaField
                                icon="📝"
                                label="Açıklama (Opsiyonel)"
                                value={formData.description || ''}
                                onChange={(value) => handleChange('description', value)}
                                placeholder="Hizmet veya ürün hakkında kısa açıklama..."
                                maxLength={500}
                            />

                            {/* Duration */}
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    icon="⏱️"
                                    label="Süre (Opsiyonel)"
                                    type="number"
                                    value={formData.duration?.toString() || ''}
                                    onChange={(value) => handleChange('duration', value ? parseInt(value) : undefined)}
                                    placeholder="30"
                                />

                                <MiniSelect
                                    icon="⏰"
                                    label="Birim"
                                    value={formData.duration_unit || 'minutes'}
                                    onChange={(value) => handleChange('duration_unit', value)}
                                    options={durationUnits}
                                />
                            </div>

                        </motion.div>
                    </AnimatePresence>

                    {/* Actions */}
                    <div className="mt-8 flex gap-3">
                        {/* Previous Button */}
                        <motion.button
                            onClick={handlePrevious}
                            disabled={currentIndex === 0}
                            className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed border border-white/20"
                            whileHover={{ scale: currentIndex === 0 ? 1 : 1.05 }}
                            whileTap={{ scale: currentIndex === 0 ? 1 : 0.95 }}
                        >
                            ◀ Geri
                        </motion.button>

                        {/* Delete Button */}
                        <motion.button
                            onClick={() => {
                                setMascotMessage(mascotMessages.offeringDelete.confirm);
                                setShowDeleteConfirm(true);
                            }}
                            className="px-6 py-3 bg-red-500/20 hover:bg-red-500/30 rounded-xl text-red-200 font-medium transition-all border border-red-500/30"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            🗑️ Sil
                        </motion.button>

                        {/* Next/Complete Button */}
                        <motion.button
                            onClick={handleNext}
                            className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 rounded-xl text-white font-semibold transition-all shadow-lg"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            {currentIndex === total - 1 ? '✅ Tamamla' : 'İleri ▶'}
                        </motion.button>
                    </div>

                    {/* Edit Indicator */}
                    <AnimatePresence>
                        {isEditing && (
                            <motion.div
                                className="mt-4 p-3 bg-amber-500/20 border border-amber-500/30 rounded-xl text-amber-200 text-sm text-center"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                            >
                                ✏️ Değişiklikler kaydedilecek
                            </motion.div>
                        )}
                    </AnimatePresence>

                </div>
            </motion.div>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {showDeleteConfirm && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowDeleteConfirm(false)}
                        />

                        {/* Modal */}
                        <motion.div
                            className="fixed inset-0 z-50 flex items-center justify-center p-4"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                        >
                            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-2xl max-w-md w-full">
                                <div className="text-center mb-6">
                                    <div className="text-6xl mb-4">🗑️</div>
                                    <h3 className="text-xl font-bold text-white mb-2">
                                        Silmek istediğine emin misin?
                                    </h3>
                                    <p className="text-white/70">
                                        "{formData.name}" kalıcı olarak silinecek
                                    </p>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowDeleteConfirm(false)}
                                        className="flex-1 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white font-medium transition-all border border-white/20"
                                    >
                                        İptal
                                    </button>
                                    <button
                                        onClick={handleDeleteConfirm}
                                        className="flex-1 py-3 bg-red-500 hover:bg-red-600 rounded-xl text-white font-semibold transition-all"
                                    >
                                        Evet, Sil
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
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
    type = 'text',
    required = false
}: {
    icon: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    error?: string;
    placeholder?: string;
    type?: 'text' | 'number';
    required?: boolean;
}) {
    return (
        <div>
            <label className="flex items-center gap-2 text-white font-medium mb-2 text-sm">
                <span className="text-xl">{icon}</span>
                {label}
                {required && <span className="text-red-400">*</span>}
            </label>

            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className={`w-full px-4 py-3 bg-white/10 border-2 rounded-xl text-white placeholder-white/40 focus:outline-none focus:bg-white/15 transition-all ${error ? 'border-red-500' : 'border-white/20 focus:border-purple-400'
                    }`}
            />

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

// TextArea Field Component
function TextAreaField({
    icon,
    label,
    value,
    onChange,
    placeholder,
    maxLength = 500
}: {
    icon: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    maxLength?: number;
}) {
    return (
        <div>
            <label className="flex items-center gap-2 text-white font-medium mb-2 text-sm">
                <span className="text-xl">{icon}</span>
                {label}
            </label>

            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                maxLength={maxLength}
                rows={3}
                className="w-full px-4 py-3 bg-white/10 border-2 border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:bg-white/15 focus:border-purple-400 transition-all resize-none"
            />

            <div className="mt-1 text-right text-white/40 text-xs">
                {value.length}/{maxLength}
            </div>
        </div>
    );
}

// Mini Select Component
function MiniSelect({
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
    options: Array<{ value: string; label: string; name?: string; short?: string }>;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const selected = options.find(opt => opt.value === value);

    return (
        <div>
            <label className="flex items-center gap-2 text-white font-medium mb-2 text-sm">
                <span className="text-xl">{icon}</span>
                {label}
            </label>

            <div className="relative">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full px-4 py-3 bg-white/10 border-2 border-white/20 rounded-xl text-white flex items-center justify-between hover:bg-white/15 focus:border-purple-400 transition-all"
                >
                    <span>{selected?.label || selected?.name || selected?.short || value}</span>
                    <motion.span
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="text-white/60"
                    >
                        ▼
                    </motion.span>
                </button>

                <AnimatePresence>
                    {isOpen && (
                        <>
                            <div
                                className="fixed inset-0 z-10"
                                onClick={() => setIsOpen(false)}
                            />
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
                                        className={`w-full px-4 py-3 text-left text-white hover:bg-white/10 transition-colors ${option.value === value ? 'bg-white/15' : ''
                                            }`}
                                    >
                                        {option.label} {option.name && `(${option.name})`}
                                    </button>
                                ))}
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
