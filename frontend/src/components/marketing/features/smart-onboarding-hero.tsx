"use client"

import React, { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { ArrowDown } from 'lucide-react'

export function SmartOnboardingHero() {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        canvas.width = window.innerWidth
        canvas.height = window.innerHeight

        const columns = Math.floor(canvas.width / 20)
        const drops: number[] = []

        for (let i = 0; i < columns; i++) {
            drops[i] = 1
        }

        const chars = "01" // Binary for a cleaner, more abstract look
        // Or use: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789" for more matrix-like

        const draw = () => {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)' // Fade effect
            ctx.fillRect(0, 0, canvas.width, canvas.height)

            ctx.font = '15px monospace'

            for (let i = 0; i < drops.length; i++) {
                const text = chars.charAt(Math.floor(Math.random() * chars.length))

                // Random color between Electric Indigo and Neon Cyan
                const colors = ['#6366f1', '#06b6d4', '#8b5cf6']
                ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)]

                ctx.fillText(text, i * 20, drops[i] * 20)

                if (drops[i] * 20 > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0
                }
                drops[i]++
            }
        }

        const interval = setInterval(draw, 33)

        const handleResize = () => {
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
        }

        window.addEventListener('resize', handleResize)

        return () => {
            clearInterval(interval)
            window.removeEventListener('resize', handleResize)
        }
    }, [])

    return (
        <section className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-black">
            {/* Digital Rain Canvas */}
            <canvas
                ref={canvasRef}
                className="absolute inset-0 z-0 opacity-30"
            />

            {/* Content Overlay */}
            <div className="relative z-10 container px-4 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="space-y-6"
                >
                    <div className="inline-block px-4 py-1.5 rounded-full border border-electric-indigo/30 bg-electric-indigo/10 backdrop-blur-sm text-electric-indigo text-sm font-medium mb-4">
                        Gemini 1.5 Mimarisi
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6">
                        Kod Yok. <br />
                        Konfigürasyon Yok. <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-indigo to-neon-cyan">
                            Sadece Saf Zeka.
                        </span>
                    </h1>

                    <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
                        Geleneksel chatbotların hantal dünyasını unutun.
                        Kendi kendini eğiten, sitenizi anlayan ve dakikalar içinde hazır olan bir teknoloji.
                    </p>
                </motion.div>
            </div>

            {/* Scroll Indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, y: [0, 10, 0] }}
                transition={{ delay: 1, duration: 2, repeat: Infinity }}
                className="absolute bottom-10 left-1/2 -translate-x-1/2 text-gray-500 flex flex-col items-center gap-2"
            >
                <span className="text-xs uppercase tracking-widest">Nasıl Çalışır?</span>
                <ArrowDown className="w-5 h-5" />
            </motion.div>

            {/* Gradient Overlay at bottom for smooth transition */}
            <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-background to-transparent z-10" />
        </section>
    )
}
