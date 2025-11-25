'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { MascotBubble } from '../mascot/MascotBubble';
import { mascotMessages } from '../mascot/mascot-messages';

interface CompletionCardProps {
    onFinish?: () => void;
}

export function CompletionCard({ onFinish }: CompletionCardProps) {
    const [showConfetti, setShowConfetti] = useState(false);

    useEffect(() => {
        // Trigger confetti after mount
        setTimeout(() => setShowConfetti(true), 300);
    }, []);

    return (
        <>
            {/* Maskot Bubble */}
            <MascotBubble
                emotion="celebrating"
                message={mascotMessages.completion.text}
                icon={mascotMessages.completion.icon}
                position="top-center"
            />

            {/* Confetti Effect */}
            {showConfetti && (
                <div className="fixed inset-0 pointer-events-none z-30">
                    {[...Array(50)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-3 h-3 rounded-full"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: -20,
                                backgroundColor: ['#8b5cf6', '#3b82f6', '#ec4899', '#f59e0b', '#10b981'][
                                    Math.floor(Math.random() * 5)
                                ]
                            }}
                            initial={{ y: -20, opacity: 1, rotate: 0 }}
                            animate={{
                                y: window.innerHeight + 20,
                                opacity: 0,
                                rotate: Math.random() * 720 - 360
                            }}
                            transition={{
                                duration: 2 + Math.random() * 2,
                                delay: Math.random() * 0.5,
                                ease: 'easeOut'
                            }}
                        />
                    ))}
                </div>
            )}

            {/* Main Card */}
            <motion.div
                className="w-full max-w-2xl mx-auto mt-32"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            >
                <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-12 border border-white/20 shadow-2xl text-center">

                    {/* Success Icon */}
                    <motion.div
                        className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 mb-6 shadow-2xl relative"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                    >
                        <motion.span
                            className="text-7xl"
                            animate={{
                                scale: [1, 1.2, 1],
                                rotate: [0, 10, -10, 0]
                            }}
                            transition={{
                                duration: 0.6,
                                delay: 0.5,
                                repeat: Infinity,
                                repeatDelay: 2
                            }}
                        >
                            🎉
                        </motion.span>

                        {/* Glow */}
                        <div className="absolute inset-0 rounded-full bg-green-400/50 blur-3xl -z-10" />
                    </motion.div>

                    {/* Title */}
                    <motion.h1
                        className="text-4xl font-bold text-white mb-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        Tebrikler! 🥳
                    </motion.h1>

                    <motion.p
                        className="text-xl text-white/80 mb-8"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        Chatbot'unuz başarıyla oluşturuldu!
                    </motion.p>

                    {/* Stats Grid */}
                    <motion.div
                        className="grid grid-cols-3 gap-4 mb-8"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <StatBox icon="🏢" label="Firma Bilgileri" value="✓" />
                        <StatBox icon="📦" label="Ürün/Hizmetler" value="✓" />
                        <StatBox icon="🤖" label="Chatbot" value="Hazır" />
                    </motion.div>

                    {/* Action Button */}
                    <motion.button
                        onClick={onFinish}
                        className="w-full py-5 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 rounded-2xl text-white font-bold text-lg shadow-2xl transition-all"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        🚀 Chatbot'u Kullanmaya Başla
                    </motion.button>

                    {/* Success Note */}
                    <motion.div
                        className="mt-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7 }}
                    >
                        <p className="text-green-200 text-sm">
                            ✨ Tüm verileriniz kaydedildi ve chatbot'unuz aktif!
                        </p>
                    </motion.div>

                </div>
            </motion.div>
        </>
    );
}

// Stat Box Component
function StatBox({ icon, label, value }: { icon: string; label: string; value: string }) {
    return (
        <motion.div
            className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20"
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 300 }}
        >
            <div className="text-3xl mb-2">{icon}</div>
            <div className="text-white/70 text-xs mb-1">{label}</div>
            <div className="text-white font-bold">{value}</div>
        </motion.div>
    );
}
