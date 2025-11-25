"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, Bot, User, ChevronRight, Star } from 'lucide-react'

// Mock Products
const PRODUCTS = [
    { id: 1, name: "Yazlık Çiçekli Elbise", price: "899 TL", image: "👗", rating: 4.8 },
    { id: 2, name: "Hasır Plaj Şapkası", price: "249 TL", image: "👒", rating: 4.5 },
    { id: 3, name: "Deri Sandalet", price: "459 TL", image: "👡", rating: 4.7 },
]

const CHAT_SEQUENCE = [
    { role: 'bot', text: "Hoş geldiniz! Bugün size nasıl yardımcı olabilirim?", delay: 500 },
    { role: 'user', text: "Tatil için yazlık bir şeyler bakıyorum.", delay: 1500 },
    { role: 'bot', text: "Harika! Sizin için en popüler yaz koleksiyonumuzu listeliyorum:", delay: 3000, type: 'products' },
    { role: 'user', text: "Elbise çok güzelmiş, sepete ekler misin?", delay: 5000 },
    { role: 'bot', text: "Elbette, 'Yazlık Çiçekli Elbise' sepetinize eklendi. Yanına şu şapkayı da öneririm, çok yakışacaktır! 👒", delay: 6500, action: 'add_to_cart' }
]

export function ProductDemo() {
    const [messages, setMessages] = useState<any[]>([])
    const [isTyping, setIsTyping] = useState(false)
    const [cartCount, setCartCount] = useState(0)

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
                if (msg.action === 'add_to_cart') setCartCount(prev => prev + 1)
            }, msgDelay))

            accumulatedDelay += 1500
        })

        return () => timeoutIds.forEach(clearTimeout)
    }, [])

    return (
        <section className="py-24 bg-black/50">
            <div className="container px-4 mx-auto">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-3xl md:text-5xl font-bold text-white">Sadece Sohbet Değil, <span className="text-orange-500">Satış</span></h2>
                    <p className="text-gray-400">Botunuz ürün görsellerini gösterir, özelliklerini anlatır ve satışı kapatır.</p>
                </div>

                <div className="max-w-4xl mx-auto bg-gray-900 rounded-3xl border border-white/10 overflow-hidden shadow-2xl flex flex-col h-[600px]">

                    {/* Chat Header */}
                    <div className="bg-gray-800/50 p-4 border-b border-white/10 flex items-center justify-between backdrop-blur-md">
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-sm text-gray-300 font-medium">Mağaza Asistanı</span>
                        </div>
                        <div className="relative">
                            <ShoppingCart className="w-6 h-6 text-white" />
                            {cartCount > 0 && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute -top-2 -right-2 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                                >
                                    {cartCount}
                                </motion.div>
                            )}
                        </div>
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
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'bot' ? 'bg-orange-600' : 'bg-gray-700'}`}>
                                        {msg.role === 'bot' ? <Bot className="w-6 h-6 text-white" /> : <User className="w-6 h-6 text-white" />}
                                    </div>

                                    <div className="space-y-2 max-w-[85%]">
                                        {msg.text && (
                                            <div className={`p-4 rounded-2xl text-sm ${msg.role === 'bot'
                                                    ? 'bg-orange-500/10 border border-orange-500/20 text-orange-50 rounded-tl-none'
                                                    : 'bg-white/10 text-white rounded-tr-none'
                                                }`}>
                                                {msg.text}
                                            </div>
                                        )}

                                        {/* Product Carousel */}
                                        {msg.type === 'products' && (
                                            <motion.div
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide"
                                            >
                                                {PRODUCTS.map((product) => (
                                                    <div key={product.id} className="min-w-[160px] bg-gray-800 rounded-xl p-3 border border-white/10 hover:border-orange-500/50 transition-colors cursor-pointer group">
                                                        <div className="h-24 bg-gray-700 rounded-lg mb-3 flex items-center justify-center text-4xl group-hover:scale-110 transition-transform">
                                                            {product.image}
                                                        </div>
                                                        <div className="text-sm font-bold text-white mb-1">{product.name}</div>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-orange-400 font-bold">{product.price}</span>
                                                            <div className="flex items-center text-[10px] text-yellow-500">
                                                                <Star className="w-3 h-3 fill-current" />
                                                                {product.rating}
                                                            </div>
                                                        </div>
                                                        <button className="w-full mt-3 bg-white/10 hover:bg-orange-500 text-white text-xs py-2 rounded-lg transition-colors">
                                                            İncele
                                                        </button>
                                                    </div>
                                                ))}
                                            </motion.div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}

                            {isTyping && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                                    <div className="w-10 h-10 rounded-full bg-orange-600 flex items-center justify-center shrink-0">
                                        <Bot className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-2xl rounded-tl-none flex gap-1 items-center h-12">
                                        <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
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
