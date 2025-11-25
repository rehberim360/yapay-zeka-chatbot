"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Clock, User, Bot, CheckCircle2, Activity } from 'lucide-react'

const CHAT_SEQUENCE = [
    { role: 'bot', text: "Merhaba! Size nasıl yardımcı olabilirim?", delay: 500 },
    { role: 'user', text: "Diş ağrım var, randevu almak istiyorum.", delay: 1500 },
    { role: 'bot', text: "Geçmiş olsun. Dr. Ayşe Yılmaz (Diş Hekimi) için yarın saat 14:00 ve 15:30 uygun. Hangisini tercih edersiniz?", delay: 3000 },
    { role: 'user', text: "14:00 uygun.", delay: 4500 },
    { role: 'bot', text: "Tamamdır, yarın 14:00 için randevunuzu oluşturdum. Geçmiş olsun dileklerimizle.", delay: 6000, action: 'confirm' }
]

export function AppointmentDemo() {
    const [messages, setMessages] = useState<any[]>([])
    const [isTyping, setIsTyping] = useState(false)
    const [appointmentStatus, setAppointmentStatus] = useState('pending') // pending, selecting, confirmed

    useEffect(() => {
        let timeoutIds: NodeJS.Timeout[] = []
        let accumulatedDelay = 0

        CHAT_SEQUENCE.forEach((msg, index) => {
            // Typing indicator before bot messages
            if (msg.role === 'bot') {
                const typingDelay = accumulatedDelay
                timeoutIds.push(setTimeout(() => setIsTyping(true), typingDelay))
                accumulatedDelay += 1000 // Typing duration
            }

            const msgDelay = accumulatedDelay
            timeoutIds.push(setTimeout(() => {
                setIsTyping(false)
                setMessages(prev => [...prev, msg])
                if (msg.action === 'confirm') setAppointmentStatus('confirmed')
            }, msgDelay))

            accumulatedDelay += 1000 // Read time
        })

        return () => timeoutIds.forEach(clearTimeout)
    }, [])

    return (
        <section className="py-24 bg-black/50">
            <div className="container px-4 mx-auto">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-3xl md:text-5xl font-bold text-white">Saniyeler İçinde Randevu</h2>
                    <p className="text-gray-400">Hastalarınız telefon başında beklemez, randevularını anında oluşturur.</p>
                </div>

                <div className="grid lg:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">

                    {/* Chat Interface */}
                    <div className="bg-gray-900 rounded-3xl border border-white/10 overflow-hidden h-[500px] flex flex-col shadow-2xl">
                        <div className="bg-teal-900/30 p-4 border-b border-white/10 flex items-center gap-3 backdrop-blur-md">
                            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-sm text-teal-100 font-medium">Klinik Asistanı</span>
                        </div>

                        <div className="flex-1 p-6 space-y-4 overflow-y-auto scrollbar-hide">
                            <AnimatePresence mode="popLayout">
                                {messages.map((msg, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                                    >
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'bot' ? 'bg-teal-600' : 'bg-gray-700'}`}>
                                            {msg.role === 'bot' ? <Bot className="w-5 h-5 text-white" /> : <User className="w-5 h-5 text-white" />}
                                        </div>
                                        <div className={`p-3 rounded-2xl max-w-[80%] text-sm ${msg.role === 'bot'
                                            ? 'bg-teal-500/10 border border-teal-500/20 text-teal-50 rounded-tl-none'
                                            : 'bg-white/10 text-white rounded-tr-none'
                                            }`}>
                                            {msg.text}
                                        </div>
                                    </motion.div>
                                ))}
                                {isTyping && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                                        <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center shrink-0">
                                            <Bot className="w-5 h-5 text-white" />
                                        </div>
                                        <div className="bg-teal-500/10 border border-teal-500/20 p-3 rounded-2xl rounded-tl-none flex gap-1 items-center h-10">
                                            <div className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <div className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <div className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Dynamic Appointment Card */}
                    <div className="relative">
                        <motion.div
                            animate={{
                                scale: appointmentStatus === 'confirmed' ? 1.05 : 1,
                                borderColor: appointmentStatus === 'confirmed' ? 'rgba(20, 184, 166, 0.5)' : 'rgba(255, 255, 255, 0.1)'
                            }}
                            className="bg-black rounded-3xl border border-white/10 p-8 space-y-6 relative overflow-hidden"
                        >
                            {/* Success Overlay */}
                            <AnimatePresence>
                                {appointmentStatus === 'confirmed' && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="absolute inset-0 bg-teal-900/90 backdrop-blur-sm flex flex-col items-center justify-center z-20 text-center p-6"
                                    >
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: "spring", damping: 12 }}
                                            className="w-20 h-20 bg-teal-500 rounded-full flex items-center justify-center mb-4"
                                        >
                                            <CheckCircle2 className="w-10 h-10 text-white" />
                                        </motion.div>
                                        <h3 className="text-2xl font-bold text-white mb-2">Randevu Onaylandı!</h3>
                                        <p className="text-teal-200">SMS ve E-posta ile bilgilendirme gönderildi.</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="flex items-center justify-between border-b border-white/10 pb-6">
                                <div>
                                    <h3 className="text-xl font-bold text-white">Randevu Detayları</h3>
                                    <p className="text-gray-400 text-sm">Özet Bilgi</p>
                                </div>
                                <div className="w-12 h-12 bg-teal-500/20 rounded-xl flex items-center justify-center">
                                    <Calendar className="w-6 h-6 text-teal-400" />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5">
                                    <User className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <div className="text-xs text-gray-500">Doktor</div>
                                        <div className="text-white font-medium">Dr. Ayşe Yılmaz</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5">
                                    <Clock className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <div className="text-xs text-gray-500">Tarih & Saat</div>
                                        <div className="text-white font-medium">Yarın, 14:00</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5">
                                    <Activity className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <div className="text-xs text-gray-500">Bölüm</div>
                                        <div className="text-white font-medium">Diş Hekimliği</div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4">
                                <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full bg-teal-500"
                                        initial={{ width: "30%" }}
                                        animate={{ width: appointmentStatus === 'confirmed' ? "100%" : "60%" }}
                                        transition={{ duration: 0.5 }}
                                    />
                                </div>
                                <div className="flex justify-between text-xs text-gray-500 mt-2">
                                    <span>Bilgiler Alınıyor</span>
                                    <span>Onaylanıyor</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                </div>
            </div>
        </section>
    )
}
