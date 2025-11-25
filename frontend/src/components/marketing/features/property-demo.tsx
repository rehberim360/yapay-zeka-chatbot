"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, Bot, User, MapPin, Bed, Bath, Ruler } from 'lucide-react'

// Mock Properties
const PROPERTIES = [
    {
        id: 1,
        title: "Kadıköy Moda'da Deniz Manzaralı",
        price: "35.000 TL",
        location: "Moda, Kadıköy",
        specs: { bed: "3+1", bath: "2", size: "145m²" },
        image: "🏢"
    },
    {
        id: 2,
        title: "Bağdat Caddesi Lüks Daire",
        price: "45.000 TL",
        location: "Suadiye, Kadıköy",
        specs: { bed: "4+1", bath: "3", size: "180m²" },
        image: "🏡"
    },
]

const CHAT_SEQUENCE = [
    { role: 'bot', text: "Merhaba! Hayalinizdeki evi bulmanıza yardımcı olabilirim. Ne tür bir yer arıyorsunuz?", delay: 500 },
    { role: 'user', text: "Kadıköy civarında, en az 3 odalı kiralık bir daire bakıyorum.", delay: 1500 },
    { role: 'bot', text: "Harika bir tercih! Bütçe aralığınız nedir?", delay: 3000 },
    { role: 'user', text: "Maksimum 50.000 TL olabilir.", delay: 4500 },
    { role: 'bot', text: "Kriterlerinize uygun şu portföylerimizi buldum:", delay: 6000, type: 'properties' },
]

export function PropertyDemo() {
    const [messages, setMessages] = useState<any[]>([])
    const [isTyping, setIsTyping] = useState(false)

    useEffect(() => {
        let timeoutIds: NodeJS.Timeout[] = []
        let accumulatedDelay = 0

        CHAT_SEQUENCE.forEach((msg, index) => {
            if (msg.role === 'bot') {
                const typingDelay = accumulatedDelay
                timeoutIds.push(setTimeout(() => setIsTyping(true), typingDelay))
                accumulatedDelay += 1000
            }

            const msgDelay = accumulatedDelay
            timeoutIds.push(setTimeout(() => {
                setIsTyping(false)
                setMessages(prev => [...prev, msg])
            }, msgDelay))

            accumulatedDelay += 1500
        })

        return () => timeoutIds.forEach(clearTimeout)
    }, [])

    return (
        <section className="py-24 bg-black/50">
            <div className="container px-4 mx-auto">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-3xl md:text-5xl font-bold text-white">Akıllı <span className="text-yellow-500">Portföy</span> Sunumu</h2>
                    <p className="text-gray-400">Müşterinizin ne istediğini anlar ve en uygun ilanları anında sunar.</p>
                </div>

                <div className="max-w-4xl mx-auto bg-gray-900 rounded-3xl border border-white/10 overflow-hidden shadow-2xl flex flex-col h-[600px]">

                    {/* Chat Header */}
                    <div className="bg-blue-900/30 p-4 border-b border-white/10 flex items-center gap-3 backdrop-blur-md">
                        <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-sm text-blue-100 font-medium">Emlak Danışmanı</span>
                    </div>

                    {/* Chat Area */}
                    <div className="flex-1 p-6 space-y-6 overflow-y-auto bg-gradient-to-b from-gray-900 to-black">
                        <AnimatePresence mode="popLayout">
                            {messages.map((msg, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                                >
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'bot' ? 'bg-blue-600' : 'bg-gray-700'}`}>
                                        {msg.role === 'bot' ? <Bot className="w-6 h-6 text-white" /> : <User className="w-6 h-6 text-white" />}
                                    </div>

                                    <div className="space-y-2 max-w-[90%]">
                                        {msg.text && (
                                            <div className={`p-4 rounded-2xl text-sm ${msg.role === 'bot'
                                                    ? 'bg-blue-500/10 border border-blue-500/20 text-blue-50 rounded-tl-none'
                                                    : 'bg-white/10 text-white rounded-tr-none'
                                                }`}>
                                                {msg.text}
                                            </div>
                                        )}

                                        {/* Property Cards */}
                                        {msg.type === 'properties' && (
                                            <motion.div
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                className="flex flex-col sm:flex-row gap-4 overflow-x-auto pb-2"
                                            >
                                                {PROPERTIES.map((prop) => (
                                                    <div key={prop.id} className="min-w-[260px] bg-gray-800 rounded-xl overflow-hidden border border-white/10 hover:border-yellow-500/50 transition-colors group">
                                                        {/* Image Placeholder */}
                                                        <div className="h-32 bg-gray-700 flex items-center justify-center text-5xl group-hover:scale-105 transition-transform duration-500">
                                                            {prop.image}
                                                        </div>

                                                        <div className="p-4 space-y-3">
                                                            <div className="flex justify-between items-start">
                                                                <h3 className="font-bold text-white text-sm line-clamp-1">{prop.title}</h3>
                                                                <span className="text-yellow-500 font-bold text-sm whitespace-nowrap">{prop.price}</span>
                                                            </div>

                                                            <div className="flex items-center gap-1 text-xs text-gray-400">
                                                                <MapPin className="w-3 h-3" />
                                                                {prop.location}
                                                            </div>

                                                            <div className="flex items-center justify-between text-xs text-gray-300 border-t border-white/10 pt-3">
                                                                <div className="flex items-center gap-1"><Bed className="w-3 h-3" /> {prop.specs.bed}</div>
                                                                <div className="flex items-center gap-1"><Bath className="w-3 h-3" /> {prop.specs.bath}</div>
                                                                <div className="flex items-center gap-1"><Ruler className="w-3 h-3" /> {prop.specs.size}</div>
                                                            </div>

                                                            <button className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs py-2 rounded-lg transition-colors font-medium">
                                                                Randevu Oluştur
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </motion.div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}

                            {isTyping && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                                        <Bot className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl rounded-tl-none flex gap-1 items-center h-12">
                                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </section>
    )
}
