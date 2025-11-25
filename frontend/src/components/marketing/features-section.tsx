"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { Brain, Globe, Shield, Smile, Clock, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

export function FeaturesSection() {
    return (
        <section className="py-24 bg-background relative overflow-hidden">
            <div className="container px-4 md:px-6 mx-auto">

                <div className="text-center max-w-3xl mx-auto mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-4xl font-bold mb-4 text-white"
                    >
                        Gücünü <span className="text-electric-indigo">Google Gemini AI</span>'dan Alır
                    </motion.h2>
                    <p className="text-gray-400">
                        En son yapay zeka teknolojileriyle donatılmış altyapımız, işletmenizi geleceğe taşır.
                    </p>
                </div>

                {/* Bento Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[minmax(200px,auto)]">

                    {/* Feature 1: Gemini AI (Large) */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="md:col-span-2 row-span-2 rounded-3xl bg-gradient-to-br from-electric-indigo/20 to-deep-purple/20 border border-white/10 p-8 relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-electric-indigo/30 rounded-full blur-[80px] -mr-16 -mt-16" />

                        <div className="relative z-10 h-full flex flex-col justify-between">
                            <div>
                                <div className="w-12 h-12 rounded-xl bg-electric-indigo/20 flex items-center justify-center mb-4 text-electric-indigo">
                                    <Brain className="w-6 h-6" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">Google Gemini Altyapısı</h3>
                                <p className="text-gray-400 max-w-md">
                                    Dünyanın en gelişmiş dil modellerinden biri olan Gemini ile müşterilerinizi şaşırtacak kadar doğal ve akıllı cevaplar.
                                </p>
                            </div>

                            {/* Visual Representation */}
                            <div className="mt-8 p-4 bg-black/20 rounded-xl border border-white/5 backdrop-blur-sm">
                                <div className="flex items-center gap-3 mb-3">
                                    <Sparkles className="w-4 h-4 text-neon-cyan" />
                                    <span className="text-xs text-neon-cyan font-mono">AI PROCESSING</span>
                                </div>
                                <div className="space-y-2">
                                    <div className="h-2 bg-white/10 rounded-full w-3/4 animate-pulse" />
                                    <div className="h-2 bg-white/10 rounded-full w-1/2 animate-pulse delay-75" />
                                    <div className="h-2 bg-white/10 rounded-full w-5/6 animate-pulse delay-150" />
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Feature 2: Multi-language */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="rounded-3xl bg-white/5 border border-white/10 p-6 hover:bg-white/10 transition-colors group"
                    >
                        <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center mb-4 text-blue-400">
                            <Globe className="w-5 h-5" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Çoklu Dil Desteği</h3>
                        <p className="text-sm text-gray-400">
                            Siteniz Türkçe, müşteriniz İngilizce konuşsun; botunuz anında çeviri yapar.
                        </p>
                        <div className="mt-4 flex gap-2">
                            <span className="text-xs px-2 py-1 rounded bg-white/10 text-gray-300">TR</span>
                            <span className="text-xs px-2 py-1 rounded bg-white/10 text-gray-300">EN</span>
                            <span className="text-xs px-2 py-1 rounded bg-white/10 text-gray-300">DE</span>
                            <span className="text-xs px-2 py-1 rounded bg-white/10 text-gray-300">+40</span>
                        </div>
                    </motion.div>

                    {/* Feature 3: Hallucination Protection */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="rounded-3xl bg-white/5 border border-white/10 p-6 hover:bg-white/10 transition-colors group"
                    >
                        <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center mb-4 text-green-400">
                            <Shield className="w-5 h-5" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Halüsinasyon Koruması</h3>
                        <p className="text-sm text-gray-400">
                            Sitenizde olmayan bilgiyi uydurmaz. Sadece doğrulanmış verileri kullanır.
                        </p>
                    </motion.div>

                    {/* Feature 4: Brand Personality */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                        className="rounded-3xl bg-white/5 border border-white/10 p-6 hover:bg-white/10 transition-colors group"
                    >
                        <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center mb-4 text-orange-400">
                            <Smile className="w-5 h-5" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Marka Kişiliği</h3>
                        <p className="text-sm text-gray-400 mb-4">
                            Botunuz ister "Kurumsal", ister "Samimi" olsun.
                        </p>
                        <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full w-1/2 bg-orange-400 rounded-full" />
                        </div>
                        <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                            <span>Resmi</span>
                            <span>Samimi</span>
                        </div>
                    </motion.div>

                    {/* Feature 5: Time Awareness */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4 }}
                        className="md:col-span-2 rounded-3xl bg-white/5 border border-white/10 p-6 hover:bg-white/10 transition-colors flex items-center justify-between group"
                    >
                        <div>
                            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center mb-4 text-purple-400">
                                <Clock className="w-5 h-5" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Zaman Algısı</h3>
                            <p className="text-sm text-gray-400 max-w-xs">
                                "Şu an açık mısınız?" sorusuna, çalışma saatlerinize bakarak doğru cevap verir.
                            </p>
                        </div>
                        <div className="hidden sm:block bg-black/20 p-4 rounded-xl border border-white/5">
                            <div className="text-2xl font-mono text-white font-bold">09:00 - 18:00</div>
                            <div className="text-xs text-green-400 mt-1 flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                Şu an Açık
                            </div>
                        </div>
                    </motion.div>

                </div>
            </div>
        </section>
    )
}
