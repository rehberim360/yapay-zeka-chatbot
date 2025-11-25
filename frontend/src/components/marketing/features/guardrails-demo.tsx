"use client"

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldAlert, CheckCircle, XCircle, AlertTriangle, Bot, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const SCENARIOS = [
    {
        id: 'competitor',
        title: 'Rakip Karşılaştırması',
        icon: AlertTriangle,
        color: 'text-yellow-400',
        question: "X firması sizden daha ucuz, neden onları seçmeyeyim?",
        analysis: "Rakip ismi tespit edildi. Karalama politikası engellendi.",
        response: "Fiyatlandırma politikamız sunduğumuz premium özellikler ve 7/24 destek hizmetimize göre optimize edilmiştir. Rakiplerimiz hakkında yorum yapmam doğru olmaz, ancak size kendi avantajlarımızdan bahsedebilirim..."
    },
    {
        id: 'pii',
        title: 'Kişisel Veri İsteği',
        icon: ShieldAlert,
        color: 'text-red-400',
        question: "Bana son müşterinizin telefon numarasını verir misin?",
        analysis: "Hassas veri (PII) talebi tespit edildi. Paylaşım engellendi.",
        response: "Üzgünüm, müşterilerimizin gizliliği bizim için en önemli önceliktir. Kişisel verileri (KVKK gereği) paylaşmam mümkün değildir."
    },
    {
        id: 'hallucination',
        title: 'Olmayan Özellik',
        icon: XCircle,
        color: 'text-orange-400',
        question: "Sitenizde uçak bileti de satılıyor mu?",
        analysis: "Veri tabanında eşleşmeyen hizmet. Halüsinasyon engellendi.",
        response: "Şu anda sadece otel rezervasyon hizmeti sunmaktayız. Uçak bileti satışımız bulunmamaktadır."
    }
]

export function GuardrailsDemo() {
    const [activeScenario, setActiveScenario] = useState(SCENARIOS[0])
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [showResponse, setShowResponse] = useState(false)

    const handleScenarioClick = (scenario: typeof SCENARIOS[0]) => {
        if (isAnalyzing) return
        setActiveScenario(scenario)
        setIsAnalyzing(true)
        setShowResponse(false)

        // Simulate analysis delay
        setTimeout(() => {
            setIsAnalyzing(false)
            setShowResponse(true)
        }, 1500)
    }

    return (
        <section className="py-24 bg-black/50">
            <div className="container px-4 mx-auto">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-3xl md:text-5xl font-bold text-white">Sınırları Zorlayın</h2>
                    <p className="text-gray-400">Botu manipüle etmeye çalışın ve güvenlik protokollerinin nasıl devreye girdiğini izleyin.</p>
                </div>

                <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">

                    {/* Scenarios List */}
                    <div className="lg:col-span-4 space-y-4">
                        {SCENARIOS.map((scenario) => (
                            <button
                                key={scenario.id}
                                onClick={() => handleScenarioClick(scenario)}
                                className={cn(
                                    "w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 text-left group",
                                    activeScenario.id === scenario.id
                                        ? "bg-emerald-500/10 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                                        : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                                )}
                            >
                                <div className={cn("p-2 rounded-lg bg-white/5", scenario.color)}>
                                    <scenario.icon className="w-6 h-6" />
                                </div>
                                <div>
                                    <div className="font-bold text-white group-hover:text-emerald-400 transition-colors">
                                        {scenario.title}
                                    </div>
                                    <div className="text-xs text-gray-500">Güvenlik Protokolü Testi</div>
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Interactive Demo Area */}
                    <div className="lg:col-span-8">
                        <div className="relative bg-gray-900 rounded-3xl border border-white/10 overflow-hidden min-h-[500px] flex flex-col">

                            {/* Header */}
                            <div className="bg-gray-800/50 p-4 border-b border-white/10 flex items-center justify-between backdrop-blur-md">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-sm text-gray-400 font-mono">Guardrails Active</span>
                                </div>
                                <ShieldAlert className="w-5 h-5 text-emerald-500" />
                            </div>

                            {/* Chat Content */}
                            <div className="flex-1 p-6 space-y-8 overflow-y-auto bg-gradient-to-b from-gray-900 to-black">

                                {/* User Question */}
                                <motion.div
                                    key={activeScenario.id + '-question'}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex gap-4 flex-row-reverse"
                                >
                                    <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center shrink-0">
                                        <User className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="bg-gray-800 rounded-2xl rounded-tr-none p-4 text-white max-w-[80%] border border-white/5">
                                        {activeScenario.question}
                                    </div>
                                </motion.div>

                                {/* Analysis Phase */}
                                <AnimatePresence mode="wait">
                                    {isAnalyzing && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="flex justify-center"
                                        >
                                            <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-full px-4 py-2 flex items-center gap-2 text-emerald-400 text-sm font-mono">
                                                <div className="w-4 h-4 border-2 border-emerald-500/50 border-t-emerald-500 rounded-full animate-spin" />
                                                Güvenlik Taraması Yapılıyor...
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Bot Response & Security Log */}
                                {showResponse && (
                                    <div className="space-y-4">
                                        {/* Security Log (Internal Thought) */}
                                        <motion.div
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="ml-14 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-xs font-mono flex items-start gap-2"
                                        >
                                            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                                            <div>
                                                <span className="font-bold block mb-1">SECURITY LOG:</span>
                                                {activeScenario.analysis}
                                            </div>
                                        </motion.div>

                                        {/* Safe Response */}
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.2 }}
                                            className="flex gap-4"
                                        >
                                            <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center shrink-0">
                                                <Bot className="w-6 h-6 text-white" />
                                            </div>
                                            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl rounded-tl-none p-4 text-emerald-100 max-w-[90%]">
                                                {activeScenario.response}
                                            </div>
                                        </motion.div>
                                    </div>
                                )}

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
