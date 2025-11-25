'use client';

import { motion } from 'framer-motion';
import { Check, Loader2 } from 'lucide-react';

interface StepProgressProps {
    currentStep: number;
    completedSteps?: number[];
}

const steps = [
    { id: 1, label: 'URL Girişi', key: 'INPUT', icon: '🔗' },
    { id: 2, label: 'Analiz', key: 'ANALYZING', icon: '🔍' },
    { id: 3, label: 'Kontrol', key: 'REVIEW', icon: '✏️' },
    { id: 4, label: 'Tamamlandı', key: 'COMPLETE', icon: '🎉' }
];

export function StepProgress({ currentStep, completedSteps = [] }: StepProgressProps) {
    return (
        <div className="w-full max-w-4xl mx-auto">
            <div className="flex items-center justify-between relative">
                {/* Background Line */}
                <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 rounded-full -z-10" />
                
                {/* Progress Line */}
                <motion.div 
                    className="absolute top-5 left-0 h-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full -z-10"
                    initial={{ width: '0%' }}
                    animate={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                />

                {steps.map((step) => {
                    const isCompleted = currentStep > step.id || completedSteps.includes(step.id);
                    const isCurrent = currentStep === step.id;
                    
                    return (
                        <div key={step.id} className="flex flex-col items-center relative z-10">
                            {/* Circle */}
                            <motion.div
                                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all shadow-lg ${
                                    isCompleted
                                        ? 'bg-gradient-to-br from-green-500 to-green-600 text-white'
                                        : isCurrent
                                        ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white'
                                        : 'bg-white border-2 border-gray-300 text-gray-400'
                                }`}
                                initial={{ scale: 0.8 }}
                                animate={{ 
                                    scale: isCurrent ? [1, 1.1, 1] : 1,
                                }}
                                transition={{ 
                                    duration: isCurrent ? 1.5 : 0.3,
                                    repeat: isCurrent ? Infinity : 0,
                                    ease: "easeInOut"
                                }}
                            >
                                {isCompleted ? (
                                    <Check className="w-5 h-5" />
                                ) : isCurrent ? (
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                    >
                                        <Loader2 className="w-5 h-5" />
                                    </motion.div>
                                ) : (
                                    step.id
                                )}
                            </motion.div>
                            
                            {/* Label */}
                            <motion.span 
                                className={`mt-2 text-xs font-medium transition-all ${
                                    isCurrent 
                                        ? 'text-indigo-600 font-bold' 
                                        : isCompleted
                                        ? 'text-green-600'
                                        : 'text-gray-500'
                                }`}
                                animate={{
                                    scale: isCurrent ? [1, 1.05, 1] : 1
                                }}
                                transition={{
                                    duration: 1.5,
                                    repeat: isCurrent ? Infinity : 0,
                                    ease: "easeInOut"
                                }}
                            >
                                {step.label}
                            </motion.span>

                            {/* Pulse Effect for Current Step */}
                            {isCurrent && (
                                <motion.div
                                    className="absolute top-0 w-10 h-10 rounded-full bg-indigo-400"
                                    initial={{ scale: 1, opacity: 0.5 }}
                                    animate={{ scale: 1.8, opacity: 0 }}
                                    transition={{
                                        duration: 1.5,
                                        repeat: Infinity,
                                        ease: "easeOut"
                                    }}
                                />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
