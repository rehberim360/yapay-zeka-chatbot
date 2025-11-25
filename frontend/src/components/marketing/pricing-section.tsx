"use client"

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function PricingSection() {
    const [isAnnual, setIsAnnual] = useState(true)

    const plans = [
        {
            name: "Başlangıç",
            description: "Küçük işletmeler için ideal.",
            price: isAnnual ? 29 : 39,
            features: [
                "1 Chatbot",
                "1.000 Mesaj/Ay",
                "Temel Analitik",
                "E-posta Desteği",
                "Standart Entegrasyonlar"
            ],
            missing: [
                "Çoklu Dil Desteği",
                "White-label",
                "API Erişimi"
            ],
            cta: "Ücretsiz Dene",
            popular: false
        },
        {
            name: "Profesyonel",
            description: "Büyüyen işletmeler için en iyisi.",
            price: isAnnual ? 79 : 99,
            features: [
                "3 Chatbot",
                "10.000 Mesaj/Ay",
                "Gelişmiş Analitik",
                "Çoklu Dil Desteği",
                "Öncelikli Destek",
                "Tüm Entegrasyonlar"
            ],
            missing: [
                "White-label",
                "API Erişimi"
            ],
            cta: "Hemen Başla",
            popular: true
        },
        {
            name: "Ajans",
            description: "Büyük ölçekli operasyonlar için.",
            price: isAnnual ? 199 : 249,
            features: [
                "Sınırsız Chatbot",
                "Sınırsız Mesaj",
                "Gelişmiş Analitik",
                "Çoklu Dil Desteği",
                "7/24 Canlı Destek",
                "White-label",
                "API Erişimi"
            ],
            missing: [],
            cta: "İletişime Geç",
            popular: false
        }
    ]

    return (
        <section className="py-24 bg-background relative overflow-hidden">
            <div className="container px-4 md:px-6 mx-auto">

                <div className="text-center max-w-3xl mx-auto mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
                        Şeffaf Fiyatlandırma
                    </h2>
                    <p className="text-gray-400 mb-8">
                        Gizli ücret yok. İhtiyacınıza uygun paketi seçin, 14 gün ücretsiz deneyin.
                    </p>

                    {/* Billing Toggle */}
                    <div className="flex items-center justify-center gap-4">
                        <span className={cn("text-sm font-medium", !isAnnual ? "text-white" : "text-gray-400")}>Aylık</span>
                        <button
                            onClick={() => setIsAnnual(!isAnnual)}
                            className="relative w-14 h-7 bg-white/10 rounded-full p-1 transition-colors hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-electric-indigo"
                        >
                            <motion.div
                                className="w-5 h-5 bg-electric-indigo rounded-full shadow-md"
                                animate={{ x: isAnnual ? 28 : 0 }}
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            />
                        </button>
                        <span className={cn("text-sm font-medium", isAnnual ? "text-white" : "text-gray-400")}>
                            Yıllık <span className="text-neon-cyan text-xs ml-1">(%20 İndirim)</span>
                        </span>
                    </div>
                </div>

                {/* Pricing Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {plans.map((plan, index) => (
                        <motion.div
                            key={plan.name}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className={cn(
                                "relative rounded-2xl p-8 border flex flex-col",
                                plan.popular
                                    ? "bg-white/5 border-electric-indigo shadow-[0_0_30px_rgba(99,102,241,0.15)] scale-105 z-10"
                                    : "bg-white/5 border-white/10 hover:border-white/20"
                            )}
                        >
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-electric-indigo to-deep-purple text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                                    EN ÇOK TERCİH EDİLEN
                                </div>
                            )}

                            <div className="mb-8">
                                <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                                <p className="text-sm text-gray-400 mb-6 h-10">{plan.description}</p>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-bold text-white">${plan.price}</span>
                                    <span className="text-gray-400">/ay</span>
                                </div>
                                {isAnnual && (
                                    <div className="text-xs text-green-400 mt-2">
                                        Yıllık faturalandırılır (${plan.price * 12}/yıl)
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 space-y-4 mb-8">
                                {plan.features.map((feature) => (
                                    <div key={feature} className="flex items-center gap-3 text-sm text-gray-300">
                                        <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                                            <Check className="w-3 h-3 text-green-400" />
                                        </div>
                                        {feature}
                                    </div>
                                ))}
                                {plan.missing.map((feature) => (
                                    <div key={feature} className="flex items-center gap-3 text-sm text-gray-500">
                                        <div className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                                            <X className="w-3 h-3 text-gray-600" />
                                        </div>
                                        {feature}
                                    </div>
                                ))}
                            </div>

                            <Button
                                variant={plan.popular ? "glow" : "outline"}
                                className="w-full"
                            >
                                {plan.cta}
                            </Button>

                            <p className="text-xs text-center text-gray-500 mt-4">
                                Kredi kartı gerekmez
                            </p>
                        </motion.div>
                    ))}
                </div>

            </div>
        </section>
    )
}
