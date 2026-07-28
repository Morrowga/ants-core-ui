import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";
import { FloatingLanguageSwitcher } from "@/features/landing/HeroSection";

/**
 * Split-screen auth shell, shared by LoginPage and RegisterPage.
 *
 * Headline reuses features.landing.hero.headline (the exact same
 * string as the landing page's Hero) instead of a duplicate key, so the
 * two never drift out of sync if it's ever reworded.
 *
 * FloatingLanguageSwitcher imported from HeroSection.tsx (now exported
 * there) rather than duplicated -- same circular/expanding-flags
 * language picker as the landing page.
 */
export function AuthLayout({ title, children }: { title: string; children: ReactNode }) {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen">
      {/* Left: branding panel. Hidden below lg -- on narrow screens
          there isn't room for both a branding panel and a usable form,
          so the form gets the full width instead. */}
      <div className="relative hidden w-1/2 overflow-hidden bg-background lg:block">
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <path
            d="M0,0 L50,0 C42,25 58,75 50,100 L0,100 Z"
            style={{ fill: "hsl(210 20% 80%)", fillOpacity: 0.3 }}
          />
          <path
            d="M50,0 C42,25 58,75 50,100 L100,100 L100,0 Z"
            style={{ fill: "hsl(23 33% 32%)", fillOpacity: 0.7 }}
          />
        </svg>
        <div className="relative z-10 flex h-full flex-col items-start justify-start gap-8 px-16 pt-24">
          <div className="flex flex-col items-start gap-4">
            <div className="flex flex-row items-center">
              <img src={logo} alt="" className="h-[120px] w-[120px] object-contain" />
              {/* "ANTS" is the brand name, not translated. */}
              <span className="font-display text-6xl font-bold text-espresso">ANTS</span>
            </div>
            <h2
              style={{
                textShadow: "1px 1.5px 5px rgba(0, 0, 0, 0.14), 2px 3px 10px rgba(0, 0, 0, 0.08)",
              }}
              className="max-w-md text-4xl font-semibold tracking-tight text-espresso"
            >
              {t("features.landing.hero.headline")}
            </h2>
          </div>
        </div>
      </div>

      {/* Right: the actual form, passed in as children -- unchanged
          from whatever LoginPage/RegisterPage already render. */}
      <div className="flex w-full items-center justify-center bg-background px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-sm">
          <Link
            to="/"
            className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-espresso"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            {t("features.landing.authLayout.homeLink")}
          </Link>
          <h1 className="mb-6 text-2xl font-semibold text-espresso">{title}</h1>
          {children}
        </div>
      </div>

      <FloatingLanguageSwitcher />
    </div>
  );
}