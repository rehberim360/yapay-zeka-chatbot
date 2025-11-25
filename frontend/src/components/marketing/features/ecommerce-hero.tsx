"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { ShoppingBag, ShoppingCart, Tag, TrendingUp } from 'lucide-react'
import { MascotLogo } from '@/components/ui/mascot-logo'

export function EcommerceHero() {
    return (
        <section className="relative min-h-[80vh] w-full flex items-center justify-center overflow-hidden bg-black pt-20">
            {/* Background Effects */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-orange-500/10 rounded-full blur-[120px] animate-pulse-glow" />
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
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 backdrop-blur-sm text-orange-400 text-sm font-medium">
                        <TrendingUp className="w-4 h-4" />
                        <span>Satışlarınızı %30 Artırın</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white leading-tight">
                        Ziyaretçileri <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-500">
                            Müşteriye Dönüştürün.
                        </span>
                    </h1>

                    <p className="text-xl text-gray-400 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                        Sadece destek vermeyin, satış yapın. Yapay zeka asistanınız ürün önerir, sepet terkini engeller ve kargo sorularını otomatik yanıtlar.
                    </p>
                </motion.div>

                {/* Right Visual: Shopping Mascot */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="relative flex items-center justify-center h-[400px] lg:h-[600px] mt-8 lg:mt-0"
                >
                    <div className="relative w-full max-w-[400px] lg:max-w-[600px] aspect-square flex items-center justify-center">

                        {/* Shopping Elements Background */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            {/* Rotating Ring */}
                            <div className="absolute w-[300px] h-[300px] lg:w-[500px] lg:h-[500px] rounded-full border-2 border-dashed border-orange-500/20 animate-[spin_20s_linear_infinite]" />

                            {/* Floating Icons */}
                            <motion.div
                                animate={{ y: [-10, 10, -10], rotate: [0, 10, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute top-10 right-20 text-orange-500/40"
                            >
                                <ShoppingBag className="w-12 h-12 lg:w-16 lg:h-16" />
                            </motion.div>
                            <motion.div
                                animate={{ y: [10, -10, 10], rotate: [0, -10, 0] }}
                                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                                className="absolute bottom-20 left-10 text-pink-500/40"
                            >
                                <Tag className="w-10 h-10 lg:w-14 lg:h-14" />
                            </motion.div>
                            <motion.div
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute top-20 left-20 text-yellow-500/40"
                            >
                                <div className="text-4xl font-bold">%</div>
                            </motion.div>
                        </div>

                        {/* Mascot Center */}
                        <div className="relative z-20 animate-float">
                            <MascotLogo size="xl" />

                            {/* Sales Badge */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                transition={{ delay: 1, duration: 0.5 }}
                                className="absolute -bottom-6 -right-6 bg-gradient-to-r from-orange-500 to-pink-500 text-white p-4 rounded-2xl shadow-xl flex items-center gap-3 z-30 border-4 border-black/20"
                            >
                                <div className="bg-white/20 p-2 rounded-lg">
                                    <ShoppingCart className="w-6 h-6" />
                                </div>
                                <div>
                                    <div className="text-xs font-medium opacity-90">Sepet Tutarı</div>
                                    <div className="text-lg font-bold">₺1.250,00</div>
                                </div>
                            </motion.div>
                        </div>

                    </div>
                </motion.div>
            </div>
        </section>
    )
}
