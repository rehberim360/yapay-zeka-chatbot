import { SiteHeader } from '@/components/marketing/site-header'
import { SiteFooter } from '@/components/marketing/site-footer'
import { MultiLanguageHero } from '@/components/marketing/features/multi-language-hero'
import { InteractiveLanguageDemo } from '@/components/marketing/features/interactive-language-demo'
import { LanguageBenefits } from '@/components/marketing/features/language-benefits'

export const metadata = {
    title: 'Çoklu Dil Desteği - 40+ Dilde Anında Çeviri | YapayZekaChatbot',
    description: 'İşletmenizi dünyaya açın. Yapay zeka asistanımız 40\'tan fazla dilde akıcı konuşarak global müşterilerinize 7/24 destek verir.',
}

export default function MultiLanguagePage() {
    return (
        <main className="min-h-screen bg-black text-white selection:bg-neon-cyan selection:text-black">
            <SiteHeader />

            <MultiLanguageHero />
            <InteractiveLanguageDemo />
            <LanguageBenefits />

            <SiteFooter />
        </main>
    )
}
