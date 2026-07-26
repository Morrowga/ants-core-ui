import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ContactSection } from "./ContactSection";
import { HeroSection } from "./HeroSection";
import { PricingSection } from "./PricingSection";
import { SupportSection } from "./SupportSection";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <PricingSection />
      <SupportSection />
      <ContactSection />

      <footer className="border-t">
        {/* Final call-to-action row — same styling as the hero's buttons */}
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-4 px-6 py-12 text-center">
          <h2 className="text-2xl font-semibold">Ready when you are.</h2>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button variant="outline" asChild>
              <Link to="/login">Login</Link>
            </Button>
            <Button size="lg" asChild>
              <Link to="/register">Register</Link>
            </Button>
          </div>
        </div>
        <div className="border-t py-5 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} ANTS. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
