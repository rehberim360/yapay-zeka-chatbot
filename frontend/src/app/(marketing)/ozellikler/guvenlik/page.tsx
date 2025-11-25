import { SiteHeader } from "@/components/marketing/site-header"
import { SiteFooter } from "@/components/marketing/site-footer"
import { SecurityHero } from "@/components/marketing/features/security-hero"
import { GuardrailsDemo } from "@/components/marketing/features/guardrails-demo"
import { SecurityFeatures } from "@/components/marketing/features/security-features"

export default function SecurityPage() {
    return (
        <main className="min-h-screen bg-black text-white selection:bg-emerald-500/30">
            <SiteHeader />
            <SecurityHero />
            <GuardrailsDemo />
            <SecurityFeatures />
            <SiteFooter />
        </main>
    )
}
