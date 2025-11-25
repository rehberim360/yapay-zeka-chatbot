"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

const GREETINGS = [
    { text: "Merhaba", lang: "TR" },
    { text: "Hello", lang: "EN" },
    { text: "Hola", lang: "ES" },
    { text: "Bonjour", lang: "FR" },
    { text: "Hallo", lang: "DE" },
    { text: "Ciao", lang: "IT" },
    { text: "Olá", lang: "PT" },
    { text: "Привет", lang: "RU" },
    { text: "你好", lang: "ZH" },
    { text: "こんにちは", lang: "JA" },
    { text: "안녕하세요", lang: "KO" },
    { text: "مرحبا", lang: "AR" },
    { text: "नमस्ते", lang: "HI" },
    { text: "Sawasdee", lang: "TH" },
    { text: "Salam", lang: "FA" },
    { text: "Shalom", lang: "HE" },
    { text: "Namaskaram", lang: "ML" },
    { text: "Vanakkam", lang: "TA" },
]

// Slots arranged to avoid the bottom-right corner (where the typing indicator is)
const SLOTS = [
    { id: 1, x: "50%", y: "10%", color: "text-green-400", dotColor: "bg-green-400", bg: "bg-green-500/10", border: "border-green-500/20" }, // Top Center
    { id: 2, x: "85%", y: "20%", color: "text-blue-400", dotColor: "bg-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" }, // Top Right
    { id: 3, x: "15%", y: "20%", color: "text-purple-400", dotColor: "bg-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" }, // Top Left
    { id: 4, x: "5%", y: "50%", color: "text-orange-400", dotColor: "bg-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" }, // Left Center
    { id: 5, x: "95%", y: "50%", color: "text-pink-400", dotColor: "bg-pink-400", bg: "bg-pink-500/10", border: "border-pink-500/20" }, // Right Center
    { id: 6, x: "20%", y: "80%", color: "text-yellow-400", dotColor: "bg-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20" }, // Bottom Left
    // Removed Bottom Right slots to avoid overlap with typing indicator
]

export function MultiLanguageBubbles() {
    const [activeBubbles, setActiveBubbles] = useState<{ [key: number]: typeof GREETINGS[0] }>({})

    useEffect(() => {
        // Initialize with random greetings
        const initialBubbles: { [key: number]: typeof GREETINGS[0] } = {}
        SLOTS.forEach(slot => {
            initialBubbles[slot.id] = GREETINGS[Math.floor(Math.random() * GREETINGS.length)]
        })
        setActiveBubbles(initialBubbles)

        // Cycle bubbles independently
        const intervals = SLOTS.map(slot => {
            const duration = 4000 + Math.random() * 4000 // 4-8 seconds

            return setInterval(() => {
                setActiveBubbles(prev => {
                    const next = { ...prev }
                    delete next[slot.id]
                    return next
                })

                setTimeout(() => {
                    setActiveBubbles(prev => ({
                        ...prev,
                        [slot.id]: GREETINGS[Math.floor(Math.random() * GREETINGS.length)]
                    }))
                }, 1000)
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
                                key={`${slot.id}-${activeBubbles[slot.id].text}`}
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
                                <span className={cn("text-xs font-bold opacity-70", slot.color)}>{activeBubbles[slot.id].lang}</span>
                                <span className={cn("text-sm font-medium text-white")}>{activeBubbles[slot.id].text}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            ))}
        </>
    )
}
