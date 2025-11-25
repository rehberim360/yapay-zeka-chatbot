'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { InputSection } from './components/input-section';
import { StepProgress } from './components/StepProgress';
import { ProcessingCard } from './components/cards/ProcessingCard';
import { CompanyReviewCard } from './components/cards/CompanyReviewCard';
import { PagesReviewCard } from './components/cards/PagesReviewCard';
import { CompanyInfoCard } from './components/cards/CompanyInfoCard';
import { OfferingsReviewCard } from './components/cards/OfferingsReviewCard';
import { DetailedOfferingsReviewCard } from './components/cards/DetailedOfferingsReviewCard';
import { CompletionCard } from './components/cards/CompletionCard';
import { Toaster, toast } from 'sonner';
import type { CompanyInfo, Offering, PageInfo, ScrapedData, HomeData } from '@/types/onboarding';

// Backend API URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Yeni state machine - Maskot tabanlı akış
export type OnboardingState =
    | 'INPUT'                      // URL girişi
    | 'DISCOVERING'                // Phase 1: Ana sayfa taranıyor
    | 'ANALYZING'                  // Phase 2: Linkler analiz ediliyor
    | 'REVIEW_COMPANY'             // 1. Firma bilgileri + Hizmet/Ürün seçimi
    | 'REVIEW_PAGES'               // 2. Detay sayfaları seçimi
    | 'PROCESSING_OFFERINGS'       // Phase 3: Hizmet sayfaları taranıyor (NEW)
    | 'REVIEW_DETAILED_OFFERINGS'  // 3. Detaylı hizmetler onayı (NEW)
    | 'PROCESSING_OTHER'           // Phase 4: Diğer sayfalar taranıyor (NEW)
    | 'COMPANY_INFO'               // Firma bilgileri kartı
    | 'OFFERING_CAROUSEL'          // Ürün/hizmet kartları (tek tek)
    | 'COMPLETION';                // Tamamlandı!

