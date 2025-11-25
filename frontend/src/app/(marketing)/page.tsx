import { SiteHeader } from "@/components/marketing/site-header";
import { HeroSection } from "@/components/marketing/hero-section";
import { HowItWorksSection } from "@/components/marketing/how-it-works-section";
import { UniversalAdaptabilitySection } from "@/components/marketing/universal-adaptability-section";
import { FeaturesSection } from "@/components/marketing/features-section";
import { PricingSection } from "@/components/marketing/pricing-section";
import { BlogSection } from "@/components/marketing/blog-section";
import { SiteFooter } from "@/components/marketing/site-footer";
import { LaunchCountdownPopup } from "@/components/ui/launch-countdown-popup";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <LaunchCountdownPopup />
      <SiteHeader />
      <HeroSection />
      <HowItWorksSection />
      <UniversalAdaptabilitySection />
      <FeaturesSection />
      <PricingSection />
      <BlogSection />
      <SiteFooter />
    </main>
  );
}
