"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Calendar, User } from 'lucide-react'
import { cn } from '@/lib/utils'

export function BlogSection() {
    const posts = [
        {
            title: "İşletmeler İçin Yapay Zeka Chatbot Kullanmanın 5 Avantajı",
            excerpt: "Müşteri memnuniyetini artırırken maliyetleri nasıl düşürebileceğinizi keşfedin.",
            category: "Rehber",
            date: "22 Kasım 2024",
            readTime: "5 dk okuma",
            gradient: "from-blue-500 to-cyan-500"
        },
        {
            title: "Web Sitenize Canlı Destek Eklemenin En Kolay Yolu",
            excerpt: "Kodlama bilmeden dakikalar içinde sitenize nasıl akıllı bir asistan ekleyebilirsiniz?",
            category: "Nasıl Yapılır",
            date: "20 Kasım 2024",
            readTime: "4 dk okuma",
            gradient: "from-purple-500 to-pink-500"
        },
        {
            title: "Randevu Kaçıran Klinikler İçin Çözüm: AI Asistanlar",
            excerpt: "Sağlık sektöründe yapay zeka kullanımı ile randevu doluluk oranlarını %40 artırın.",
            category: "Sektörel",
            date: "18 Kasım 2024",
            readTime: "6 dk okuma",
            gradient: "from-green-500 to-emerald-500"
        },
        {
            title: "Müşteri Hizmetlerinde Maliyetleri %70 Düşürmenin Yolları",
            excerpt: "Otomasyon ve yapay zeka ile operasyonel verimliliği maksimuma çıkarın.",
            category: "Strateji",
            date: "15 Kasım 2024",
            readTime: "7 dk okuma",
            gradient: "from-orange-500 to-red-500"
        }
    ]

    return (
        <section className="py-24 bg-background border-t border-white/5">
            <div className="container px-4 md:px-6 mx-auto">

                <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
                    <div className="max-w-2xl">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
                            Yapay Zeka ve İş Dünyasından <br />
                            <span className="text-electric-indigo">Son Gelişmeler</span>
                        </h2>
                        <p className="text-gray-400">
                            İşletmenizi büyütmek için ipuçları, rehberler ve sektör analizleri.
                        </p>
                    </div>
                    <a href="#" className="text-white flex items-center gap-2 hover:text-electric-indigo transition-colors group">
                        Tüm Yazıları Gör
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </a>
                </div>

                {/* Blog Slider */}
                <div className="flex overflow-x-auto pb-8 gap-6 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
                    {posts.map((post, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="min-w-[300px] md:min-w-[350px] snap-center group cursor-pointer"
                        >
                            {/* Image Placeholder */}
                            <div className={cn(
                                "h-48 rounded-2xl bg-gradient-to-br mb-6 relative overflow-hidden",
                                post.gradient
                            )}>
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-300" />
                                <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-xs text-white font-medium border border-white/10">
                                    {post.category}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {post.date}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <User className="w-3 h-3" />
                                        {post.readTime}
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold text-white group-hover:text-electric-indigo transition-colors line-clamp-2">
                                    {post.title}
                                </h3>

                                <p className="text-sm text-gray-400 line-clamp-2">
                                    {post.excerpt}
                                </p>

                                <div className="pt-2">
                                    <span className="text-sm font-medium text-white flex items-center gap-2 group-hover:gap-3 transition-all">
                                        Devamını Oku <ArrowRight className="w-4 h-4" />
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

            </div>
        </section>
    )
}
