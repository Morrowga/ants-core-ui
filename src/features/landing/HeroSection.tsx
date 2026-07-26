import { Link } from "react-router-dom";
import { BrandMark } from "@/components/shared/BrandMark";
import { Button } from "@/components/ui/button";
import { ModuleShowcase } from "./ModuleShowcase";

export function HeroSection() {
  return (
    <section className="mx-auto grid min-h-[calc(100vh-2rem)] w-full max-w-6xl grid-cols-1 items-center gap-12 px-6 py-16 lg:grid-cols-2 lg:gap-8">
      {/* Left column */}
      <div className="flex flex-col items-start gap-6">
        <BrandMark wordmark="ANTS Central" imgClassName="h-9 w-9" textClassName="text-xl" />

        <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
          One place to run it all.
        </h1>

        <p className="max-w-md text-base text-muted-foreground">
          ANTS is a set of business modules that share one account, one bill,
          and one login. Enable the ones your company needs — HR today, more
          on the way — and skip the rest.
        </p>

        {/* Button row — exact order: Login (outline), Register (primary,
            most prominent), Plans (ghost) */}
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" asChild>
            <Link to="/login">Login</Link>
          </Button>
          <Button size="lg" asChild>
            <Link to="/register">Register</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link to="/plans">Plans</Link>
          </Button>
        </div>
      </div>

      {/* Right column — animated module showcase */}
      <ModuleShowcase />
    </section>
  );
}
