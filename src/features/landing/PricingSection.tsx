import { useQuery } from "@tanstack/react-query";
import { Crown } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { QueryBoundary } from "@/components/shared/QueryBoundary";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getModuleCatalog } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { formatMonthlyPrice } from "@/lib/utils";
import hrImage from "@/assets/hr.png";
import whImage from "@/assets/wh.png";
import { SectionDivider } from "./SectionDivider";

/** Bottom-right watermark image per real module -- same low-opacity
 * overlay technique used on ModuleMarketplacePage's cards. Coming-soon
 * entries have no real image yet, so they simply don't get one. */
const MODULE_IMAGES: Record<string, string | undefined> = {
  hr: hrImage,
  warehouse: whImage,
};

const DESCRIPTION_TRUNCATE_LENGTH = 55;

function truncate(text: string): string {
  if (text.length <= DESCRIPTION_TRUNCATE_LENGTH) return text;
  return text.slice(0, DESCRIPTION_TRUNCATE_LENGTH).trimEnd() + "…";
}

/** Splits a comma-separated description into bullet items -- same
 * pattern as ModuleMarketplacePage's "see more" dialog. Descriptions
 * without commas (the coming-soon ones) just render as one bullet. */
function splitDescription(description: string): string[] {
  return description
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

type PricingCardData = {
  key: string;
  name: string;
  description: string;
  price?: number;
  comingSoon?: boolean;
  image?: string;
};

function PricingCard({
  card,
  isAuthenticated,
  onLearnMore,
}: {
  card: PricingCardData;
  isAuthenticated: boolean;
  onLearnMore: (card: PricingCardData) => void;
}) {
  const { t } = useTranslation();
  const needsTruncation = card.description.length > DESCRIPTION_TRUNCATE_LENGTH;

  return (
    <Card className={`relative flex h-full flex-col overflow-hidden ${card.comingSoon ? "border-dashed" : ""}`}>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle>{card.name}</CardTitle>
          {card.comingSoon && <Badge variant="outline">{t("features.landing.pricing.comingSoonBadge")}</Badge>}
        </div>
        <CardDescription>{truncate(card.description)}</CardDescription>
        {needsTruncation && (
          <button
            type="button"
            onClick={() => onLearnMore(card)}
            className="w-fit text-xs font-medium text-primary underline-offset-2 hover:underline"
          >
            {t("features.landing.pricing.learnMore")}
          </button>
        )}
      </CardHeader>

      {/* flex-1 spacer pushes price+button to the same bottom position
          on every card, regardless of how much description/badge
          content sits above it. */}
      <CardContent className="flex-1" />

      <CardContent>
        {card.comingSoon ? (
          <p className="text-sm text-muted-foreground">{t("features.landing.pricing.pricingNotSetYet")}</p>
        ) : (
          <p className="text-2xl font-semibold tabular">
            {formatMonthlyPrice(card.price ?? 0)}
          </p>
        )}
      </CardContent>
      <CardFooter>
        <Button asChild variant={card.comingSoon ? "outline" : "default"} className="w-full">
          {card.comingSoon ? (
            <Link to="/register">{t("features.landing.pricing.registerInterest")}</Link>
          ) : (
            // Logged-out visitors register first; logged-in owners
            // manage modules from their company's marketplace.
            <Link to={isAuthenticated ? "/companies" : "/register"}>
              {t("features.landing.pricing.getStarted")}
            </Link>
          )}
        </Button>
      </CardFooter>

      {/* Bottom-right watermark image, low opacity, same technique as
          ModuleMarketplacePage's cards. No image for coming-soon
          entries -- none exists yet. */}
      {card.image && (
        <img
          src={card.image}
          alt=""
          className="pointer-events-none absolute z-0 object-contain"
          style={{
            bottom: "-65px",
            right: "-40px",
            height: "192px",
            width: "192px",
            opacity: 0.2,
          }}
        />
      )}
    </Card>
  );
}

/**
 * Services & pricing grid -- the first 2 real modules from
 * GET /billing/modules (unchanged, still the same live data the real
 * authenticated Marketplace reads from), plus 2 static "coming soon"
 * cards. Nothing about the real catalog endpoint changed to support
 * this -- POS/AI OCR entries are constructed from translated text
 * below, still not real catalog data.
 */
export function PricingSection() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const catalog = useQuery({ queryKey: ["module-catalog"], queryFn: getModuleCatalog });
  const [learnMoreCard, setLearnMoreCard] = useState<PricingCardData | null>(null);

  const realCards: PricingCardData[] = (catalog.data ?? []).slice(0, 2).map((module) => ({
    key: module.module_key,
    name: module.name,
    description: module.description,
    price: module.price_monthly_usd,
    image: MODULE_IMAGES[module.module_key],
  }));

  // Deliberately NOT real catalog data -- see the module-level note this
  // file already had before translation. Names/descriptions now sourced
  // from i18n instead of a hardcoded English array.
  const comingSoonCards: PricingCardData[] = [
    {
      key: "pos",
      name: t("features.landing.pricing.comingSoonModules.pos.name"),
      description: t("features.landing.pricing.comingSoonModules.pos.description"),
      comingSoon: true,
    },
    {
      key: "ai-ocr",
      name: t("features.landing.pricing.comingSoonModules.aiOcr.name"),
      description: t("features.landing.pricing.comingSoonModules.aiOcr.description"),
      comingSoon: true,
    },
  ];

  const allCards = [...realCards, ...comingSoonCards];

  return (
    <section id="pricing" className="mx-auto w-full max-w-6xl px-6 py-16">
      <div className="mb-8">
        <h2 className="text-3xl font-semibold">{t("features.landing.pricing.title")}</h2>
        <SectionDivider />
        <p className="mt-2 max-w-xl text-muted-foreground">
          {t("features.landing.pricing.description")}
        </p>
      </div>

      <QueryBoundary
        isLoading={catalog.isLoading}
        isError={catalog.isError}
        onRetry={() => catalog.refetch()}
        label={t("features.landing.pricing.boundaryLabel")}
      >
        <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-2 lg:grid-cols-4">
          {allCards.map((card) => (
            <PricingCard
              key={card.key}
              card={card}
              isAuthenticated={isAuthenticated}
              onLearnMore={setLearnMoreCard}
            />
          ))}
        </div>
      </QueryBoundary>

      {/* Full description, Crown-icon bullets -- same pattern as
          ModuleMarketplacePage's "see more" dialog.

          IMPORTANT: relative/overflow-hidden live on the INNER wrapper
          div now, NOT on DialogContent itself. DialogContent's own base
          styling already sets `position: fixed` (that's what centers
          the modal in the viewport) -- adding `relative` directly to it
          creates a conflicting position utility pair, and Tailwind's
          class-merge logic keeps only the LAST one for the same CSS
          property, silently dropping `fixed`. That's what was making
          the dialog content invisible while the (separate) overlay
          element still rendered fine on its own. */}
      <Dialog open={!!learnMoreCard} onOpenChange={(open) => !open && setLearnMoreCard(null)}>
        <DialogContent>
          <div className="relative overflow-hidden">
            <DialogHeader>
              <DialogTitle>{learnMoreCard?.name}</DialogTitle>
            </DialogHeader>
            <ul className="space-y-2 mt-4">
              {learnMoreCard &&
                splitDescription(learnMoreCard.description).map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <Crown className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" aria-hidden />
                    <span>{item}</span>
                  </li>
                ))}
            </ul>
            <DialogFooter>
              <Button variant="outline" onClick={() => setLearnMoreCard(null)}>
                {t("features.landing.pricing.close")}
              </Button>
            </DialogFooter>
            {/* Same watermark, same bottom-right position/opacity as the
                card it came from. */}
            {learnMoreCard?.image && (
              <img
                src={learnMoreCard.image}
                alt=""
                className="pointer-events-none absolute z-0 object-contain"
                style={{
                  bottom: "-35px",
                  right: "-40px",
                  height: "192px",
                  width: "192px",
                  opacity: 0.2,
                }}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}