"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { Truck, ShoppingCart, Zap, Layers } from 'lucide-react'

const features = [
    {
        title: "Kargo Takibi Otomasyonu",
        description: "'Kargom nerede?' sorularını müşteri temsilcisine gerek kalmadan, kargo firmasıyla entegre olarak anında yanıtlar.",
        icon: Truck,
        color: "text-blue-400",
        bg: "bg-blue-500/10",
        border: "border-blue-500/20"
    },
    {
        title: "Sepet Terkini Önleme",
        description: "Müşteri sepetinde ürün unuttuğunda, nazik bir hatırlatma mesajı veya özel bir indirim kodu ile satışı kurtarır.",
        icon: ShoppingCart,
        color: "text-orange-400",
        bg: "bg-orange-500/10",
        border: "border-orange-500/20"
    },
    {
        title: "Akıllı Ürün Önerileri",
        description: "Müşterinin zevkini öğrenir ve 'Bunu alanlar şunları da beğendi' mantığıyla çapraz satış (cross-sell) yapar.",
        icon: Zap,
        color: "text-yellow-400",
        bg: "bg-yellow-500/10",
        border: "border-yellow-500/20"
    },
    {
        title: "Kolay Entegrasyon",
        description: "Shopify, WooCommerce, Ticimax ve İdeasoft gibi popüler altyapılarla tek tıkla entegre olur.",
        icon: Layers,
        color: "text-purple-400",
        bg: "bg-purple-500/10",
        border: "border-purple-500/20"
    }
]

export function EcommerceFeatures() {
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
