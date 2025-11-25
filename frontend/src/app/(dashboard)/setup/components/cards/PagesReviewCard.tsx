'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { Check, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';
import type { PageInfo } from '@/types/onboarding';

interface PagesReviewCardProps {
    suggestedPages: PageInfo[];
    onNext: (selectedPages: PageInfo[]) => void;
    onBack?: () => void;
}

export function PagesReviewCard({ suggestedPages, onNext, onBack }: PagesReviewCardProps) {
    const [selectedUrls, setSelectedUrls] = useState<string[]>(
        suggestedPages.map(p => p.url)
    );

    const togglePage = (url: string) => {
        setSelectedUrls(prev =>
            prev.includes(url) ? prev.filter(u => u !== url) : [...prev, url]
        );
    };

    const handleSubmit = () => {
        const selected = suggestedPages.filter(p => selectedUrls.includes(p.url));
        onNext(selected);
    };

    const typeLabels: Record<string, string> = {
        CONTACT_PAGE: 'İletişim Sayfası',
        ABOUT_PAGE: 'Hakkımızda',
        LEAD_PAGE: 'İletişim Formu',
        FAQ_PAGE: 'SSS',
        TEAM_PAGE: 'Ekibimiz',
        SERVICE_DETAIL: 'Hizmet Detayı',
        SERVICE_LISTING: 'Hizmet Listesi',
        PRODUCT_DETAIL: 'Ürün Detayı',
        PRODUCT_LISTING: 'Ürün Listesi',
        PRICING_PAGE: 'Fiyat Listesi',
        KNOWLEDGE_PAGE: 'Bilgi Sayfası',
    };

    return (
        <div className="w-full h-[calc(100vh-180px)] flex items-center justify-center">
            <div className="w-full max-w-7xl h-full">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-2xl border-t-4 border-t-indigo-500 flex flex-col overflow-hidden h-full"
                >
                    <div className="pb-3 p-4 bg-gradient-to-r from-indigo-50 to-purple-50">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-indigo-600" />
                                <h3 className="text-lg font-bold">Diğer Sayfalar (Opsiyonel)</h3>
                                <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded">
                                    {selectedUrls.length} / {suggestedPages.length}
                                </span>
                            </div>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                            İletişim, hakkımızda gibi sayfalardan firma bilgilerini güncelleyeceğiz
                        </p>
                    </div>

                    <div className="flex-1 overflow-auto p-4">
                        <div className="space-y-2">
                            {suggestedPages.map((page, idx) => (
                                <motion.div
                                    key={page.url}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.02 }}
                                    className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
                                        selectedUrls.includes(page.url)
                                            ? 'bg-white border-indigo-200 shadow-sm hover:border-indigo-400 hover:shadow-md'
                                            : 'bg-gray-100 opacity-50 border-gray-200'
                                    }`}
                                    onClick={() => togglePage(page.url)}
                                >
                                    <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                                        selectedUrls.includes(page.url) ? 'bg-indigo-500 border-indigo-500' : 'bg-white border-gray-400'
                                    }`}>
                                        {selectedUrls.includes(page.url) && <Check className="w-3 h-3 text-white" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`font-medium text-sm ${
                                            !selectedUrls.includes(page.url) ? 'line-through text-gray-400' : 'text-gray-800'
                                        }`}>
                                            {page.title || 'Sayfa'}
                                        </p>
                                        <p className="text-xs text-gray-500 truncate">{page.url}</p>
                                    </div>
                                    <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700 flex-shrink-0">
                                        {typeLabels[page.type] || page.type}
                                    </span>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    <div className="p-3 border-t bg-white flex justify-between items-center">
                        <button
                            onClick={onBack}
                            className="px-4 py-2 border border-gray-300 hover:bg-gray-50 rounded-lg text-gray-700 font-medium text-sm transition-all flex items-center gap-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Geri Dön
                        </button>
                        <button
                            onClick={handleSubmit}
                            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white font-semibold text-sm transition-all flex items-center gap-2"
                        >
                            Taramayı Başlat
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
