"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { Stethoscope, Home, Utensils, ShoppingBag, Scale, MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export function UniversalAdaptabilitySection() {
    const sectors = [
        {
            id: "health",
            title: "Sağlık & Klinik",
            description: "Doktor randevusu oluşturur, tedavi süreçleri hakkında bilgi verir.",
            botMessage: "Merhaba! Dr. Ahmet Bey için randevu oluşturmamı ister misiniz?",
            icon: Stethoscope,
            color: "text-red-400",
            bg: "bg-red-500/10",
            border: "border-red-500/20",
            hoverBorder: "group-hover:border-red-500/50"
        },
        {
            id: "real-estate",
            title: "Emlak & Gayrimenkul",
            description: "Portföyünüzdeki daireleri sunar, potansiyel müşteri formu (Lead) toplar.",
            botMessage: "3+1 deniz manzaralı dairelerimizi görmek ister misiniz?",
            icon: Home,
            color: "text-blue-400",
            bg: "bg-blue-500/10",
            border: "border-blue-500/20",
            hoverBorder: "group-hover:border-blue-500/50"
        },
        {
            id: "restaurant",
            title: "Restoran & Cafe",
            description: "Menüyü tanıtır, masa rezervasyonu yapar veya paket sipariş alır.",
            botMessage: "Bu akşam için 2 kişilik masa ayırtayım mı?",
            icon: Utensils,
            color: "text-orange-400",
            bg: "bg-orange-500/10",
            border: "border-orange-500/20",
            hoverBorder: "group-hover:border-orange-500/50"
        },
        {
            id: "ecommerce",
            title: "E-Ticaret",
            description: "Ürün stoklarını bilir, kargo durumunu sorgular ve satışa yönlendirir.",
            botMessage: "Aradığınız spor ayakkabıda %20 indirim var! İncelemek ister misiniz?",
            icon: ShoppingBag,
            color: "text-purple-400",
            bg: "bg-purple-500/10",
            border: "border-purple-500/20",
            hoverBorder: "group-hover:border-purple-500/50"
        },
        {
            id: "law",
            title: "Hukuk & Danışmanlık",
            description: "Hukuki tavsiye vermeden genel süreçleri anlatır ve ön görüşme ayarlar.",
            botMessage: "Boşanma davaları süreçleri hakkında genel bilgi verebilirim.",
            icon: Scale,
            color: "text-yellow-400",
            bg: "bg-yellow-500/10",
            border: "border-yellow-500/20",
            hoverBorder: "group-hover:border-yellow-500/50"
        }
    ]

    return (
        <section className="py-24 bg-background relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 -left-64 w-96 h-96 bg-electric-indigo/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-1/4 -right-64 w-96 h-96 bg-neon-cyan/10 rounded-full blur-[100px]" />
            </div>

            <div className="container px-4 md:px-6 mx-auto relative z-10">

                <div className="text-center max-w-3xl mx-auto mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-4xl font-bold mb-4 text-white"
                    >
                        Her Sektörün <span className="text-neon-cyan">Dilinden Anlar.</span>
                    </motion.h2>
                    <p className="text-gray-400">
                        İşletmeniz ne olursa olsun, yapay zeka asistanınız sektörünüze özel terminolojiye ve süreçlere hakimdir.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sectors.map((sector, index) => (
                        <motion.div
                            key={sector.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className={cn(
                                "group relative p-6 rounded-2xl border bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all duration-300",
                                sector.border,
                                sector.hoverBorder
                            )}
                        >
                            {/* Icon & Title */}
                            <div className="flex items-center gap-4 mb-4">
                                <div className={cn("p-3 rounded-xl", sector.bg, sector.color)}>
                                    <sector.icon className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-semibold text-white">{sector.title}</h3>
                            </div>

                            {/* Description */}
                            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                                {sector.description}
                            </p>

                            {/* Chat Bubble Interaction */}
                            <div className="relative h-16">
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    whileHover={{ opacity: 1, y: 0, scale: 1 }}
                                    className="absolute inset-0 flex items-center"
                                >
                                    <div className="bg-slate-800 border border-slate-700 rounded-lg rounded-tl-none p-3 shadow-xl w-full">
                                        <div className="flex items-start gap-3">
                                            <div className="min-w-[24px] h-6 rounded-full bg-gradient-to-br from-electric-indigo to-deep-purple flex items-center justify-center">
                                                <MessageCircle className="w-3 h-3 text-white" />
                                            </div>
                                            <p className="text-xs text-gray-300 italic">
                                                "{sector.botMessage}"
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Default State (Call to Action) */}
                                <div className="absolute inset-0 flex items-center text-sm text-gray-500 group-hover:opacity-0 transition-opacity duration-200">
                                    <span className="flex items-center gap-2">
                                        Örnek diyaloğu gör <span className="text-lg">→</span>
                                    </span>
                                </div>
                            </div>

                        </motion.div>
                    ))}
                </div>

            </div>
        </section>
    )
}
