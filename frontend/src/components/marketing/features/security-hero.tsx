"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { Shield, Lock, ShieldCheck } from 'lucide-react'
import { MascotLogo } from '@/components/ui/mascot-logo'

export function SecurityHero() {
    return (
        <section className="relative min-h-[80vh] w-full flex items-center justify-center overflow-hidden bg-black pt-20">
            {/* Background Effects */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse-glow" />
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
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-sm text-emerald-400 text-sm font-medium">
                        <ShieldCheck className="w-4 h-4" />
                        <span>Enterprise Grade Security</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white leading-tight">
                        Markanız Güvende. <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                            Sınırları Siz Belirleyin.
                        </span>
                    </h1>

                    <p className="text-xl text-gray-400 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                        Yapay zeka halüsinasyonlarına ve istenmeyen sohbetlere son. Guardrails teknolojimizle botunuz sadece sizin belirlediğiniz kurallar çerçevesinde konuşur.
                    </p>
                </motion.div>

                {/* Right Visual: Shielded Mascot */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="relative flex items-center justify-center h-[400px] lg:h-[600px] mt-8 lg:mt-0"
                >
                    <div className="relative w-full max-w-[400px] lg:max-w-[600px] aspect-square flex items-center justify-center">

                        {/* Shield Force Field */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            {/* Outer Shield Ring */}
                            <div className="absolute w-[280px] h-[280px] lg:w-[450px] lg:h-[450px] rounded-full border border-emerald-500/30 animate-[spin_10s_linear_infinite]" />
                            <div className="absolute w-[260px] h-[260px] lg:w-[430px] lg:h-[430px] rounded-full border-2 border-dashed border-emerald-500/20 animate-[spin_15s_linear_infinite_reverse]" />

                            {/* Glowing Shield Surface */}
                            <div className="absolute w-[300px] h-[300px] lg:w-[480px] lg:h-[480px] rounded-full bg-emerald-500/5 blur-md border border-emerald-500/10" />
                        </div>

                        {/* Incoming Threats (Blocked) Animation */}
                        {[0, 72, 144, 216, 288].map((angle, i) => (
                            <motion.div
                                key={i}
                                className="absolute w-full h-full flex items-center justify-center pointer-events-none"
                                style={{ rotate: angle }}
                            >
                                <motion.div
                                    animate={{
                                        x: [250, 180], // Move towards center but stop at shield
                                        opacity: [0, 1, 0],
                                        scale: [0.5, 1, 0]
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        delay: i * 0.4,
                                        ease: "easeIn"
                                    }}
                                    className="absolute right-0 w-2 h-2 bg-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.8)]"
                                />
                                {/* Impact Ripple on Shield */}
                                <motion.div
                                    animate={{
                                        opacity: [0, 0.5, 0],
                                        scale: [1, 1.2],
                                    }}
                                    transition={{
                                        duration: 0.5,
                                        repeat: Infinity,
                                        delay: i * 0.4 + 1.8, // Sync with impact
                                    }}
                                    className="absolute right-[180px] w-8 h-8 rounded-full border border-emerald-400/50"
                                />
                            </motion.div>
                        ))}

                        {/* Mascot Center */}
                        <div className="relative z-20 animate-float">
                            <MascotLogo size="xl" />

                            {/* Shield Icon Badge */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                transition={{ delay: 1, duration: 0.5 }}
                                className="absolute -bottom-4 -right-4 bg-emerald-500 text-white p-3 rounded-2xl shadow-lg flex items-center gap-2 z-30 border-4 border-black/20"
                            >
                                <Shield className="w-6 h-6" />
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold uppercase opacity-80 leading-none">Status</span>
                                    <span className="text-sm font-bold leading-none">Protected</span>
                                </div>
                            </motion.div>
                        </div>

                    </div>
                </motion.div>
            </div>
        </section>
    )
}
