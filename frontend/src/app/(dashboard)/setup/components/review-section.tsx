"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, useFieldArray } from 'react-hook-form';
import { Save, Trash2, Plus, Building2, Sparkles, Globe, Search, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import * as Tabs from '@radix-ui/react-tabs';
import { clsx } from 'clsx';

interface ReviewSectionProps {
    initialData: any;
}

export function ReviewSection({ initialData }: ReviewSectionProps) {
    const [activeTab, setActiveTab] = useState("company");

    console.log('ReviewSection Rendered. InitialData:', initialData);

    const { register, control, handleSubmit, watch, reset } = useForm({
        defaultValues: initialData || {
            company_info: {},
            offerings: []
        }
    });

    // Update form when initialData changes
    useEffect(() => {
        if (initialData) {
            reset(initialData);
        }
    }, [initialData, reset]);

    const { fields, remove, append } = useFieldArray({
        control,
        name: "offerings"
    });

    const offerings = watch("offerings");

    const onSubmit = async (data: any) => {
        console.log('Final Data:', data);
        toast.success('Kurulum tamamlandı! Panel hazırlanıyor...');
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-5xl mx-auto">
            <form onSubmit={handleSubmit(onSubmit)}>

                {/* Header */}
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                            Bot Yapılandırması
                        </h1>
                        <p className="text-gray-400 mt-2">Yapay zeka {offerings?.length || 0} hizmet ve şirket detayı tespit etti.</p>
                    </div>
                    <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-full font-semibold shadow-lg shadow-blue-900/20 flex items-center gap-2 transition-all hover:scale-105"
                    >
                        <Save className="w-5 h-5" />
                        Botu Oluştur
                    </button>
                </div>

                {/* Navigation Tabs */}
                <div className="flex gap-2 mb-6 bg-gray-900/50 p-1 rounded-xl border border-gray-800 w-fit">
                    <button
                        type="button"
                        onClick={() => setActiveTab("company")}
                        className={clsx(
                            "px-6 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                            activeTab === "company" ? "bg-gray-800 text-white shadow-sm" : "text-gray-400 hover:text-white"
                        )}
                    >
                        <Building2 className="w-4 h-4" /> İşletme Bilgileri
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab("services")}
                        className={clsx(
                            "px-6 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                            activeTab === "services" ? "bg-gray-800 text-white shadow-sm" : "text-gray-400 hover:text-white"
                        )}
                    >
                        <Sparkles className="w-4 h-4" /> Hizmetler & Ürünler
                        <span className="bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">{fields.length}</span>
                    </button>
                </div>

                {/* CONTENT AREA */}
                <div className="min-h-[500px]">

                    {/* COMPANY TAB */}
                    {activeTab === "company" && (
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-2 gap-6">
                            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-6">
                                <h3 className="text-lg font-medium text-white border-b border-gray-800 pb-4">Temel Bilgiler</h3>
                                <div>
                                    <label className="text-xs uppercase tracking-wider text-gray-500 font-semibold">İşletme Adı</label>
                                    <input {...register("company_info.name")} className="mt-2 w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all" />
                                </div>
                                <div>
                                    <label className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Sektör</label>
                                    <input {...register("company_info.sector")} className="mt-2 w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-blue-500 outline-none transition-all" />
                                </div>
                                <div>
                                    <label className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Açıklama</label>
                                    <textarea rows={4} {...register("company_info.description")} className="mt-2 w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-blue-500 outline-none transition-all resize-none" />
                                </div>
                            </div>

                            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-6">
                                <h3 className="text-lg font-medium text-white border-b border-gray-800 pb-4">İletişim & Ton</h3>
                                <div>
                                    <label className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Web Sitesi Dili</label>
                                    <select {...register("company_info.detected_language")} className="mt-2 w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white outline-none">
                                        <option value="tr">Türkçe</option>
                                        <option value="en">English</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs uppercase tracking-wider text-gray-500 font-semibold">AI İletişim Tonu</label>
                                    <input {...register("company_info.tone_of_voice")} placeholder="Örn: Samimi, Profesyonel..." className="mt-2 w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white outline-none" />
                                </div>
                                <div className="p-4 bg-blue-900/20 border border-blue-800/50 rounded-lg">
                                    <p className="text-sm text-blue-300">
                                        <span className="font-bold">İpucu:</span> İletişim tonu, chatbot'un müşterilerinize nasıl hitap edeceğini belirler.
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* SERVICES TAB */}
                    {activeTab === "services" && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {/* Add New Card */}
                                <button
                                    type="button"
                                    onClick={() => append({ name: 'Yeni Hizmet', price: 0, type: 'SERVICE', active: true })}
                                    className="border-2 border-dashed border-gray-800 hover:border-blue-500/50 hover:bg-blue-500/5 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 text-gray-500 hover:text-blue-400 transition-all group min-h-[200px]"
                                >
                                    <div className="w-12 h-12 rounded-full bg-gray-800 group-hover:bg-blue-500/20 flex items-center justify-center transition-colors">
                                        <Plus className="w-6 h-6" />
                                    </div>
                                    <span className="font-medium">Yeni Hizmet Ekle</span>
                                </button>

                                <AnimatePresence>
                                    {fields.map((field, index) => (
                                        <motion.div
                                            layout
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            key={field.id}
                                            className="bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-2xl p-5 group relative transition-all hover:shadow-xl"
                                        >
                                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button type="button" onClick={() => remove(index)} className="p-2 text-gray-500 hover:text-red-400 bg-gray-800 rounded-lg hover:bg-red-400/10 transition-colors">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={clsx("w-2 h-10 rounded-full", watch(`offerings.${index}.type`) === 'SERVICE' ? "bg-purple-500" : "bg-emerald-500")}></div>
                                                    <div className="flex-1">
                                                        <input
                                                            {...register(`offerings.${index}.name`)}
                                                            className="w-full bg-transparent text-lg font-bold text-white placeholder-gray-600 outline-none"
                                                            placeholder="Hizmet Adı"
                                                        />
                                                        <select {...register(`offerings.${index}.type`)} className="text-xs text-gray-400 bg-transparent outline-none mt-1 cursor-pointer hover:text-white">
                                                            <option value="SERVICE">HİZMET (Randevu)</option>
                                                            <option value="PRODUCT">ÜRÜN (Satış)</option>
                                                        </select>
                                                    </div>
                                                </div>

                                                <textarea
                                                    {...register(`offerings.${index}.description`)}
                                                    placeholder="Kısa açıklama..."
                                                    rows={2}
                                                    className="w-full bg-gray-800/50 border-none rounded-lg px-3 py-2 text-sm text-gray-400 resize-none focus:ring-1 focus:ring-blue-500/50 outline-none"
                                                />

                                                <div className="flex gap-2 pt-2">
                                                    <div className="relative flex-1">
                                                        <span className="absolute left-3 top-2.5 text-gray-500 text-xs">₺</span>
                                                        <input
                                                            type="number"
                                                            {...register(`offerings.${index}.price`)}
                                                            className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-6 pr-3 py-2 text-sm text-white font-mono outline-none focus:border-blue-500"
                                                        />
                                                    </div>
                                                    {watch(`offerings.${index}.type`) === 'SERVICE' && (
                                                        <div className="relative flex-1">
                                                            <span className="absolute right-3 top-2.5 text-gray-500 text-xs">dk</span>
                                                            <input
                                                                type="number"
                                                                {...register(`offerings.${index}.estimated_duration_minutes`)}
                                                                className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-3 pr-8 py-2 text-sm text-white font-mono outline-none focus:border-blue-500"
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    )}
                </div>
            </form>
        </motion.div>
    );
}
