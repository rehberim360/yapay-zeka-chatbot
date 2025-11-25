"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface MascotLogoProps {
    className?: string
    size?: "sm" | "md" | "lg" | "xl"
}

export function MascotLogo({ className, size = "md" }: MascotLogoProps) {
    const sizeClasses = {
        sm: "w-10 h-10",
        md: "w-16 h-16",
        lg: "w-32 h-32",
        xl: "w-64 h-64"
    }

    const eyeSizes = {
        sm: "w-2 h-2.5",
        md: "w-3 h-4",
        lg: "w-6 h-8",
        xl: "w-12 h-16"
    }

    const gapSizes = {
        sm: "gap-1.5",
        md: "gap-2",
        lg: "gap-4",
        xl: "gap-8"
    }

    return (
        <div className={cn("relative flex items-center justify-center", sizeClasses[size], className)}>
            {/* Main Body */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-electric-indigo to-deep-purple shadow-lg flex items-center justify-center overflow-hidden">
                {/* Inner Glow/Reflection */}
                <div className="absolute inset-1 rounded-full bg-black/20 backdrop-blur-sm border border-white/10 flex items-center justify-center overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/20 to-transparent rounded-t-full" />

                    {/* Face */}
                    <div className={cn("flex z-10 items-center", gapSizes[size])}>
                        <motion.div
                            animate={{ scaleY: [1, 0.1, 1, 1, 1] }}
                            transition={{ duration: 4, repeat: Infinity, times: [0, 0.05, 0.1, 0.8, 1] }}
                            className={cn("bg-neon-cyan rounded-full shadow-[0_0_10px_#06b6d4]", eyeSizes[size])}
                        />
                        <motion.div
                            animate={{ scaleY: [1, 0.1, 1, 1, 1] }}
                            transition={{ duration: 4, repeat: Infinity, times: [0, 0.05, 0.1, 0.8, 1] }}
                            className={cn("bg-neon-cyan rounded-full shadow-[0_0_10px_#06b6d4]", eyeSizes[size])}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
