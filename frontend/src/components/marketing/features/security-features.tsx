"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { Shield, EyeOff, FileKey, Scale } from 'lucide-react'

const features = [
    {
        title: "Rakip Filtresi",
        description: "Botunuz rakiplerinizden bahsetmez, onları övmez veya karşılaştırma yapmaz. Sadece sizin markanıza odaklanır.",
        icon: Shield,
        color: "text-blue-400",
        bg: "bg-blue-500/10",
        border: "border-blue-500/20"
    },
    {
        title: "PII Maskeleme",
        description: "Kredi kartı, telefon numarası veya T.C. kimlik gibi hassas veriler loglanmadan önce otomatik olarak maskelenir (***).",
        icon: EyeOff,
        color: "text-purple-400",
        bg: "bg-purple-500/10",
        border: "border-purple-500/20"
    },
    {
        title: "Halüsinasyon Kalkanı",
        description: "Botunuz sadece verdiğiniz dokümanlardaki bilgileri kullanır. Bilmediği konularda uydurma cevaplar vermez.",
        icon: FileKey,
        color: "text-emerald-400",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/20"
    },
    {
        title: "Ton ve Üslup Kontrolü",
        description: "Kullanıcı ne kadar kaba olursa olsun, botunuz her zaman profesyonel, nazik ve çözüm odaklı kalır.",
        icon: Scale,
        color: "text-orange-400",
        bg: "bg-orange-500/10",
        border: "border-orange-500/20"
    }
]

export function SecurityFeatures() {
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
