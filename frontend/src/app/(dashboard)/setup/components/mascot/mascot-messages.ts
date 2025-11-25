// Maskot karakterinin tüm mesajları ve animasyon durumları

export type MascotEmotion =
    | 'idle'         // 😊 Varsayılan
    | 'thinking'     // 🤔 Düşünüyor
    | 'working'      // ⚙️ Çalışıyor
    | 'searching'    // 🔍 Arıyor
    | 'excited'      // ✨ Heyecanlı
    | 'happy'        // 🎉 Mutlu
    | 'warning'      // ⚠️ Uyarı
    | 'celebrating'; // 🥳 Kutlama

export interface MascotMessage {
    emotion: MascotEmotion;
    text: string;
    icon?: string; // Opsiyonel emoji override
}

// State bazlı mesajlar
export const mascotMessages = {
    // INPUT state
    welcome: {
        emotion: 'happy' as MascotEmotion,
        text: 'Merhaba! 👋 Web sitenizi analiz etmeye hazırım!',
        icon: '👋'
    },

    // DISCOVERING state (Phase 1)
    discovering: [
        {
            emotion: 'searching' as MascotEmotion,
            text: 'Web sitenizi geziyorum... 🔍',
            icon: '🔍'
        },
        {
            emotion: 'working' as MascotEmotion,
            text: 'Sayfalarınızı tarıyorum...',
            icon: '📄'
        },
        {
            emotion: 'excited' as MascotEmotion,
            text: 'Bir sürü link buldum! 📚',
            icon: '📚'
        }
    ],

    // ANALYZING state (Phase 2)
    analyzing: [
        {
            emotion: 'thinking' as MascotEmotion,
            text: 'Şimdi en önemli sayfaları seçiyorum... 🎯',
            icon: '🎯'
        },
        {
            emotion: 'working' as MascotEmotion,
            text: 'Sizin için en değerli bilgileri ayıklıyorum! 💎',
            icon: '💎'
        },
        {
            emotion: 'excited' as MascotEmotion,
            text: 'Hazır! Bir çok bilgi buldum! 🎉',
            icon: '🎉'
        }
    ],

    // APPROVAL state
    approval: {
        emotion: 'happy' as MascotEmotion,
        text: 'Bu sayfaları sizin için tarayabilirim! Hangilerini istersiniz? 📋',
        icon: '📋'
    },

    approvalEmpty: {
        emotion: 'warning' as MascotEmotion,
        text: 'En az bir sayfa seçmelisiniz! ⚠️',
        icon: '⚠️'
    },

    approvalConfirm: {
        emotion: 'excited' as MascotEmotion,
        text: 'Harika! Seçtikleriniz için detaylı bilgi topluyorum! 🚀',
        icon: '🚀'
    },

    // PROCESSING state (Phase 3)
    processing: [
        {
            emotion: 'working' as MascotEmotion,
            text: 'Seçtikleriniz için detaylı bilgi topluyorum... ⚙️',
            icon: '⚙️'
        },
        {
            emotion: 'working' as MascotEmotion,
            text: 'Sizin için öğreniyorum! 🧠',
            icon: '🧠'
        },
        {
            emotion: 'excited' as MascotEmotion,
            text: 'Neredeyse bitti! 💪',
            icon: '💪'
        }
    ],

    // COMPANY_INFO state
    companyInfo: {
        emotion: 'happy' as MascotEmotion,
        text: 'İşte firma bilgileriniz! Kontrol eder misiniz? 🏢',
        icon: '🏢'
    },

    companyInfoValidation: {
        nameEmpty: {
            emotion: 'warning' as MascotEmotion,
            text: 'Dur! ⚠️ Firma adı boş olamaz',
            icon: '⚠️'
        },
        nameTooShort: {
            emotion: 'warning' as MascotEmotion,
            text: 'Hmm... 🤔 Firma adı çok kısa görünüyor',
            icon: '🤔'
        },
        sectorEmpty: {
            emotion: 'warning' as MascotEmotion,
            text: 'Sektör bilgisi eksik! Lütfen doldurun 📝',
            icon: '📝'
        },
        success: {
            emotion: 'happy' as MascotEmotion,
            text: 'Mükemmel! ✅ Şimdi ürün/hizmetlerinize bakalım',
            icon: '✅'
        }
    },

    // OFFERING_CAROUSEL state
    offeringIntro: {
        emotion: 'excited' as MascotEmotion,
        text: 'İlk hizmetinizi/ürününüzü buldum! 🎯',
        icon: '🎯'
    },

    offeringProgress: (current: number, total: number) => ({
        emotion: 'happy' as MascotEmotion,
        text: `${current}. hizmet/ürüne bakalım! (${current}/${total})`,
        icon: '📦'
    }),

    offeringValidation: {
        nameEmpty: {
            emotion: 'warning' as MascotEmotion,
            text: 'Dur! ⚠️ İsim gerekli',
            icon: '⚠️'
        },
        priceInvalid: {
            emotion: 'warning' as MascotEmotion,
            text: 'Hmm, fiyat sıfır olamaz 🤔',
            icon: '🤔'
        },
        success: {
            emotion: 'happy' as MascotEmotion,
            text: 'Harika! ✅ Bu bilgiler doğru mu?',
            icon: '✅'
        }
    },

    offeringDelete: {
        confirm: {
            emotion: 'warning' as MascotEmotion,
            text: 'Silmek istediğine emin misin? Bu işlem geri alınamaz! 🗑️',
            icon: '🗑️'
        },
        deleted: {
            emotion: 'idle' as MascotEmotion,
            text: 'Silindi! Bir sonrakine geçelim ➡️',
            icon: '➡️'
        }
    },

    // COMPLETION state
    completion: {
        emotion: 'celebrating' as MascotEmotion,
        text: 'Tamamlandı! 🎉 Chatbot\'unuz hazır!',
        icon: '🎉'
    },

    // Error states
    error: {
        generic: {
            emotion: 'warning' as MascotEmotion,
            text: 'Bir şeyler ters gitti! 😕 Lütfen tekrar deneyin',
            icon: '😕'
        },
        timeout: {
            emotion: 'warning' as MascotEmotion,
            text: 'İşlem çok uzun sürdü. Yeniden başlayalım mı? ⏱️',
            icon: '⏱️'
        },
        network: {
            emotion: 'warning' as MascotEmotion,
            text: 'Bağlantı sorunu! İnternet bağlantınızı kontrol edin 📡',
            icon: '📡'
        }
    }
};

// Emoji mapping (icon override için)
export const emotionEmojis: Record<MascotEmotion, string> = {
    idle: '😊',
    thinking: '🤔',
    working: '⚙️',
    searching: '🔍',
    excited: '✨',
    happy: '🎉',
    warning: '⚠️',
    celebrating: '🥳'
};

// Random mesaj seçici (array olan mesajlar için)
export function getRandomMessage(messages: MascotMessage[]): MascotMessage {
    return messages[Math.floor(Math.random() * messages.length)];
}

// Progress mesajları (işlem sırasında değişen)
export function getProcessingMessage(current: number, total: number): MascotMessage {
    const percentage = Math.round((current / total) * 100);

    if (percentage < 30) {
        return {
            emotion: 'working',
            text: `Başladık! (${current}/${total}) 🚀`,
            icon: '🚀'
        };
    } else if (percentage < 70) {
        return {
            emotion: 'working',
            text: `İlerliyoruz! (${current}/${total}) 💪`,
            icon: '💪'
        };
    } else {
        return {
            emotion: 'excited',
            text: `Neredeyse bitti! (${current}/${total}) 🎯`,
            icon: '🎯'
        };
    }
}
