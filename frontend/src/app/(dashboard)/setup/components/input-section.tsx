'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Globe } from 'lucide-react';
import Image from 'next/image';

interface InputSectionProps {
    onStart: (url: string) => void;
}

// Animasyonlu mesajlar - kısa ve tek satırlık
const rotatingMessages = [
    "Senin için çalışmamı ister misin? 🤖",
    "Siparişlerini yönetirim 📦",
    "Randevularını alırım 📅",
    "Rezervasyon yönetimi 🏨",
    "Araç kiralama desteği 🚗",
    "Müşteri destek sistemi 💬",
    "Veri yönetimi 📊",
    "Çok kanallı iletişim 📱",
    "Bütün dillerde hizmet 🌍",
    "7/24 aktif destek 🌟",
    "Kesintisiz çalışma ⚡",
    "Hasta randevu sistemi 🏥",
    "Masa rezervasyonu 🍽️",
    "E-ticaret takibi 🛒",
    "Gayrimenkul asistanı 🏡",
    "Eğitim kayıt sistemi 📚"
];

export function InputSection({ onStart }: InputSectionProps) {
    const [url, setUrl] = useState('');
    const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

    // Mesajları döngüyle değiştir
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentMessageIndex((prev) => (prev + 1) % rotatingMessages.length);
        }, 3000); // Her 3 saniyede bir değişir

        return () => clearInterval(interval);
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (url) onStart(url);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-2xl text-center"
        >
            {/* Büyük Maskot */}
            <div className="mb-4">
                <motion.div
                    className="flex justify-center mb-1"
                    animate={{
                        y: [0, -8, 0],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                >
                    <div className="relative">
                        <Image
                            src="/yapayzekachatbotcomlogo1.png"
                            alt="AI Assistant Mascot"
                            width={140}
                            height={140}
                            className="object-contain drop-shadow-lg"
                            priority
                        />
                        {/* Subtle glow */}
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 blur-2xl -z-10 rounded-full" />
                    </div>
                </motion.div>

                {/* Animasyonlu Konuşma Baloncuğu - Minimal ve Tek Satır */}
                <div className="flex justify-center">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentMessageIndex}
                            initial={{ opacity: 0, y: 5, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -5, scale: 0.95 }}
                            transition={{ duration: 0.3 }}
                            className="relative"
                        >
                            <div className="bg-white rounded-xl px-5 py-2.5 shadow-sm border border-gray-200">
                                <p className="text-gray-900 font-medium text-sm whitespace-nowrap">
                                    {rotatingMessages[currentMessageIndex]}
                                </p>
                                {/* Speech bubble tail - daha belirgin */}
                                <div className="absolute top-[-6px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[6px] border-b-white" />
                                <div className="absolute top-[-7px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-b-[7px] border-b-gray-200" />
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* Başlık */}
            <div className="mb-8">
                <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
                    Yapay Zeka Asistanınızı <span className="text-indigo-600">Oluşturun</span>
                </h1>
                <p className="text-gray-600 text-base leading-relaxed">
                    Firmanızı analiz edelim ve size özel yapay zeka chatbot'u saniyeler içinde hazırlayalım.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="relative group">
                <div className="relative flex items-center bg-white rounded-xl p-2 border border-gray-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all">
                    <div className="pl-4 text-gray-400">
                        <Globe className="w-6 h-6" />
                    </div>
                    <input
                        type="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://www.isletmeniz.com"
                        className="flex-1 bg-transparent border-none outline-none text-gray-900 px-4 py-3 text-base placeholder-gray-400"
                        required
                    />
                    <button
                        type="submit"
                        className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 rounded-lg font-medium transition-all flex items-center gap-2 hover:shadow-lg"
                    >
                        Başla <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            </form>

            <div className="mt-8">
                <button
                    onClick={() => onStart('MANUAL')}
                    className="text-gray-500 hover:text-gray-900 text-sm transition-colors underline decoration-gray-300 hover:decoration-gray-500 underline-offset-4"
                >
                    Otomatik kurulum çalışmadı mı? Manuel Kurulum yapın
                </button>
            </div>
        </motion.div>
    );
}
