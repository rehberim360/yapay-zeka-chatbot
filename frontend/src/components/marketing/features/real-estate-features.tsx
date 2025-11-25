"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { UserCheck, CalendarDays, Map, Globe } from 'lucide-react'

const features = [
    {
        title: "Akıllı Müşteri Analizi",
        description: "Bot, potansiyel alıcıların bütçesini, zaman çizelgesini ve ihtiyaçlarını analiz ederek sadece ciddi müşterileri size yönlendirir.",
        icon: UserCheck,
        color: "text-green-400",
        bg: "bg-green-500/10",
        border: "border-green-500/20"
    },
    {
        title: "Otomatik Randevu",
        description: "Takviminizle senkronize çalışır. Müşterilerinizle uygun olduğunuz saatler için otomatik olarak yer gösterme randevusu oluşturur.",
        icon: CalendarDays,
        color: "text-blue-400",
        bg: "bg-blue-500/10",
        border: "border-blue-500/20"
    },
    {
        title: "Konum Bazlı Öneri",
        description: "'Metroya yakın', 'Deniz manzaralı' veya 'Okul bölgesinde' gibi doğal dil sorgularını anlar ve en uygun portföyleri sunar.",
        icon: Map,
        color: "text-yellow-400",
        bg: "bg-yellow-500/10",
        border: "border-yellow-500/20"
    },
    {
        title: "Yabancı Yatırımcı Desteği",
        description: "40+ dil desteği ile yabancı yatırımcılara kendi dillerinde hizmet verin ve portföyünüzü dünyaya açın.",
        icon: Globe,
        color: "text-purple-400",
        bg: "bg-purple-500/10",
        border: "border-purple-500/20"
    }
]

export function RealEstateFeatures() {
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
