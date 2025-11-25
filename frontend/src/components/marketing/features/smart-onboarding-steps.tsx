"use client"

import React, { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Scan, BrainCircuit, MessageSquareCode } from 'lucide-react'
import { cn } from '@/lib/utils'

const steps = [
    {
        id: 1,
        title: "Puppeteer ile Derin Tarama",
        description: "Botumuz, web sitenizi bir insan gözüyle ziyaret eder. Sayfalarınızı gezer, ürünlerinizi, hizmetlerinizi ve fiyatlarınızı milisaniyeler içinde okur.",
        icon: Scan,
        color: "text-neon-cyan",
        visual: "scanning"
    },
    {
        id: 2,
        title: "Gemini ile Anlamlandırma",
        description: "Toplanan ham veriler, Google Gemini AI motoruna iletilir. Yapay zeka, sektörünüzü (Örn: Diş Kliniği) ve amacınızı (Örn: Randevu) otomatik tespit eder.",
        icon: BrainCircuit,
        color: "text-electric-indigo",
        visual: "analysis"
    },
    {
        id: 3,
        title: "Dinamik Prompt Oluşturma",
        description: "Sistem, işletmenize özel 'Guardrails' (Güvenlik Kuralları) ve kişilik özellikleri içeren benzersiz bir beyin oluşturur.",
        icon: MessageSquareCode,
        color: "text-vibrant-coral",
        visual: "generation"
    }
]

export function SmartOnboardingSteps() {
    const containerRef = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    })

    return (
        <section ref={containerRef} className="relative h-[300vh] bg-background">
            <div className="sticky top-0 h-screen flex items-center overflow-hidden">
                <div className="container px-4 mx-auto grid lg:grid-cols-2 gap-12 items-center h-full">

                    {/* Left Side: Text Content */}
                    <div className="relative z-10 flex flex-col justify-center h-full space-y-24 py-20">
                        {steps.map((step, index) => {
                            // Calculate opacity based on scroll progress
                            // Each step takes up roughly 1/3 of the scroll duration
                            const start = index * 0.33
                            const end = start + 0.33

                            const opacity = useTransform(scrollYProgress,
                                [start, start + 0.1, end - 0.1, end],
                                [0.2, 1, 1, 0.2]
                            )

                            const scale = useTransform(scrollYProgress,
                                [start, start + 0.1, end - 0.1, end],
                                [0.95, 1, 1, 0.95]
                            )

                            const x = useTransform(scrollYProgress,
                                [start, start + 0.1, end - 0.1, end],
                                [-20, 0, 0, -20]
                            )

                            return (
                                <motion.div
                                    key={step.id}
                                    style={{ opacity, scale, x }}
                                    className="space-y-4 max-w-lg"
                                >
                                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center bg-white/5 border border-white/10", step.color)}>
                                        <step.icon className="w-6 h-6" />
                                    </div>
                                    <h2 className="text-3xl font-bold text-white">{step.title}</h2>
                                    <p className="text-lg text-gray-400 leading-relaxed">
                                        {step.description}
                                    </p>
                                </motion.div>
                            )
                        })}
                    </div>

                    {/* Right Side: Visuals */}
                    <div className="relative h-[600px] w-full bg-white/5 rounded-3xl border border-white/10 overflow-hidden backdrop-blur-sm">
                        {/* Visual 1: Scanning */}
                        <motion.div
                            style={{ opacity: useTransform(scrollYProgress, [0, 0.1, 0.25, 0.35], [0, 1, 1, 0]) }}
                            className="absolute inset-0 flex items-center justify-center"
                        >
                            <div className="relative w-3/4 h-3/4 border-2 border-white/10 rounded-lg p-4 bg-black/40">
                                {/* Mock Website UI */}
                                <div className="space-y-4 opacity-50">
                                    <div className="h-8 w-1/3 bg-white/20 rounded" />
                                    <div className="h-32 w-full bg-white/10 rounded" />
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="h-24 bg-white/10 rounded" />
                                        <div className="h-24 bg-white/10 rounded" />
                                        <div className="h-24 bg-white/10 rounded" />
                                    </div>
                                </div>
                                {/* Scanning Laser */}
                                <motion.div
                                    animate={{ top: ["0%", "100%"] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                    className="absolute left-0 right-0 h-1 bg-neon-cyan shadow-[0_0_20px_rgba(6,182,212,0.8)] z-10"
                                />
                            </div>
                        </motion.div>

                        {/* Visual 2: Analysis (Neural Network) */}
                        <motion.div
                            style={{ opacity: useTransform(scrollYProgress, [0.33, 0.43, 0.58, 0.68], [0, 1, 1, 0]) }}
                            className="absolute inset-0 flex items-center justify-center"
                        >
                            <div className="relative w-full h-full flex items-center justify-center">
                                {/* Central Core */}
                                <div className="w-24 h-24 rounded-full bg-electric-indigo/20 border border-electric-indigo blur-xl absolute animate-pulse" />
                                <BrainCircuit className="w-32 h-32 text-electric-indigo relative z-10 animate-float" />

                                {/* Orbiting Data Points */}
                                {[...Array(6)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        className="absolute w-3 h-3 bg-neon-cyan rounded-full"
                                        animate={{
                                            rotate: 360,
                                            x: [0, 100, 0],
                                            y: [0, 50, 0]
                                        }}
                                        transition={{
                                            duration: 3 + i,
                                            repeat: Infinity,
                                            ease: "linear",
                                            delay: i * 0.5
                                        }}
                                        style={{ transformOrigin: "center center" }}
                                    />
                                ))}
                            </div>
                        </motion.div>

                        {/* Visual 3: Generation (Chat Interface) */}
                        <motion.div
                            style={{ opacity: useTransform(scrollYProgress, [0.66, 0.76, 1, 1], [0, 1, 1, 1]) }}
                            className="absolute inset-0 flex items-center justify-center"
                        >
                            <div className="w-80 bg-black border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                                <div className="h-12 bg-white/5 border-b border-white/10 flex items-center px-4 gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-500" />
                                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                                    <div className="w-3 h-3 rounded-full bg-green-500" />
                                </div>
                                <div className="p-4 space-y-4">
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="bg-white/10 rounded-lg rounded-tl-none p-3 text-sm text-gray-300 max-w-[80%]"
                                    >
                                        Merhaba! Size nasıl yardımcı olabilirim?
                                    </motion.div>
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.8 }}
                                        className="bg-electric-indigo rounded-lg rounded-tr-none p-3 text-sm text-white max-w-[80%] ml-auto"
                                    >
                                        Randevu almak istiyorum.
                                    </motion.div>
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 1.4 }}
                                        className="bg-white/10 rounded-lg rounded-tl-none p-3 text-sm text-gray-300 max-w-[80%]"
                                    >
                                        Tabii, hangi gün için uygunsunuz?
                                    </motion.div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    )
}
