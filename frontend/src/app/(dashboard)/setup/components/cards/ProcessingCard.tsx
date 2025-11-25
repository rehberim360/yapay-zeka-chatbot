'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Check, Loader2 } from 'lucide-react';

interface ProcessingCardProps {
    phase: 'discovering' | 'analyzing' | 'processing';
    current?: number;
    total?: number;
    stats?: {
        pagesFound?: number;
        valuablePages?: number;
        offeringsFound?: number;
    };
}

const phaseConfig = {
    discovering: {
        title: 'Web Siteniz Analiz Ediliyor',
        subtitle: 'Ana sayfa taranıyor ve içerik çıkarılıyor',
        activities: [
            { text: 'Sayfa içeriği alınıyor', delay: 0 },
            { text: 'Linkler tespit ediliyor', delay: 0.8 },
            { text: 'AI analiz yapıyor', delay: 1.6 },
            { text: 'Firma bilgileri çıkarılıyor', delay: 2.4 },
        ]
    },
    analyzing: {
        title: 'Sayfalar Değerlendiriliyor',
        subtitle: 'Hangi sayfaların taranacağı belirleniyor',
        activities: [
            { text: 'Link listesi hazırlanıyor', delay: 0 },
            { text: 'AI stratejik analiz yapıyor', delay: 0.8 },
            { text: 'Önemli sayfalar seçiliyor', delay: 1.6 },
            { text: 'Öneri listesi oluşturuluyor', delay: 2.4 },
        ]
    },
    processing: {
        title: 'Detaylı Tarama Devam Ediyor',
        subtitle: 'Seçilen sayfalar işleniyor',
        activities: [
            { text: 'Detay sayfaları taranıyor', delay: 0 },
            { text: 'İçerikler analiz ediliyor', delay: 0.8 },
            { text: 'Hizmet/ürün bilgileri çıkarılıyor', delay: 1.6 },
            { text: 'Veriler birleştiriliyor', delay: 2.4 },
        ]
    }
};

export function ProcessingCard({ phase, current = 0, total = 100 }: ProcessingCardProps) {
    const [visibleActivities, setVisibleActivities] = useState<number[]>([]);
    const config = phaseConfig[phase];
    const progress = total > 0 ? Math.round((current / total) * 100) : 0;

    useEffect(() => {
        const timers = config.activities.map((activity, idx) => 
            setTimeout(() => {
                setVisibleActivities(prev => [...prev, idx]);
            }, activity.delay * 1000)
        );
        return () => {
            timers.forEach(clearTimeout);
            setVisibleActivities([]);
        };
    }, [phase, config.activities]);

    return (
        <div className="w-full h-[calc(100vh-180px)] flex items-center justify-center">
            <div className="w-full max-w-2xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-2xl border-t-4 border-t-indigo-500 overflow-hidden"
                >
                    {/* Header */}
                    <div className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-b">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                {config.title}
                            </h2>
                            <p className="text-sm text-gray-600">
                                {config.subtitle}
                            </p>
                        </div>
                    </div>

                    {/* Progress */}
                    <div className="p-6 border-b">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-semibold text-gray-700">İlerleme</span>
                            <span className="text-lg font-bold text-indigo-600">{progress}%</span>
                        </div>
                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full"
                                initial={{ width: '0%' }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.5, ease: "easeOut" }}
                            />
                        </div>
                    </div>

                    {/* Activities */}
                    <div className="p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
                            <span className="text-sm font-bold text-gray-700 uppercase tracking-wide">Sistem Durumu</span>
                        </div>
                        <div className="space-y-3">
                            {config.activities.map((activity, idx) => {
                                const isVisible = visibleActivities.includes(idx);
                                const isActive = idx === visibleActivities[visibleActivities.length - 1];
                                const isCompleted = isVisible && !isActive;

                                return (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ 
                                            opacity: isVisible ? 1 : 0.3,
                                            x: isVisible ? 0 : -10
                                        }}
                                        className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                                            isCompleted 
                                                ? 'bg-green-50 border border-green-200' 
                                                : isActive 
                                                ? 'bg-indigo-50 border border-indigo-200' 
                                                : 'bg-gray-50 border border-gray-200'
                                        }`}
                                    >
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                                            isCompleted 
                                                ? 'bg-green-500' 
                                                : isActive 
                                                ? 'bg-indigo-500' 
                                                : 'bg-gray-300'
                                        }`}>
                                            {isCompleted ? (
                                                <Check className="w-4 h-4 text-white" />
                                            ) : isActive ? (
                                                <Loader2 className="w-4 h-4 text-white animate-spin" />
                                            ) : (
                                                <div className="w-2 h-2 rounded-full bg-white" />
                                            )}
                                        </div>
                                        <span className={`text-sm font-medium ${
                                            isCompleted 
                                                ? 'text-green-900' 
                                                : isActive 
                                                ? 'text-indigo-900' 
                                                : 'text-gray-500'
                                        }`}>
                                            {activity.text}
                                        </span>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
