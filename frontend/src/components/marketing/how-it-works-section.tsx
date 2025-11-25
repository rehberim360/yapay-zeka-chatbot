"use client"

import React, { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Search, ScanLine, MessageSquare, Check, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

export function HowItWorksSection() {
    const containerRef = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    })

    const steps = [
        {
            id: 1,
            title: "Adresi Girin",
            description: "Web sitenizin linkini yapıştırın. Sistemimiz sitenizi bir insan gibi okur ve analiz eder.",
            icon: Search,
            color: "text-blue-400",
            bg: "bg-blue-500/10",
            border: "border-blue-500/20",
            visual: (
                <div className="relative w-full h-48 bg-slate-900 rounded-lg border border-slate-800 overflow-hidden flex flex-col">
                    {/* Browser Bar */}
                    <div className="h-8 bg-slate-800 flex items-center px-3 gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500" />
                        <div className="w-2 h-2 rounded-full bg-yellow-500" />
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <div className="flex-1 h-5 bg-slate-900 rounded-md mx-2 flex items-center px-2 text-[10px] text-slate-400 font-mono">
                            <motion.span
                                initial={{ width: 0 }}
                                whileInView={{ width: "auto" }}
                                transition={{ duration: 2, ease: "linear" }}
                                className="overflow-hidden whitespace-nowrap"
                            >
                                www.siteniz.com
                            </motion.span>
                            <motion.span
                                animate={{ opacity: [0, 1, 0] }}
                                transition={{ duration: 0.8, repeat: Infinity }}
                                className="w-[2px] h-3 bg-blue-500 ml-0.5"
                            />
                        </div>
                    </div>
                    {/* Content */}
                    <div className="flex-1 p-4 flex items-center justify-center">
                        <div className="text-slate-600 text-sm">Site Yükleniyor...</div>
                    </div>
                </div>
            )
        },
        {
            id: 2,
            title: "Akıllı Tarama (Smart Discovery)",
            description: "Yapay zeka; hizmetlerinizi, ürünlerinizi, menünüzü ve fiyatlarınızı otomatik olarak öğrenir. Sektörünüzü algılar.",
            icon: ScanLine,
            color: "text-purple-400",
            bg: "bg-purple-500/10",
            border: "border-purple-500/20",
            visual: (
                <div className="relative w-full h-48 bg-slate-900 rounded-lg border border-slate-800 overflow-hidden flex flex-col p-4 gap-2">
                    {/* Scanning Effect */}
                    <motion.div
                        className="absolute top-0 left-0 w-full h-1 bg-neon-cyan shadow-[0_0_20px_#06b6d4] z-10"
                        animate={{ top: ["0%", "100%", "0%"] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    />

                    {/* Mock Data Items */}
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-8 bg-slate-800 rounded flex items-center px-3 justify-between">
                            <div className="w-1/3 h-2 bg-slate-700 rounded" />
                            <motion.div
                                initial={{ opacity: 0, x: 10 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.5 }}
                                className="flex items-center gap-1 text-[10px] text-green-400"
                            >
                                <Check className="w-3 h-3" />
                                <span>Veri Alındı</span>
                            </motion.div>
                        </div>
                    ))}
                </div>
            )
        },
        {
            id: 3,
            title: "Botunuz Hazır!",
            description: "Marka tonunuza uygun, güvenlik kuralları tanımlanmış asistanınızı hemen sitenize ekleyin.",
            icon: Sparkles,
            color: "text-green-400",
            bg: "bg-green-500/10",
            border: "border-green-500/20",
            visual: (
                <div className="relative w-full h-48 bg-slate-900 rounded-lg border border-slate-800 overflow-hidden flex items-center justify-center">
                    {/* Chat Window */}
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0, y: 20 }}
                        whileInView={{ scale: 1, opacity: 1, y: 0 }}
                        transition={{ type: "spring", bounce: 0.5 }}
                        className="w-48 bg-white rounded-lg shadow-xl overflow-hidden"
                    >
                        <div className="h-8 bg-electric-indigo flex items-center px-3 text-white text-xs font-bold">
                            Canlı Destek
                        </div>
                        <div className="p-3 space-y-2">
                            <div className="bg-slate-100 p-2 rounded-lg rounded-tl-none text-[10px] text-slate-600">
                                Merhaba! Size nasıl yardımcı olabilirim? 👋
                            </div>
                            <div className="flex justify-end">
                                <div className="bg-electric-indigo p-2 rounded-lg rounded-tr-none text-[10px] text-white">
                                    Fiyatlarınız nedir?
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Thumbs Up Mascot (Simplified) */}
                    <motion.div
                        className="absolute -right-4 -bottom-4 w-20 h-20 bg-neon-cyan rounded-full blur-xl opacity-20"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    />
                </div>
            )
        }
    ]

    return (
        <section ref={containerRef} className="relative py-24 bg-background overflow-hidden">
            <div className="container px-4 md:px-6 mx-auto">

                {/* Section Header */}
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400"
                    >
                        Kod Yazmak Yok. Eğitim Vermek Yok. <br />
                        <span className="text-electric-indigo">Sadece Sihir Var. ✨</span>
                    </motion.h2>
                    <p className="text-gray-400">
                        Geliştirdiğimiz "Smart Onboarding" teknolojisi sayesinde dakikalar içinde sitenizi analiz eder ve botunuzu oluştururuz.
                    </p>
                </div>

                {/* Steps Timeline */}
                <div className="relative">
                    {/* Vertical Line */}
                    <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-electric-indigo/50 to-transparent hidden md:block" />

                    <div className="space-y-24">
                        {steps.map((step, index) => (
                            <motion.div
                                key={step.id}
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ duration: 0.5, delay: index * 0.2 }}
                                className={cn(
                                    "flex flex-col md:flex-row gap-8 items-center",
                                    index % 2 === 1 ? "md:flex-row-reverse" : ""
                                )}
                            >
                                {/* Text Content */}
                                <div className="flex-1 text-center md:text-left">
                                    <div className={cn(
                                        "inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 border",
                                        step.bg, step.border, step.color
                                    )}>
                                        <step.icon className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-2xl font-bold mb-2 text-white">{step.title}</h3>
                                    <p className="text-gray-400">{step.description}</p>
                                </div>

                                {/* Center Node (Desktop) */}
                                <div className="relative hidden md:flex items-center justify-center w-8">
                                    <div className={cn("w-4 h-4 rounded-full border-2 bg-background z-10", step.border.replace('border-', 'border-'))} />
                                </div>

                                {/* Visual Content */}
                                <div className="flex-1 w-full">
                                    <div className={cn(
                                        "relative rounded-2xl border bg-white/5 backdrop-blur-sm p-2 overflow-hidden group hover:border-electric-indigo/50 transition-colors",
                                        step.border
                                    )}>
                                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                        {step.visual}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

            </div>
        </section>
    )
}
