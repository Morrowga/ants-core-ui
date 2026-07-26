import { Link } from "react-router-dom";
import { BrandMark } from "@/components/shared/BrandMark";
import { Button } from "@/components/ui/button";
import { PricingSection } from "@/features/landing/PricingSection";

/**
 * Standalone /plans route: reuses PricingSection unmodified — same design,
 * same data source, just without the hero above it.
 */
export function PlansPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
        <Link to="/" aria-label="ANTS home">
          <BrandMark />
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to="/login">Login</Link>
          </Button>
          <Button size="sm" asChild>
            <Link to="/register">Register</Link>
          </Button>
        </div>
      </header>
      <PricingSection />
      <footer className="border-t py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} ANTS. All rights reserved.
      </footer>
    </div>
  );
}
