import { SiteHeader } from '@/components/marketing/site-header'
import { SiteFooter } from '@/components/marketing/site-footer'
import { SmartOnboardingHero } from '@/components/marketing/features/smart-onboarding-hero'
import { SmartOnboardingSteps } from '@/components/marketing/features/smart-onboarding-steps'
import { GrowingIntegrationCard } from '@/components/marketing/features/growing-integration-card'

export const metadata = {
    title: 'Akıllı Kurulum - Kod Yok, Sadece Zeka | YapayZekaChatbot',
    description: 'Web sitenizi saniyeler içinde tarayan ve işletmenize özel bir yapay zeka asistanı oluşturan Smart Onboarding teknolojimizle tanışın.',
}

export default function SmartOnboardingPage() {
    return (
        <main className="min-h-screen bg-black text-white selection:bg-electric-indigo selection:text-white">
            <SiteHeader />

            <SmartOnboardingHero />
            <SmartOnboardingSteps />
            <GrowingIntegrationCard />

            <SiteFooter />
        </main>
    )
}
