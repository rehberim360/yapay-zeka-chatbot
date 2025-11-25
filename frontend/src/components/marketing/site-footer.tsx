"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { MascotLogo } from '@/components/ui/mascot-logo'
import { Twitter, Linkedin, Instagram } from 'lucide-react'

export function SiteFooter() {
    return (
        <footer className="w-full bg-black border-t border-white/10 pt-20 pb-10 relative overflow-hidden">
            <div className="container px-4 md:px-6 mx-auto relative z-10">

                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">

                    {/* Brand */}
                    <div className="md:col-span-1">
                        <div className="flex items-center gap-2 mb-4">
                            <MascotLogo size="sm" />
                            <span className="text-xl font-bold text-white">YapayZekaChatbot</span>
                        </div>
                        <p className="text-gray-400 text-sm mb-6">
                            İşletmenizin Dijital Beyni.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-white/10 hover:text-white transition-colors">
                                <Twitter className="w-4 h-4" />
                            </a>
                            <a href="#" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-white/10 hover:text-white transition-colors">
                                <Linkedin className="w-4 h-4" />
                            </a>
                            <a href="#" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-white/10 hover:text-white transition-colors">
                                <Instagram className="w-4 h-4" />
                            </a>
                        </div>
                    </div>

                    {/* Links */}
                    <div>
                        <h4 className="text-white font-bold mb-6">Ürün</h4>
                        <ul className="space-y-4 text-sm text-gray-400">
                            <li><a href="#" className="hover:text-electric-indigo transition-colors">Özellikler</a></li>
                            <li><a href="#" className="hover:text-electric-indigo transition-colors">Fiyatlandırma</a></li>
                            <li><a href="#" className="hover:text-electric-indigo transition-colors">Entegrasyonlar</a></li>
                            <li><a href="#" className="hover:text-electric-indigo transition-colors">Yol Haritası</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-6">Kaynaklar</h4>
                        <ul className="space-y-4 text-sm text-gray-400">
                            <li><a href="#" className="hover:text-electric-indigo transition-colors">Blog</a></li>
                            <li><a href="#" className="hover:text-electric-indigo transition-colors">Dokümantasyon</a></li>
                            <li><a href="#" className="hover:text-electric-indigo transition-colors">Topluluk</a></li>
                            <li><a href="#" className="hover:text-electric-indigo transition-colors">Yardım Merkezi</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-6">Yasal</h4>
                        <ul className="space-y-4 text-sm text-gray-400">
                            <li><a href="#" className="hover:text-electric-indigo transition-colors">Gizlilik Politikası</a></li>
                            <li><a href="#" className="hover:text-electric-indigo transition-colors">Kullanım Şartları</a></li>
                            <li><a href="#" className="hover:text-electric-indigo transition-colors">Çerez Politikası</a></li>
                            <li><a href="#" className="hover:text-electric-indigo transition-colors">KVKK</a></li>
                        </ul>
                    </div>

                </div>

                <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-gray-500">
                        © 2024 YapayZekaChatbot. Tüm hakları saklıdır.
                    </p>

                    {/* SEO Keywords */}
                    <div className="flex flex-wrap justify-center gap-4 text-[10px] text-gray-600">
                        <span>Yapay Zeka Chatbot</span>
                        <span>AI Canlı Destek</span>
                        <span>Chatbot Fiyatları</span>
                        <span>Türkçe AI Bot</span>
                        <span>Web Site Asistanı</span>
                    </div>
                </div>

                {/* Sleeping Mascot */}
                <motion.div
                    className="absolute right-0 bottom-0 pointer-events-none opacity-50"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                    <div className="relative w-32 h-32">
                        <div className="absolute bottom-0 right-10 w-20 h-20 rounded-full bg-gradient-to-br from-electric-indigo/20 to-deep-purple/20 blur-xl" />
                        <div className="absolute bottom-4 right-12 w-16 h-16 rounded-full bg-black/40 border border-white/5 flex items-center justify-center">
                            <div className="text-2xl">😴</div>
                        </div>
                        <div className="absolute bottom-20 right-8 text-xs text-gray-500 animate-pulse">Zzz...</div>
                    </div>
                </motion.div>

            </div>
        </footer>
    )
}
