"use client"

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, CheckCircle2, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { DynamicBubbles } from './dynamic-bubbles'

export function HeroSection() {
    const [url, setUrl] = useState('')

    return (
        <section className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-background pt-20 lg:pt-0">
            {/* Gradient Mesh Background */}
            <div className="absolute inset-0 z-0 opacity-40">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-electric-indigo blur-[120px] animate-pulse-glow" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-deep-purple blur-[120px] animate-pulse-glow delay-1000" />
                <div className="absolute top-[20%] right-[20%] w-[20%] h-[20%] rounded-full bg-neon-cyan blur-[100px] animate-float" />
            </div>

            {/* Grid Pattern Overlay */}
            <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

            <div className="container relative z-10 px-4 md:px-6 mx-auto grid lg:grid-cols-2 gap-12 items-center">

                {/* Left Content */}
                <div className="flex flex-col space-y-8 text-center lg:text-left">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="space-y-4"
                    >
                        <div className="inline-flex items-center rounded-full border border-electric-indigo/30 bg-electric-indigo/10 px-3 py-1 text-sm font-medium text-electric-indigo backdrop-blur-sm">
                            <Sparkles className="mr-2 h-4 w-4" />
                            <span>Yapay Zeka Devrimi Başladı</span>
                        </div>

                        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl xl:text-6xl/none text-white">
                            Web Sitenizi <span className="text-electric-indigo">30 Saniyede</span> Akıllı Bir Yapay Zeka Müşteri Temsilcisine Dönüştürün
                        </h1>

                        <p className="max-w-[600px] text-gray-400 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed mx-auto lg:mx-0">
                            Müşterileriniz beklemeyi sevmez. Kodlama veya teknik bilgiye gerek kalmadan, sadece web site adresinizi girin; Google Gemini teknolojisiyle çalışan asistanınız saniyeler içinde hazır olsun.
                        </p>
                    </motion.div>

                    {/* Input & CTA */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="flex flex-col sm:flex-row gap-3 w-full max-w-xl mx-auto lg:mx-0"
                    >
                        <div className="relative flex-1 h-12 rounded-xl overflow-hidden p-[2px] group">
                            {/* Spinning Gradient Outline */}
                            <div className="absolute inset-[-100%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#6366f1_0%,#06b6d4_50%,#6366f1_100%)]" />

                            {/* Input Content */}
                            <div className="relative w-full h-full bg-white rounded-[10px] flex items-center z-10">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-electric-indigo">
                                    <Globe className="h-5 w-5" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="www.siteniz.com"
                                    className="w-full h-full pl-12 pr-4 rounded-[10px] bg-transparent text-gray-900 placeholder:text-gray-400 focus:outline-none text-lg font-medium"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                />
                            </div>
                        </div>
                        <Button variant="glow" size="lg" className="h-12 px-8">
                            Asistanımı Oluştur
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </motion.div>

                    {/* Trust Signals */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="flex flex-wrap justify-center lg:justify-start gap-4 text-sm text-gray-400"
                    >
                        <div className="flex items-center gap-1">
                            <CheckCircle2 className="h-4 w-4 text-neon-cyan" />
                            <span>Kredi kartı gerekmez</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <CheckCircle2 className="h-4 w-4 text-neon-cyan" />
                            <span>14 Gün Ücretsiz Deneme</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <CheckCircle2 className="h-4 w-4 text-neon-cyan" />
                            <span>2 Dakikada Kurulum</span>
                        </div>
                    </motion.div>
                </div>

                {/* Right Content - 3D Mascot Placeholder */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                    className="relative hidden lg:flex items-center justify-center"
                >
                    {/* Abstract 3D Representation */}
                    <div className="relative w-[600px] h-[600px] flex items-center justify-center">

                        {/* Warping Background Blob */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-[500px] h-[500px] bg-gradient-to-tr from-electric-indigo/30 to-deep-purple/30 rounded-full blur-3xl animate-[spin_10s_linear_infinite]" style={{ borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%' }} />
                            <div className="absolute w-[400px] h-[400px] bg-gradient-to-bl from-neon-cyan/20 to-vibrant-coral/20 rounded-full blur-3xl animate-[spin_15s_linear_infinite_reverse]" style={{ borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' }} />
                        </div>

                        {/* Main Orb (Mascot Body) */}
                        <div className="relative w-64 h-64 z-20 animate-float">
                            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-electric-indigo to-deep-purple shadow-[0_0_100px_rgba(99,102,241,0.5)] flex items-center justify-center">
                                <div className="w-56 h-56 rounded-full bg-black/20 backdrop-blur-md border border-white/10 flex items-center justify-center overflow-hidden relative">
                                    {/* Reflection */}
                                    <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/10 to-transparent rounded-t-full" />

                                    {/* Face */}
                                    <div className="flex gap-8 z-10">
                                        <motion.div
                                            animate={{ scaleY: [1, 0.1, 1, 1, 1] }}
                                            transition={{ duration: 4, repeat: Infinity, times: [0, 0.05, 0.1, 0.8, 1] }}
                                            className="w-12 h-16 bg-neon-cyan rounded-full shadow-[0_0_20px_#06b6d4]"
                                        />
                                        <motion.div
                                            animate={{ scaleY: [1, 0.1, 1, 1, 1] }}
                                            transition={{ duration: 4, repeat: Infinity, times: [0, 0.05, 0.1, 0.8, 1] }}
                                            className="w-12 h-16 bg-neon-cyan rounded-full shadow-[0_0_20px_#06b6d4]"
                                        />
                                    </div>

                                    {/* Mouth (Subtle Smile) */}
                                    <div className="absolute bottom-12 w-12 h-2 bg-black/30 rounded-full blur-sm" />
                                </div>
                            </div>
                        </div>

                        {/* Orbiting Elements (Rings) */}
                        <div className="absolute inset-0 m-auto w-[400px] h-[400px] border border-white/10 rounded-full animate-[spin_20s_linear_infinite] z-10" style={{ transform: 'rotateX(60deg)' }} />
                        <div className="absolute inset-0 m-auto w-[500px] h-[500px] border border-white/5 rounded-full animate-[spin_25s_linear_infinite_reverse] z-10" style={{ transform: 'rotateY(60deg)' }} />

                        {/* Floating Feature Bubbles */}
                        <DynamicBubbles />
                    </div>
                </motion.div>
            </div >
        </section >
    )
}