export default function SetupPage() {
    const [state, setState] = useState<OnboardingState>('INPUT');
    const [jobId, setJobId] = useState<string | null>(null);
    const [scrapedData, setScrapedData] = useState<ScrapedData | null>(null);
    const [homeData, setHomeData] = useState<HomeData | null>(null);
    const [suggestedPages, setSuggestedPages] = useState<PageInfo[]>([]);

    // Progress tracking
    const [progress, setProgress] = useState({ current: 0, total: 100, stats: {} });

    // Auto-increment progress animasyonu - State değişse bile devam etsin
    useEffect(() => {
        if (state === 'DISCOVERING' || state === 'ANALYZING' || state === 'PROCESSING_OFFERINGS' || state === 'PROCESSING_OTHER') {
            const interval = setInterval(() => {
                setProgress(prev => {
                    // Eğer zaten yüksekse yavaşlat
                    const increment = prev.current > 80 ? Math.random() * 2 : Math.random() * 5;
                    const newCurrent = Math.min(prev.current + increment, 95);
                    return { ...prev, current: Math.round(newCurrent) };
                });
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [state]);

    // REVIEW_COMPANY state'ine geçince progress'i 100'e çek
    useEffect(() => {
        if (state === 'REVIEW_COMPANY') {
            // Use setTimeout to avoid synchronous setState in effect
            setTimeout(() => setProgress(prev => ({ ...prev, current: 100 })), 0);
        }
    }, [state]);

    const handleStartAnalysis = async (inputUrl: string) => {
        console.log('Starting analysis for:', inputUrl);

        if (inputUrl === 'MANUAL') {
            setScrapedData({
                company_info: { name: '', sector: '', detected_language: 'tr', tone_of_voice: '' },
                offerings: []
            });
            setState('COMPANY_INFO');
            return;
        }

        setState('DISCOVERING');

        try {
            // Backend'e job başlat
            const response = await fetch(`${API_BASE_URL}/api/onboarding/start`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: inputUrl })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            if (data.jobId) {
                setJobId(data.jobId);
                // Polling başlat
                startJobPolling(data.jobId);
            }
        } catch (error) {
            console.error('Error starting analysis:', error);
            toast.error('Bir hata oluştu');
            setState('INPUT');
        }
    };

    const startJobPolling = (jobId: string) => {
        const pollInterval = setInterval(async () => {
            try {
                const statusRes = await fetch(`${API_BASE_URL}/api/onboarding/status/${jobId}`);
                
                if (!statusRes.ok) {
                    console.error('Status check failed:', statusRes.status);
                    return;
                }

                const data = await statusRes.json();
                
                if (!data || !data.status) {
                    console.error('Invalid response from job-status:', data);
                    return;
                }

                const { status, currentPhase, phaseData } = data;
                console.log('Current job status:', status, 'Phase:', currentPhase);

                // Status: IN_PROGRESS, COMPLETED, FAILED
                // Phase: SMART_DISCOVERY, SMART_PAGE_SELECTION, BATCH_DEEP_DIVE, etc.

                if (status === 'IN_PROGRESS') {
                    if (currentPhase === 'SMART_DISCOVERY') {
                        setState('DISCOVERING');
                    } else if (currentPhase === 'SMART_PAGE_SELECTION') {
                        // AUTO-SELECT: Otomatik tüm sayfaları seç ve scraping'e başla
                        console.log('🔄 Auto-selecting all suggested pages (NEW 3-REQUEST FLOW)');
                        console.log('📄 Suggested pages:', phaseData?.SMART_DISCOVERY?.suggested_pages);
                        clearInterval(pollInterval);
                        const smartDiscovery = phaseData?.SMART_DISCOVERY || {};
                        const suggestedPages = smartDiscovery.suggested_pages || [];
                        
                        // Otomatik tüm sayfaları seç ve backend'e gönder
                        if (jobId && suggestedPages.length > 0) {
                            try {
                                await fetch(`${API_BASE_URL}/api/onboarding/select-pages`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ 
                                        jobId, 
                                        selectedPages: suggestedPages,
                                        skipped: false
                                    })
                                });
                                
                                setState('PROCESSING_OFFERINGS');
                                startJobPolling(jobId);
                            } catch (error) {
                                console.error('Error auto-selecting pages:', error);
                            }
                        }
                    } else if (currentPhase === 'OFFERING_PAGES_SCRAPING') {
                        // Offering pages being scraped
                        setState('PROCESSING_OFFERINGS');
                    } else if (currentPhase === 'WAITING_APPROVAL') {
                        // Offerings ready for review (NEW 3-REQUEST FLOW)
                        clearInterval(pollInterval);
                        const offeringPages = phaseData?.OFFERING_PAGES_SCRAPING || {};
                        const smartDiscovery = phaseData?.SMART_DISCOVERY || {};
                        
                        // Get offerings from scraping (already enriched if detail scraping happened)
                        const offerings = offeringPages.offerings || [];
                        
                        console.log('📊 Offerings ready for review:', {
                            offerings_count: offerings.length,
                            offerings: offerings
                        });
                        
                        // Merge company info with updates
                        const companyInfo = {
                            ...smartDiscovery.company_info,
                            ...offeringPages.company_info_updates
                        };
                        
                        // Set homeData for DetailedOfferingsReviewCard
                        setHomeData({
                            company_info: companyInfo,
                            bot_purpose: smartDiscovery.sector_analysis?.bot_purpose || 'ORDER',
                            sector: smartDiscovery.sector_analysis?.sector || 'Unknown'
                        });
                        
                        // Update scrapedData
                        setScrapedData({
                            company_info: companyInfo,
                            offerings: offerings
                        });
                        
                        // Show offerings review card
                        setState('REVIEW_DETAILED_OFFERINGS');
                    } else if (currentPhase === 'OTHER_PAGES_SCRAPING') {
                        // NEW: Other pages being scraped
                        setState('PROCESSING_OTHER');
                    } else if (currentPhase === 'COMPANY_INFO_REVIEW') {
                        // All scraping completed, show final review
                        clearInterval(pollInterval);
                        const offeringReview = phaseData?.OFFERING_DETAIL_REVIEW || {};
                        const otherPages = phaseData?.OTHER_PAGES_SCRAPING || {};
                        const smartDiscovery = phaseData?.SMART_DISCOVERY || {};
                        
                        // Merge company info with updates from other pages
                        const finalCompanyInfo = {
                            ...smartDiscovery.company_info,
                            ...otherPages.company_info_updates
                        };
                        
                        setScrapedData({
                            company_info: finalCompanyInfo || {},
                            offerings: offeringReview.reviewed_offerings || []
                        });
                        
                        setState('COMPANY_INFO');
                    } else if (currentPhase === 'OFFERING_SELECTION') {
                        // This phase is handled by frontend, shouldn't reach here during polling
                        setState('ANALYZING');
                    }
                } else if (status === 'COMPLETED') {
                    clearInterval(pollInterval);
                    // Get final data from phase_data
                    const companyInfo = phaseData?.COMPANY_INFO_REVIEW || {};
                    const offerings = phaseData?.OFFERING_SELECTION?.selected_offerings || [];
                    setScrapedData({
                        company_info: companyInfo,
                        offerings: offerings
                    });
                    setState('COMPANY_INFO');
                } else if (status === 'FAILED') {
                    clearInterval(pollInterval);
                    
                    // Hata detayını al
                    const errorMsg = data.errorLog || 'Bilinmeyen hata';
                    
                    console.error('Job failed:', errorMsg);
                    
                    // Kullanıcı dostu hata mesajı
                    if (errorMsg.includes('ERR_NAME_NOT_RESOLVED')) {
                        toast.error('Web sitesi bulunamadı. URL\'yi kontrol edin.');
                    } else if (errorMsg.includes('timeout')) {
                        toast.error('Site çok yavaş yanıt veriyor. Lütfen tekrar deneyin.');
                    } else if (errorMsg.includes('Invalid JSON')) {
                        toast.error('Site içeriği analiz edilemedi. Farklı bir site deneyin.');
                    } else {
                        toast.error('Tarama başarısız oldu. Lütfen tekrar deneyin.');
                    }
                    
                    setState('INPUT');
                }
            } catch (error) {
                console.error('Polling error:', error);
            }
        }, 2000);
    };

    // Step 4: Diğer sayfalar onayı ve backend'e gönder
    const handlePagesReviewNext = async (selectedPages: unknown[]) => {
        if (!jobId) return;

        try {
            // Backend'e onaylanan hizmetleri ve seçilen diğer sayfaları gönder
            const reviewedOfferings = scrapedData?.offerings || [];
            
            // Önce hizmetleri kaydet
            await fetch(`${API_BASE_URL}/api/onboarding/approve-offerings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    jobId, 
                    reviewedOfferings
                })
            });

            // Sonra diğer sayfaları tara
            if (selectedPages.length > 0) {
                setState('PROCESSING_OTHER');
                startJobPolling(jobId);
            } else {
                // Sayfa seçilmediyse direkt company info'ya geç
                setState('COMPANY_INFO');
            }
        } catch (error) {
            console.error('Approval error:', error);
            toast.error('Onay gönderilemedi');
        }
    };

    // NEW: Step 3: Detaylı hizmetleri onayla
    const handleDetailedOfferingsApprove = async (reviewedOfferings: Offering[]) => {
        if (!jobId) return;

        try {
            // Onaylanan hizmetleri kaydet
            setScrapedData(prev => prev ? { ...prev, offerings: reviewedOfferings } : null);
            
            // Şimdi diğer sayfaları seçmek için REVIEW_PAGES'e geç
            setState('REVIEW_PAGES');
        } catch (error) {
            console.error('Approval error:', error);
            toast.error('Onay gönderilemedi');
        }
    };

    const handleCompanyInfoSave = (companyInfo: CompanyInfo) => {
        if (!scrapedData) return;
        setScrapedData({ ...scrapedData, company_info: companyInfo });
        setState('OFFERING_CAROUSEL');
    };



    // Step hesaplama
    const getCurrentStep = () => {
        if (state === 'INPUT') return 1;
        if (state === 'DISCOVERING' || state === 'ANALYZING') return 2;
        if (state === 'REVIEW_COMPANY' || state === 'REVIEW_PAGES') return 3;
        if (state === 'PROCESSING_OFFERINGS' || state === 'REVIEW_DETAILED_OFFERINGS') return 4;
        if (state === 'PROCESSING_OTHER' || state === 'COMPANY_INFO' || state === 'OFFERING_CAROUSEL' || state === 'COMPLETION') return 5;
        return 1;
    };

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
            <Toaster position="top-center" />

            {/* Container - Tek Ekran, Scroll Yok */}
            <div className="flex-1 flex flex-col p-6 max-w-7xl mx-auto w-full">
                
                {/* Step Progress - Sadece INPUT'tan sonra göster */}
                {state !== 'INPUT' && (
                    <div className="mb-6">
                        <StepProgress currentStep={getCurrentStep()} />
                    </div>
                )}

                {/* Content Area - Flex-1 ile kalan alanı doldur */}
                <div className="flex-1 flex items-center justify-center">

                <AnimatePresence mode="wait">
                    {state === 'INPUT' && (
                        <InputSection key="input" onStart={handleStartAnalysis} />
                    )}

                    {/* TODO: Diğer state'ler için component'ler eklenecek */}
                    {state === 'DISCOVERING' && (
                        <ProcessingCard
                            key="discovering"
                            phase="discovering"
                            current={progress.current}
                            total={progress.total}
                            stats={progress.stats}
                        />
                    )}
                    {state === 'ANALYZING' && (
                        <ProcessingCard
                            key="analyzing"
                            phase="analyzing"
                            current={progress.current}
                            total={progress.total}
                            stats={progress.stats}
                        />
                    )}

                    {state === 'PROCESSING_OFFERINGS' && (
                        <ProcessingCard
                            key="processing-offerings"
                            phase="processing"
                            current={progress.current}
                            total={progress.total}
                            stats={progress.stats}
                        />
                    )}
                    {state === 'REVIEW_DETAILED_OFFERINGS' && scrapedData && homeData && (
                        <DetailedOfferingsReviewCard
                            key="review-detailed-offerings"
                            offerings={scrapedData.offerings}
                            businessType={homeData.company_info.sector}
                            botPurpose={homeData.bot_purpose}
                            onComplete={handleDetailedOfferingsApprove}
                        />
                    )}
                    {state === 'PROCESSING_OTHER' && (
                        <ProcessingCard
                            key="processing-other"
                            phase="processing"
                            current={progress.current}
                            total={progress.total}
                            stats={progress.stats}
                        />
                    )}
                    {state === 'COMPANY_INFO' && scrapedData && (
                        <CompanyInfoCard
                            key="company"
                            initialData={scrapedData.company_info}
                            onSave={handleCompanyInfoSave}
                        />
                    )}
                    {state === 'OFFERING_CAROUSEL' && scrapedData && scrapedData.offerings.length > 0 && (
                        <OfferingsReviewCard
                            key="offerings"
                            offerings={scrapedData.offerings}
                            onComplete={(selectedOfferings) => {
                                setScrapedData({ ...scrapedData, offerings: selectedOfferings });
                                setState('COMPLETION');
                            }}
                        />
                    )}
                    {state === 'COMPLETION' && (
                        <CompletionCard
                            key="completion"
                            onFinish={() => window.location.href = '/dashboard'}
                        />
                    )}
                </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
