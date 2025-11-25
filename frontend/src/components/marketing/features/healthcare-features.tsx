"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { Globe2, ShieldCheck, Clock, MessageCircleHeart } from 'lucide-react'

const features = [
    {
        title: "Medikal Turizm Desteği",
        description: "Yabancı hastalarınızla 40+ dilde anında iletişim kurun. Dil bariyerini kaldırarak hasta memnuniyetini artırın.",
        icon: Globe2,
        color: "text-blue-400",
        bg: "bg-blue-500/10",
        border: "border-blue-500/20"
    },
    {
        title: "KVKK & HIPAA Uyumlu",
        description: "Hasta verileri en yüksek güvenlik standartlarında korunur. Gizlilik protokollerine tam uyum sağlar.",
        icon: ShieldCheck,
        color: "text-teal-400",
        bg: "bg-teal-500/10",
        border: "border-teal-500/20"
    },
    {
        title: "7/24 Kesintisiz Hizmet",
        description: "Klinik kapalıyken bile hastalarınızın sorularını yanıtlayın, randevu verin ve acil durum yönlendirmesi yapın.",
        icon: Clock,
        color: "text-purple-400",
        bg: "bg-purple-500/10",
        border: "border-purple-500/20"
    },
    {
        title: "Empatik İletişim",
        description: "Soğuk robot cevapları yerine, hastalarınızın endişelerini anlayan ve güven veren bir üslupla konuşur.",
        icon: MessageCircleHeart,
        color: "text-pink-400",
        bg: "bg-pink-500/10",
        border: "border-pink-500/20"
    }
]

export function HealthcareFeatures() {
    return (
        <section className="py-24 bg-black">
            <div className="container px-4 mx-auto">
                <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className={`p-8 rounded-3xl border ${feature.border} ${feature.bg} backdrop-blur-sm hover:bg-opacity-20 transition-all duration-300 group`}
                        >
                            <div className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                <feature.icon className={`w-6 h-6 ${feature.color}`} />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                            <p className="text-gray-400 leading-relaxed">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
