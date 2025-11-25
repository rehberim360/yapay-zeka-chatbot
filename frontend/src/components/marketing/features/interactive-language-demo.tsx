"use client"

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { User, Bot } from 'lucide-react'

const languages = [
    { code: 'TR', name: 'Türkçe', flag: '🇹🇷', greeting: 'Merhaba, size nasıl yardımcı olabilirim?', user: 'Otelinizde boş oda var mı?' },
    { code: 'EN', name: 'English', flag: '🇬🇧', greeting: 'Hello, how can I help you today?', user: 'Do you have any available rooms?' },
    { code: 'DE', name: 'Deutsch', flag: '🇩🇪', greeting: 'Hallo, wie kann ich Ihnen helfen?', user: 'Haben Sie freie Zimmer?' },
    { code: 'ES', name: 'Español', flag: '🇪🇸', greeting: 'Hola, ¿cómo puedo ayudarte?', user: '¿Tienen habitaciones disponibles?' },
    { code: 'RU', name: 'Русский', flag: '🇷🇺', greeting: 'Здравствуйте, чем могу помочь?', user: 'У вас есть свободные номера?' },
    { code: 'AR', name: 'العربية', flag: '🇸🇦', greeting: 'مرحباً، كيف يمكنني مساعدتك؟', user: 'هل لديك غرف متاحة؟' },
]

export function InteractiveLanguageDemo() {
    const [activeLang, setActiveLang] = useState(languages[0])

    return (
        <section className="py-24 bg-black/50">
            <div className="container px-4 mx-auto">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-3xl md:text-5xl font-bold text-white">Deneyimleyin</h2>
                    <p className="text-gray-400">Bir dil seçin ve botun anında nasıl adapte olduğunu görün.</p>
                </div>

                <div className="grid lg:grid-cols-12 gap-12 items-start">

                    {/* Language Selector */}
                    <div className="lg:col-span-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-3 lg:gap-4">
                        {languages.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => setActiveLang(lang)}
                                className={cn(
                                    "flex items-center gap-3 lg:gap-4 p-3 lg:p-4 rounded-xl border transition-all duration-300 text-left group",
                                    activeLang.code === lang.code
                                        ? "bg-white/10 border-electric-indigo shadow-[0_0_20px_rgba(99,102,241,0.3)]"
                                        : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                                )}
                            >
                                <span className="text-xl lg:text-2xl">{lang.flag}</span>
                                <div>
                                    <div className={cn(
                                        "font-bold transition-colors text-sm lg:text-base",
                                        activeLang.code === lang.code ? "text-white" : "text-gray-400 group-hover:text-white"
                                    )}>
                                        {lang.name}
                                    </div>
                                    <div className="text-[10px] lg:text-xs text-gray-500">Native Speaker</div>
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Chat Interface */}
                    <div className="lg:col-span-8">
                        <div className="relative max-w-2xl mx-auto bg-gray-900 rounded-3xl border border-white/10 overflow-hidden shadow-2xl min-h-[400px] lg:min-h-[500px] flex flex-col">
                            {/* Chat Header */}
                            <div className="bg-gray-800/50 p-3 lg:p-4 border-b border-white/10 flex items-center gap-4 backdrop-blur-md">
                                <div className="w-2.5 h-2.5 lg:w-3 lg:h-3 rounded-full bg-red-500" />
                                <div className="w-2.5 h-2.5 lg:w-3 lg:h-3 rounded-full bg-yellow-500" />
                                <div className="w-2.5 h-2.5 lg:w-3 lg:h-3 rounded-full bg-green-500" />
                                <div className="ml-auto text-xs lg:text-sm text-gray-400 font-mono">AI Assistant • Online</div>
                            </div>

                            {/* Chat Area */}
                            <div className="flex-1 p-4 lg:p-6 space-y-4 lg:space-y-6 overflow-y-auto bg-gradient-to-b from-gray-900 to-black">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={activeLang.code + '-bot'}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ duration: 0.3 }}
                                        className="flex gap-3 lg:gap-4"
                                    >
                                        <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-electric-indigo flex items-center justify-center shrink-0">
                                            <Bot className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                                        </div>
                                        <div className="bg-white/10 rounded-2xl rounded-tl-none p-3 lg:p-4 text-sm lg:text-base text-gray-100 max-w-[85%] lg:max-w-[80%]">
                                            {activeLang.greeting}
                                        </div>
                                    </motion.div>

                                    <motion.div
                                        key={activeLang.code + '-user'}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ duration: 0.3, delay: 0.5 }} // Delay for user response simulation
                                        className="flex gap-3 lg:gap-4 flex-row-reverse"
                                    >
                                        <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-neon-cyan flex items-center justify-center shrink-0">
                                            <User className="w-5 h-5 lg:w-6 lg:h-6 text-black" />
                                        </div>
                                        <div className="bg-electric-indigo rounded-2xl rounded-tr-none p-3 lg:p-4 text-sm lg:text-base text-white max-w-[85%] lg:max-w-[80%]">
                                            {activeLang.user}
                                        </div>
                                    </motion.div>

                                    {/* Typing Indicator for next bot response */}
                                    <motion.div
                                        key={activeLang.code + '-typing'}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ delay: 1.2 }}
                                        className="flex gap-3 lg:gap-4"
                                    >
                                        <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-electric-indigo flex items-center justify-center shrink-0">
                                            <Bot className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                                        </div>
                                        <div className="bg-white/10 rounded-2xl rounded-tl-none p-3 lg:p-4 flex gap-1 items-center h-10 lg:h-12">
                                            <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                        </div>
                                    </motion.div>

                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
