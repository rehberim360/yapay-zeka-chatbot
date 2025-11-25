'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { type MascotEmotion, emotionEmojis } from './mascot-messages';
import Image from 'next/image';

interface MascotBubbleProps {
    emotion?: MascotEmotion;
    message: string;
    icon?: string; // Override için
    position?: 'top-left' | 'top-center' | 'bottom-center';
    typing?: boolean; // Typing effect
}

export function MascotBubble({
    emotion = 'idle',
    message,
    icon,
    position = 'top-left',
    typing = true
}: MascotBubbleProps) {
    const [displayedText, setDisplayedText] = useState('');
    const [isTyping, setIsTyping] = useState(typing);

    const mascotIcon = icon || emotionEmojis[emotion];

    // Typing effect
    useEffect(() => {
        if (!typing) {
            setDisplayedText(message);
            setIsTyping(false);
            return;
        }

        setDisplayedText('');
        setIsTyping(true);

        let currentIndex = 0;
        const typingInterval = setInterval(() => {
            if (currentIndex < message.length) {
                setDisplayedText(message.slice(0, currentIndex + 1));
                currentIndex++;
            } else {
                setIsTyping(false);
                clearInterval(typingInterval);
            }
        }, 30); // 30ms per character

        return () => clearInterval(typingInterval);
    }, [message, typing]);

    // Position styles
    const positionClasses = {
        'top-left': 'top-8 left-8',
        'top-center': 'top-8 left-1/2 -translate-x-1/2',
        'bottom-center': 'bottom-8 left-1/2 -translate-x-1/2'
    };

    return (
        <motion.div
            className={`fixed ${positionClasses[position]} z-50 flex items-start gap-3`}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
        >
            {/* Maskot Icon - Using actual logo */}
            <motion.div
                className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg p-2"
                animate={{
                    scale: isTyping ? [1, 1.05, 1] : 1,
                    rotate: emotion === 'celebrating' ? [0, 10, -10, 0] : 0
                }}
                transition={{
                    scale: { duration: 0.6, repeat: isTyping ? Infinity : 0 },
                    rotate: { duration: 0.5, repeat: emotion === 'celebrating' ? Infinity : 0 }
                }}
            >
                <Image
                    src="/yapayzekachatbotcomlogo1.png"
                    alt="Mascot"
                    width={48}
                    height={48}
                    className="object-contain"
                />
            </motion.div>

            {/* Speech Bubble */}
            <motion.div
                className="relative bg-white text-gray-900 rounded-2xl px-6 py-4 shadow-lg border border-gray-100 max-w-md"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 }}
            >
                {/* Tail */}
                <div className="absolute left-0 top-6 -translate-x-2 w-0 h-0 border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent border-r-[12px] border-r-white" />

                {/* Text */}
                <p className="text-base font-medium leading-relaxed">
                    {displayedText}
                    {isTyping && (
                        <motion.span
                            className="inline-block w-1 h-5 bg-indigo-500 ml-1"
                            animate={{ opacity: [1, 0] }}
                            transition={{ duration: 0.5, repeat: Infinity }}
                        />
                    )}
                </p>

                {/* Subtle glow effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-400/10 to-purple-400/10 blur-lg -z-10" />
            </motion.div>
        </motion.div>
    );
}
