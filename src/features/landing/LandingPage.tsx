import { ContactSection } from "./ContactSection";
import { HeroSection } from "./HeroSection";
import { PricingSection } from "./PricingSection";
import { ServicesSection } from "./ServicesSection";
import { SupportSection } from "./SupportSection";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <ServicesSection />
      <PricingSection />
      <SupportSection />
      <ContactSection />

      <footer>
        <div className="py-5 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} ANTS. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
