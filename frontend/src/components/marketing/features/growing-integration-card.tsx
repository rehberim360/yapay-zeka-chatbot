"use client"

import React, { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { MessageCircle, Instagram, Globe, Mail, Database } from 'lucide-react'

export function GrowingIntegrationCard() {
    const containerRef = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "center center"]
    })

    const width = useTransform(scrollYProgress, [0, 1], ["80%", "100%"])
    const opacity = useTransform(scrollYProgress, [0, 1], [0.5, 1])
    const scale = useTransform(scrollYProgress, [0, 1], [0.9, 1])

    return (
        <section ref={containerRef} className="py-32 container px-4 mx-auto">
            <motion.div
                style={{ width, opacity, scale }}
                className="mx-auto bg-gradient-to-br from-white/5 to-white/0 border border-white/10 rounded-3xl p-12 md:p-24 text-center relative overflow-hidden backdrop-blur-xl"
            >
                {/* Background Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-electric-indigo/20 blur-[120px] rounded-full pointer-events-none" />

                <div className="relative z-10 space-y-8">
                    <h2 className="text-4xl md:text-6xl font-bold text-white">
                        Sadece Web Sitenizde Değil, <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-indigo to-neon-cyan">Her Yerde.</span>
                    </h2>

                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        Yakında WhatsApp ve Instagram DM entegrasyonlarıyla, müşteriniz nerede olursa olsun asistanınız orada.
                    </p>

                    {/* Floating Icons */}
                    <div className="flex flex-wrap justify-center gap-8 pt-12">
                        {[
                            { icon: Globe, label: "Web", color: "text-blue-400", delay: 0 },
                            { icon: MessageCircle, label: "WhatsApp", color: "text-green-400", delay: 0.1 },
                            { icon: Instagram, label: "Instagram", color: "text-pink-400", delay: 0.2 },
                            { icon: Mail, label: "Email", color: "text-yellow-400", delay: 0.3 },
                            { icon: Database, label: "CRM", color: "text-purple-400", delay: 0.4 },
                        ].map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ y: 20, opacity: 0 }}
                                whileInView={{ y: 0, opacity: 1 }}
                                transition={{ delay: item.delay, duration: 0.5 }}
                                whileHover={{ y: -10, scale: 1.1 }}
                                className="flex flex-col items-center gap-3"
                            >
                                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-md shadow-lg">
                                    <item.icon className={`w-8 h-8 ${item.color}`} />
                                </div>
                                <span className="text-sm font-medium text-gray-400">{item.label}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </motion.div>
        </section>
    )
}
