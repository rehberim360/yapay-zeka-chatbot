import { SiteHeader } from "@/components/marketing/site-header"
import { SiteFooter } from "@/components/marketing/site-footer"
import { RealEstateHero } from "@/components/marketing/features/real-estate-hero"
import { PropertyDemo } from "@/components/marketing/features/property-demo"
import { RealEstateFeatures } from "@/components/marketing/features/real-estate-features"

export default function RealEstatePage() {
    return (
        <main className="min-h-screen bg-black text-white selection:bg-blue-500/30">
            <SiteHeader />
            <RealEstateHero />
            <PropertyDemo />
            <RealEstateFeatures />
            <SiteFooter />
        </main>
    )
}
