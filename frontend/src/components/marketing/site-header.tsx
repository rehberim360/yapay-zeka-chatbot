"use client"

import React, { useState } from 'react'
import { motion, useScroll, useMotionValueEvent } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { MascotLogo } from '@/components/ui/mascot-logo'
import { cn } from '@/lib/utils'
import { Menu, X, ChevronDown } from 'lucide-react'
import Link from 'next/link'

export function SiteHeader() {
    const [isScrolled, setIsScrolled] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [featuresOpen, setFeaturesOpen] = useState(false)
    const [solutionsOpen, setSolutionsOpen] = useState(false)
    const { scrollY } = useScroll()

    useMotionValueEvent(scrollY, "change", (latest) => {
        setIsScrolled(latest > 50)
    })

    const features = [
        { name: "🧠 Akıllı Kurulum", href: "/ozellikler/akilli-kurulum" },
        { name: "🌍 Çoklu Dil Desteği", href: "/ozellikler/coklu-dil-destegi" },
        { name: "🔒 Güvenlik", href: "/ozellikler/guvenlik" },
    ]

    const solutions = [
        { name: "🏥 Sağlık", href: "/cozumler/saglik" },
        { name: "🛒 E-Ticaret", href: "/cozumler/e-ticaret" },
        { name: "🏠 Emlak", href: "/cozumler/emlak" },
    ]

    return (
        <>
            <motion.header
                className={cn(
                    "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-transparent",
                    isScrolled ? "bg-black/50 backdrop-blur-md border-white/10 py-3" : "bg-transparent py-5"
                )}
            >
                <div className="container px-4 md:px-6 mx-auto flex items-center justify-between">

                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <MascotLogo size="sm" className="group-hover:scale-110 transition-transform duration-300" />
                        <span className="text-lg font-bold text-white tracking-tight">
                            YapayZeka<span className="text-electric-indigo">Chatbot</span>
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-6">
                        <Link href="/#how-it-works" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
                            Nasıl Çalışır?
                        </Link>

                        {/* Özellikler Dropdown */}
                        <div className="relative group">
                            <button className="flex items-center gap-1 text-sm font-medium text-gray-300 hover:text-white transition-colors">
                                Özellikler <ChevronDown className="w-4 h-4" />
                            </button>
                            <div className="absolute top-full left-0 mt-2 w-56 bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                                {features.map((item) => (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className="block px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/5 first:rounded-t-xl last:rounded-b-xl transition-colors"
                                    >
                                        {item.name}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Çözümler Dropdown */}
                        <div className="relative group">
                            <button className="flex items-center gap-1 text-sm font-medium text-gray-300 hover:text-white transition-colors">
                                Çözümler <ChevronDown className="w-4 h-4" />
                            </button>
                            <div className="absolute top-full left-0 mt-2 w-56 bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                                {solutions.map((item) => (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className="block px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/5 first:rounded-t-xl last:rounded-b-xl transition-colors"
                                    >
                                        {item.name}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        <Link href="/hakkinda" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
                            Hakkında
                        </Link>
                        <Link href="/sponsor" className="text-sm font-medium text-pink-400 hover:text-pink-300 transition-colors">
                            💝 Sponsor
                        </Link>
                        <Link href="/#pricing" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
                            Fiyatlandırma
                        </Link>
                    </nav>

                    {/* CTA & Mobile Toggle */}
                    <div className="flex items-center gap-4">
                        <Button variant="glow" size="sm" className="hidden md:inline-flex">
                            Ücretsiz Dene
                        </Button>
                        <button
                            className="md:hidden text-white p-2"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen ? <X /> : <Menu />}
                        </button>
                    </div>

                </div>
            </motion.header>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-40 bg-black/95 backdrop-blur-xl pt-24 px-6 md:hidden overflow-y-auto">
                    <nav className="flex flex-col gap-4 text-center pb-8">
                        <Link href="/#how-it-works" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium text-gray-300 hover:text-white py-2">
                            Nasıl Çalışır?
                        </Link>

                        {/* Özellikler Mobile */}
                        <div className="border-t border-white/10 pt-4">
                            <button onClick={() => setFeaturesOpen(!featuresOpen)} className="flex items-center justify-center gap-2 text-lg font-medium text-gray-300 hover:text-white w-full py-2">
                                Özellikler <ChevronDown className={cn("w-4 h-4 transition-transform", featuresOpen && "rotate-180")} />
                            </button>
                            {featuresOpen && (
                                <div className="mt-2 space-y-2">
                                    {features.map((item) => (
                                        <Link key={item.name} href={item.href} onClick={() => setMobileMenuOpen(false)} className="block text-sm text-gray-400 hover:text-white py-2">
                                            {item.name}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Çözümler Mobile */}
                        <div className="border-t border-white/10 pt-4">
                            <button onClick={() => setSolutionsOpen(!solutionsOpen)} className="flex items-center justify-center gap-2 text-lg font-medium text-gray-300 hover:text-white w-full py-2">
                                Çözümler <ChevronDown className={cn("w-4 h-4 transition-transform", solutionsOpen && "rotate-180")} />
                            </button>
                            {solutionsOpen && (
                                <div className="mt-2 space-y-2">
                                    {solutions.map((item) => (
                                        <Link key={item.name} href={item.href} onClick={() => setMobileMenuOpen(false)} className="block text-sm text-gray-400 hover:text-white py-2">
                                            {item.name}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>

                        <Link href="/hakkinda" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium text-gray-300 hover:text-white py-2 border-t border-white/10 pt-4">
                            Hakkında
                        </Link>
                        <Link href="/sponsor" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium text-pink-400 hover:text-pink-300 py-2">
                            💝 Sponsor
                        </Link>
                        <Link href="/#pricing" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium text-gray-300 hover:text-white py-2">
                            Fiyatlandırma
                        </Link>

                        <Button variant="glow" className="w-full mt-6">
                            Ücretsiz Dene
                        </Button>
                    </nav>
                </div>
            )}
        </>
    )
}
