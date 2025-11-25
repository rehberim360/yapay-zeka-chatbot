"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { Activity, Heart, Stethoscope } from 'lucide-react'
import { MascotLogo } from '@/components/ui/mascot-logo'

export function HealthcareHero() {
    return (
        <section className="relative min-h-[80vh] w-full flex items-center justify-center overflow-hidden bg-black pt-20">
            {/* Background Effects */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-teal-500/10 rounded-full blur-[120px] animate-pulse-glow" />
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
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-500/10 border border-teal-500/20 backdrop-blur-sm text-teal-400 text-sm font-medium">
                        <Activity className="w-4 h-4" />
                        <span>Sağlık Sektörü İçin Özel Çözüm</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white leading-tight">
                        Hastalarınız Beklemesin. <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400">
                            7/24 Şefkatli Asistan.
                        </span>
                    </h1>

                    <p className="text-xl text-gray-400 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                        Randevu yönetiminden ön bilgilendirmeye kadar, kliniğinizin dijital yüzünü yapay zeka ile güçlendirin. Medikal turizm için 40+ dilde anında destek.
                    </p>
                </motion.div>

                {/* Right Visual: Medical Mascot */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="relative flex items-center justify-center h-[400px] lg:h-[600px] mt-8 lg:mt-0"
                >
                    <div className="relative w-full max-w-[400px] lg:max-w-[600px] aspect-square flex items-center justify-center">

                        {/* Medical Background Elements */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            {/* Pulse Ring */}
                            <div className="absolute w-[300px] h-[300px] lg:w-[500px] lg:h-[500px] rounded-full border border-teal-500/20 animate-ping" style={{ animationDuration: '3s' }} />
                            <div className="absolute w-[250px] h-[250px] lg:w-[400px] lg:h-[400px] rounded-full border border-teal-500/10" />

                            {/* Floating Icons */}
                            <motion.div
                                animate={{ y: [0, -20, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute top-0 right-10 text-teal-500/30"
                            >
                                <Heart className="w-12 h-12 lg:w-16 lg:h-16" />
                            </motion.div>
                            <motion.div
                                animate={{ y: [0, 20, 0] }}
                                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                                className="absolute bottom-10 left-10 text-cyan-500/30"
                            >
                                <Stethoscope className="w-12 h-12 lg:w-16 lg:h-16" />
                            </motion.div>
                        </div>

                        {/* Mascot Center */}
                        <div className="relative z-20 animate-float">
                            <MascotLogo size="xl" />

                            {/* Medical Badge */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0, x: 20 }}
                                animate={{ opacity: 1, scale: 1, x: 0 }}
                                transition={{ delay: 1, duration: 0.5 }}
                                className="absolute -top-4 -right-4 bg-white text-teal-900 px-4 py-2 rounded-full shadow-lg flex items-center gap-2 z-30 border-4 border-teal-500/20"
                            >
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                <span className="text-sm font-bold">Dr. AI Online</span>
                            </motion.div>
                        </div>

                        {/* Orbiting DNA/Pulse Effect */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30 animate-[spin_20s_linear_infinite]">
                            <circle cx="50%" cy="50%" r="40%" fill="none" stroke="url(#gradient)" strokeWidth="2" strokeDasharray="10 20" />
                            <defs>
                                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#2dd4bf" />
                                    <stop offset="100%" stopColor="#06b6d4" />
                                </linearGradient>
                            </defs>
                        </svg>

                    </div>
                </motion.div>
            </div>
        </section>
    )
}
