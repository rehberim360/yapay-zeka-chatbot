"use client"

import React, { useState, useEffect } from 'react'
import { motion, useScroll, useMotionValueEvent } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { MascotLogo } from '@/components/ui/mascot-logo'
import { cn } from '@/lib/utils'
import { Menu, X } from 'lucide-react'
import Link from 'next/link'

export function SiteHeader() {
    const [isScrolled, setIsScrolled] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const { scrollY } = useScroll()

    useMotionValueEvent(scrollY, "change", (latest) => {
        setIsScrolled(latest > 50)
    })

    const navLinks = [
        { name: "Nasıl Çalışır?", href: "/#how-it-works" },
        { name: "Akıllı Kurulum", href: "/ozellikler/akilli-kurulum" },
        { name: "Çoklu Dil", href: "/ozellikler/coklu-dil-destegi" },
        { name: "Güvenlik", href: "/ozellikler/guvenlik" },
        { name: "Sağlık", href: "/cozumler/saglik" },
        { name: "E-Ticaret", href: "/cozumler/e-ticaret" },
        { name: "Emlak", href: "/cozumler/emlak" },
        { name: "Fiyatlandırma", href: "/#pricing" },
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
                    <nav className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="text-base font-semibold text-gray-300 hover:text-white transition-colors"
                            >
                                {link.name}
                            </Link>
                        ))}
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
                <div className="fixed inset-0 z-40 bg-black/95 backdrop-blur-xl pt-24 px-6 md:hidden">
                    <nav className="flex flex-col gap-6 text-center">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className="text-xl font-medium text-gray-300 hover:text-white"
                            >
                                {link.name}
                            </Link>
                        ))}
                        <Button variant="glow" className="w-full mt-4">
                            Ücretsiz Dene
                        </Button>
                    </nav>
                </div>
            )}
        </>
    )
}
