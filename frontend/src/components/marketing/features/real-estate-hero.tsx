"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { Key, Home, MapPin, Building2 } from 'lucide-react'
import { MascotLogo } from '@/components/ui/mascot-logo'

export function RealEstateHero() {
    return (
        <section className="relative min-h-[80vh] w-full flex items-center justify-center overflow-hidden bg-black pt-20">
            {/* Background Effects */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-900/20 rounded-full blur-[120px] animate-pulse-glow" />
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
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-900/30 border border-blue-500/30 backdrop-blur-sm text-blue-300 text-sm font-medium">
                        <Building2 className="w-4 h-4" />
                        <span>Emlak Ofisleri İçin Dijital Asistan</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white leading-tight">
                        Portföyünüz <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-yellow-400">
                            Uyurken Bile Satış Yapsın.
                        </span>
                    </h1>

                    <p className="text-xl text-gray-400 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                        Müşterileri karşılayın, ihtiyaçlarını analiz edin ve otomatik randevu oluşturun. 7/24 çalışan en iyi emlak danışmanınız.
                    </p>
                </motion.div>

                {/* Right Visual: Real Estate Mascot */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="relative flex items-center justify-center h-[400px] lg:h-[600px] mt-8 lg:mt-0"
                >
                    <div className="relative w-full max-w-[400px] lg:max-w-[600px] aspect-square flex items-center justify-center">

                        {/* Architectural Background Elements */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            {/* Rotating Blueprint Ring */}
                            <div className="absolute w-[300px] h-[300px] lg:w-[500px] lg:h-[500px] rounded-full border border-blue-500/20 animate-[spin_30s_linear_infinite]" />
                            <div className="absolute w-[250px] h-[250px] lg:w-[400px] lg:h-[400px] border border-yellow-500/10 rotate-45" />

                            {/* Floating Icons */}
                            <motion.div
                                animate={{ y: [-15, 15, -15] }}
                                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute top-10 left-10 text-yellow-500/40"
                            >
                                <Key className="w-12 h-12 lg:w-16 lg:h-16" />
                            </motion.div>
                            <motion.div
                                animate={{ y: [15, -15, 15] }}
                                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                                className="absolute bottom-20 right-10 text-blue-500/40"
                            >
                                <Home className="w-10 h-10 lg:w-14 lg:h-14" />
                            </motion.div>
                        </div>

                        {/* Mascot Center */}
                        <div className="relative z-20 animate-float">
                            <MascotLogo size="xl" />

                            {/* Location Badge */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0, x: -20 }}
                                animate={{ opacity: 1, scale: 1, x: 0 }}
                                transition={{ delay: 1, duration: 0.5 }}
                                className="absolute -bottom-4 -left-4 bg-blue-900/80 backdrop-blur-md text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 z-30 border border-blue-500/30"
                            >
                                <div className="bg-yellow-500/20 p-2 rounded-lg">
                                    <MapPin className="w-5 h-5 text-yellow-400" />
                                </div>
                                <div>
                                    <div className="text-xs text-blue-200">Konum</div>
                                    <div className="text-sm font-bold">Kadıköy, İstanbul</div>
                                </div>
                            </motion.div>
                        </div>

                    </div>
                </motion.div>
            </div>
        </section>
    )
}
