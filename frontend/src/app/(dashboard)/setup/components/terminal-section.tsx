'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { toast } from 'sonner';

interface TerminalSectionProps {
    url: string;
    onComplete: (data: any) => void;
}

const LOG_MESSAGES = [
    'Sunucuya bağlanılıyor...',
    'DNS kayıtları çözümleniyor...',
    'Güvenlik duvarı kontrol ediliyor...',
    'HTML içeriği indiriliyor...',
    'Gemini AI motoru başlatılıyor...',
    'Sayfa yapısı analiz ediliyor...',
    'Menü ve navigasyon haritası çıkarılıyor...',
    'Hizmetler ve ürünler taranıyor...',
    'Fiyat bilgileri ayrıştırılıyor...',
    'İletişim detayları doğrulanıyor...',
    'Sektör analizi yapılıyor...',
    'Veri modeli oluşturuluyor...',
    'Sonuçlar derleniyor...'
];

export function TerminalSection({ url, onComplete }: TerminalSectionProps) {
    const [logs, setLogs] = useState<string[]>([]);
    const [currentLogIndex, setCurrentLogIndex] = useState(0);

    useEffect(() => {
        // Simulate log stream
        if (currentLogIndex < LOG_MESSAGES.length) {
            const timeout = setTimeout(() => {
                setLogs(prev => [...prev, LOG_MESSAGES[currentLogIndex]]);
                setCurrentLogIndex(prev => prev + 1);
            }, Math.random() * 800 + 400); // Random delay between 400-1200ms
            return () => clearTimeout(timeout);
        }
    }, [currentLogIndex]);

    const hasStartedRef = useRef(false);

    useEffect(() => {
        // Actual API call
        const analyzeUrl = async () => {
            if (hasStartedRef.current) return;
            hasStartedRef.current = true;

            try {
                console.log('🚀 Starting API call to:', 'http://localhost:3001/api/analyze-url');
                toast.info('API çağrısı başlatıldı...');

                const response = await fetch('http://localhost:3001/api/analyze-url', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ url }),
                });

                console.log('📡 Response status:', response.status, response.statusText);

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('API Error Response:', errorText);
                    toast.error(`API Hatası: ${response.status}`);
                    throw new Error('Analiz başarısız oldu');
                }

                const result = await response.json();
                console.log('🔍 Raw API Response:', result);
                console.log('🔍 Response type:', typeof result);
                console.log('🔍 Response keys:', Object.keys(result || {}));

                toast.success(`API yanıtı alındı! Keys: ${Object.keys(result || {}).join(', ')}`);

                // Wait for at least some logs to show up for effect
                setTimeout(() => {
                    // The controller returns the result directly, not wrapped in { data: ... }
                    // But let's handle both cases just to be safe
                    let finalData = result.data || result;

                    console.log('🔍 Final data after extraction:', finalData);
                    console.log('🔍 Final data type:', typeof finalData);

                    if (!finalData || finalData === null || finalData === undefined) {
                        console.warn('⚠️ No data received from backend. Using fallback.');
                        toast.warning('Backend\'den veri yok, fallback kullanılıyor');
                        finalData = {
                            company_info: { name: 'Yeni İşletme', sector: 'Genel' },
                            offerings: []
                        };
                    } else {
                        toast.info(`Veri hazır: ${finalData.offerings?.length || 0} hizmet bulundu`);
                    }

                    console.log('✅ Terminal calling onComplete with:', finalData);
                    onComplete(finalData);
                    toast.success('Analiz tamamlandı! onComplete çağrıldı.');
                }, 2000);

            } catch (error) {
                console.error(error);
                toast.error('Bir hata oluştu. Lütfen tekrar deneyin.');
                // In a real app, handle error state here (e.g. go back to input)
            }
        };

        analyzeUrl();
    }, [url, onComplete]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-4xl flex flex-col md:flex-row gap-8 items-center"
        >
            {/* Mascot Section */}
            <div className="w-full md:w-1/3 flex flex-col items-center justify-center">
                <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                    className="relative w-48 h-48"
                >
                    <Image
                        src="/yapayzekachatbotcomlogo1.png"
                        alt="AI Mascot"
                        fill
                        className="object-contain drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                    />
                </motion.div>
                <p className="mt-4 text-blue-400 font-medium animate-pulse">
                    Sitenizi inceliyorum...
                </p>
            </div>

            {/* Terminal Window */}
            <div className="w-full md:w-2/3 bg-gray-950 rounded-xl border border-gray-800 shadow-2xl overflow-hidden font-mono text-sm h-[400px] flex flex-col">
                <div className="bg-gray-900 px-4 py-2 flex items-center gap-2 border-b border-gray-800">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="ml-2 text-gray-500 text-xs">ai-analyzer — bash</span>
                </div>

                <div className="p-4 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
                    <div className="text-green-400 mb-2">
                        $ analyze --url {url}
                    </div>
                    {logs.map((log, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="mb-1 text-gray-300"
                        >
                            <span className="text-blue-500 mr-2">➜</span>
                            {log}
                        </motion.div>
                    ))}
                    <motion.div
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ repeat: Infinity, duration: 0.8 }}
                        className="inline-block w-2 h-4 bg-green-500 ml-1 align-middle"
                    />
                </div>
            </div>
        </motion.div>
    );
}
