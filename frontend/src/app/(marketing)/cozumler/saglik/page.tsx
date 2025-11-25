import { SiteHeader } from "@/components/marketing/site-header"
import { SiteFooter } from "@/components/marketing/site-footer"
import { HealthcareHero } from "@/components/marketing/features/healthcare-hero"
import { AppointmentDemo } from "@/components/marketing/features/appointment-demo"
import { HealthcareFeatures } from "@/components/marketing/features/healthcare-features"

export default function HealthcarePage() {
    return (
        <main className="min-h-screen bg-black text-white selection:bg-teal-500/30">
            <SiteHeader />
            <HealthcareHero />
            <AppointmentDemo />
            <HealthcareFeatures />
            <SiteFooter />
        </main>
    )
}
