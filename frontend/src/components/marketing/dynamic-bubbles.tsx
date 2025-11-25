"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

const FEATURES = [
    "7/24 Destek", "Hızlı Kurulum", "Satış Artırır", "Randevu Alır",
    "SEO Uyumlu", "Çoklu Dil", "Emlak Asistanı", "Klinik Botu",
    "Otel Rezervasyon", "E-ticaret Destek", "Maliyet Düşürür",
    "Müşteri Memnuniyeti", "Akıllı Yanıtlar", "Veri Analizi",
    "Kolay Entegrasyon", "Lead Toplama", "Sipariş Takibi", "SSS Yanıtlar",
    "Google'da Yüksel", "Organik Hit", "Mobil Dostu", "Hemen Cevap",
    "Dönüşüm Odaklı", "Rakip Takibi", "Anahtar Kelime", "Otomatik Blog",
    "Site Hızı", "Kullanıcı Deneyimi", "Marka Bilinirliği", "Sadık Müşteri",
    "7/24 Satış", "Akıllı Chatbot", "Yapay Zeka", "Doğal Dil",
    "Satış Hunisi", "CRM Entegrasyonu"
]

const SLOTS = [
    { id: 1, x: "85%", y: "20%", color: "text-green-400", dotColor: "bg-green-400", bg: "bg-green-500/10", border: "border-green-500/20" },
    { id: 2, x: "10%", y: "25%", color: "text-blue-400", dotColor: "bg-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
    { id: 3, x: "80%", y: "75%", color: "text-purple-400", dotColor: "bg-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
    { id: 4, x: "15%", y: "70%", color: "text-orange-400", dotColor: "bg-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" },
    { id: 5, x: "50%", y: "10%", color: "text-pink-400", dotColor: "bg-pink-400", bg: "bg-pink-500/10", border: "border-pink-500/20" },
    { id: 6, x: "50%", y: "90%", color: "text-yellow-400", dotColor: "bg-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
    { id: 7, x: "5%", y: "50%", color: "text-cyan-400", dotColor: "bg-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20" },
    { id: 8, x: "95%", y: "50%", color: "text-indigo-400", dotColor: "bg-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/20" },
]

export function DynamicBubbles() {
    const [activeBubbles, setActiveBubbles] = useState<{ [key: number]: string }>({})

    useEffect(() => {
        // Initialize with random features
        const initialBubbles: { [key: number]: string } = {}
        SLOTS.forEach(slot => {
            initialBubbles[slot.id] = FEATURES[Math.floor(Math.random() * FEATURES.length)]
        })
        setActiveBubbles(initialBubbles)

        // Cycle bubbles independently
        const intervals = SLOTS.map(slot => {
            // Random duration between 7s and 12s for each slot (longer duration)
            const duration = 7000 + Math.random() * 5000

            return setInterval(() => {
                setActiveBubbles(prev => {
                    // Briefly clear the slot to trigger exit animation
                    const next = { ...prev }
                    delete next[slot.id]
                    return next
                })

                setTimeout(() => {
                    setActiveBubbles(prev => ({
                        ...prev,
                        [slot.id]: FEATURES[Math.floor(Math.random() * FEATURES.length)]
                    }))
                }, 1000) // Wait for exit animation to finish before showing new one
            }, duration)
        })

        return () => intervals.forEach(clearInterval)
    }, [])

    return (
        <>
            {SLOTS.map((slot) => (
                <div
                    key={slot.id}
                    className="absolute z-30"
                    style={{ left: slot.x, top: slot.y, transform: 'translate(-50%, -50%)' }}
                >
                    <AnimatePresence mode="wait">
                        {activeBubbles[slot.id] && (
                            <motion.div
                                key={`${slot.id}-${activeBubbles[slot.id]}`}
                                initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                                animate={{
                                    opacity: 1,
                                    scale: 1,
                                    y: [0, -10, 0],
                                    transition: {
                                        opacity: { duration: 0.4 },
                                        scale: { duration: 0.4 },
                                        y: { duration: 3, repeat: Infinity, ease: "easeInOut" }
                                    }
                                }}
                                exit={{
                                    opacity: 0,
                                    scale: 0,
                                    // Move towards center (approximate relative to slot position)
                                    x: slot.x === "50%" ? 0 : (parseInt(slot.x) > 50 ? -50 : 50),
                                    y: slot.y === "50%" ? 0 : (parseInt(slot.y) > 50 ? -50 : 50),
                                    transition: { duration: 0.5 }
                                }}
                                className={cn(
                                    "px-4 py-2 rounded-xl border backdrop-blur-md flex items-center gap-2 shadow-lg whitespace-nowrap",
                                    slot.bg,
                                    slot.border
                                )}
                            >
                                <div className={cn("w-2 h-2 rounded-full animate-pulse", slot.dotColor)} />
                                <span className={cn("text-sm font-medium", slot.color)}>{activeBubbles[slot.id]}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            ))}
        </>
    )
}
