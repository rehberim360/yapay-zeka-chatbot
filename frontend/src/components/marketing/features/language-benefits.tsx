"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { Plane, ShoppingBag, Headphones, Globe } from 'lucide-react'

const benefits = [
    {
        title: "Turizm & Otelcilik",
        description: "Yabancı misafirlerinizle kendi dillerinde konuşun. Rezervasyonları artırın, yanlış anlaşılmaları önleyin.",
        icon: Plane,
        color: "text-blue-400",
        bg: "bg-blue-500/10",
        border: "border-blue-500/20"
    },
    {
        title: "E-İhracat",
        description: "Ürünlerinizi dünyaya satarken dil bariyerine takılmayın. Müşteri sorularını anında yanıtlayın.",
        icon: ShoppingBag,
        color: "text-green-400",
        bg: "bg-green-500/10",
        border: "border-green-500/20"
    },
    {
        title: "7/24 Global Destek",
        description: "Farklı zaman dilimlerindeki müşterilerinize uyumadan hizmet verin. Destek maliyetlerinizi düşürün.",
        icon: Headphones,
        color: "text-purple-400",
        bg: "bg-purple-500/10",
        border: "border-purple-500/20"
    },
    {
        title: "SEO Uyumlu Çeviri",
        description: "Botumuz sadece sohbet etmez, sitenizin çok dilli yapısına katkı sağlayarak global SEO'nuzu güçlendirir.",
        icon: Globe,
        color: "text-orange-400",
        bg: "bg-orange-500/10",
        border: "border-orange-500/20"
    }
]

export function LanguageBenefits() {
    return (
        <section className="py-24 bg-black relative overflow-hidden">
            {/* Background Gradient */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black via-electric-indigo/5 to-black pointer-events-none" />

            <div className="container px-4 mx-auto relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Neden Çoklu Dil?</h2>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        Sadece çeviri değil, kültürel adaptasyon. İşletmenizi yerel bir oyuncudan global bir markaya dönüştürün.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {benefits.map((benefit, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ y: -10 }}
                            className={`p-8 rounded-3xl border backdrop-blur-sm ${benefit.bg} ${benefit.border} group`}
                        >
                            <div className={`w-12 h-12 rounded-xl mb-6 flex items-center justify-center bg-black/20 ${benefit.color}`}>
                                <benefit.icon className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">{benefit.title}</h3>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                {benefit.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
