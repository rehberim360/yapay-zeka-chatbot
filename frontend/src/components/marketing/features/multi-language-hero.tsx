"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { Globe2 } from 'lucide-react'
import { MultiLanguageBubbles } from '@/components/marketing/features/multi-language-bubbles'
import { MascotLogo } from '@/components/ui/mascot-logo'

export function MultiLanguageHero() {
    return (
        <section className="relative min-h-[80vh] w-full flex items-center justify-center overflow-hidden bg-black pt-20">
            {/* Background Effects */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-electric-indigo/10 rounded-full blur-[120px] animate-pulse-glow" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]" />
            </div>

            <div className="container relative z-10 px-4 grid lg:grid-cols-2 gap-12 items-center">

                {/* Left Content */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center lg:text-left space-y-8"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm text-neon-cyan text-sm font-medium">
                        <Globe2 className="w-4 h-4" />
                        <span>40+ Dil Desteği</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white leading-tight">
                        Sınırları Kaldırın. <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-electric-indigo">
                            Dünyayla Konuşun.
                        </span>
                    </h1>

                    <p className="text-xl text-gray-400 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                        Müşteriniz Japonca, Arapça veya İspanyolca konuşsun; asistanınız onu anlar ve kendi dilinde, kültürel nüanslara uygun cevap verir.
                    </p>
                </motion.div>

                {/* Right Visual: Mascot & Bubbles */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="relative flex items-center justify-center h-[400px] lg:h-[600px] mt-8 lg:mt-0"
                >
                    <div className="relative w-full max-w-[400px] lg:max-w-[600px] aspect-square flex items-center justify-center">

                        {/* Warping Background Blob */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-[300px] h-[300px] lg:w-[500px] lg:h-[500px] bg-gradient-to-tr from-electric-indigo/30 to-deep-purple/30 rounded-full blur-3xl animate-[spin_10s_linear_infinite]" style={{ borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%' }} />
                            <div className="absolute w-[250px] h-[250px] lg:w-[400px] lg:h-[400px] bg-gradient-to-bl from-neon-cyan/20 to-vibrant-coral/20 rounded-full blur-3xl animate-[spin_15s_linear_infinite_reverse]" style={{ borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' }} />
                        </div>

                        {/* Main Orb (Mascot Body) */}
                        <div className="relative w-40 h-40 lg:w-64 lg:h-64 z-20 animate-float">
                            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-electric-indigo to-deep-purple shadow-[0_0_50px_rgba(99,102,241,0.5)] lg:shadow-[0_0_100px_rgba(99,102,241,0.5)] flex items-center justify-center">
                                <div className="w-36 h-36 lg:w-56 lg:h-56 rounded-full bg-black/20 backdrop-blur-md border border-white/10 flex items-center justify-center overflow-hidden relative">
                                    {/* Reflection */}
                                    <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/10 to-transparent rounded-t-full" />

                                    {/* Face */}
                                    <div className="flex gap-4 lg:gap-8 z-10">
                                        <motion.div
                                            animate={{ scaleY: [1, 0.1, 1, 1, 1] }}
                                            transition={{ duration: 4, repeat: Infinity, times: [0, 0.05, 0.1, 0.8, 1] }}
                                            className="w-8 h-10 lg:w-12 lg:h-16 bg-neon-cyan rounded-full shadow-[0_0_10px_#06b6d4] lg:shadow-[0_0_20px_#06b6d4]"
                                        />
                                        <motion.div
                                            animate={{ scaleY: [1, 0.1, 1, 1, 1] }}
                                            transition={{ duration: 4, repeat: Infinity, times: [0, 0.05, 0.1, 0.8, 1] }}
                                            className="w-8 h-10 lg:w-12 lg:h-16 bg-neon-cyan rounded-full shadow-[0_0_10px_#06b6d4] lg:shadow-[0_0_20px_#06b6d4]"
                                        />
                                    </div>

                                    {/* Mouth (Subtle Smile) */}
                                    <div className="absolute bottom-8 lg:bottom-12 w-8 lg:w-12 h-1.5 lg:h-2 bg-black/30 rounded-full blur-sm" />
                                </div>
                            </div>

                            {/* Typing Indicator (Larger & Positioned) */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                transition={{ delay: 1, duration: 0.5 }}
                                className="absolute -bottom-2 -right-4 lg:-right-12 bg-white text-black px-4 py-2 lg:px-6 lg:py-4 rounded-2xl lg:rounded-3xl rounded-tl-none shadow-2xl flex items-center gap-1 lg:gap-2 z-30 border-2 lg:border-4 border-black/10"
                            >
                                <div className="w-1.5 h-1.5 lg:w-2.5 lg:h-2.5 bg-black rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <div className="w-1.5 h-1.5 lg:w-2.5 lg:h-2.5 bg-black rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <div className="w-1.5 h-1.5 lg:w-2.5 lg:h-2.5 bg-black rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </motion.div>
                        </div>

                        {/* Orbiting Elements (Rings) */}
                        <div className="absolute inset-0 m-auto w-[250px] h-[250px] lg:w-[400px] lg:h-[400px] border border-white/10 rounded-full animate-[spin_20s_linear_infinite] z-10" style={{ transform: 'rotateX(60deg)' }} />
                        <div className="absolute inset-0 m-auto w-[300px] h-[300px] lg:w-[500px] lg:h-[500px] border border-white/5 rounded-full animate-[spin_25s_linear_infinite_reverse] z-10" style={{ transform: 'rotateY(60deg)' }} />

                        {/* Dynamic Language Bubbles */}
                        <MultiLanguageBubbles />
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
