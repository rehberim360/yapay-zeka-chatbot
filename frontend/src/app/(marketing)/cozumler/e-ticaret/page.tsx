import { SiteHeader } from "@/components/marketing/site-header"
import { SiteFooter } from "@/components/marketing/site-footer"
import { EcommerceHero } from "@/components/marketing/features/ecommerce-hero"
import { ProductDemo } from "@/components/marketing/features/product-demo"
import { EcommerceFeatures } from "@/components/marketing/features/ecommerce-features"

export default function EcommercePage() {
    return (
        <main className="min-h-screen bg-black text-white selection:bg-orange-500/30">
            <SiteHeader />
            <EcommerceHero />
            <ProductDemo />
            <EcommerceFeatures />
            <SiteFooter />
        </main>
    )
}
