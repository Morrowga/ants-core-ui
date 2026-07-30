import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { Crown, ExternalLink } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { PageHeader } from "@/components/layout/PageHeader";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PaymentMethodDialog } from "@/features/billing/PaymentMethodDialog";
import {
  disableModule,
  enableModule,
  getModuleCatalog,
  getMyCompanyModules,
  getPaymentMethod,
  issueSsoCode,
} from "@/lib/api";
import type { CompanyModule, ModuleCatalogEntry } from "@/lib/types";
import { formatDate, formatMonthlyPrice } from "@/lib/utils";
import hrImage from "@/assets/hr.png";
import wrImage from "@/assets/wh.png";

/**
 * Where each module's own dashboard lives. Data-driven so future modules
 * just add an entry.
 */
const MODULE_DASHBOARD_URLS: Record<string, string | undefined> = {
  hr: import.meta.env.VITE_HR_DASHBOARD_URL,
};

/** Per-module icon shown in the card footer, same images used in the
 * employee portal's Home picker (@/lib/activeModule.ts there) -- keeping
 * them visually consistent between "enable this module" (here) and
 * "enter this module" (portal). */
const MODULE_IMAGES: Record<string, string | undefined> = {
  hr: hrImage,
  warehouse: wrImage,
};

/** Card preview text is cut to this many characters, with "See more"
 * opening a Dialog with the full description. */
const DESCRIPTION_TRUNCATE_LENGTH = 25;

function truncateDescription(description: string): string {
  if (description.length <= DESCRIPTION_TRUNCATE_LENGTH) return description;
  return description.slice(0, DESCRIPTION_TRUNCATE_LENGTH).trimEnd() + "…";
}

/** Splits a comma-separated feature description into list items for the
 * "see more" dialog -- e.g. "Attendance, reports, health -- one flat
 * price" becomes ["Attendance", "reports", "health -- one flat price"].
 * Simple on purpose: a plain comma split, not real NLP, which is fine
 * for the short marketing-copy style descriptions these actually are.
 * NOT translated -- these come from the backend's MODULE_CATALOG
 * (English only today), not from this file's i18n resources. */
function splitDescription(description: string): string[] {
  return description
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

export function ModuleMarketplacePage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [disableTarget, setDisableTarget] = useState<ModuleCatalogEntry | null>(null);
  const [needsPaymentFor, setNeedsPaymentFor] = useState<string | null>(null);
  // Which module's full description dialog is open, if any.
  const [descriptionTarget, setDescriptionTarget] = useState<ModuleCatalogEntry | null>(null);
  // Tracked per-module (not just mutation.isPending) so clicking "Enter" on
  // one card doesn't visually disable every other card's Enter button too.
  const [enteringKey, setEnteringKey] = useState<string | null>(null);
  // Same per-module tracking as enteringKey -- enable.isPending alone is
  // global across every card, which would show "Enabling..." on every
  // module's button at once, not just the one actually clicked.
  const [enablingKey, setEnablingKey] = useState<string | null>(null);

  function statusBadge(row: CompanyModule | undefined) {
    if (!row || row.status === "not_enabled" || row.status === "canceled") {
      return <Badge variant="outline">{t("marketplace.status.notEnabled")}</Badge>;
    }
    // "cancelling" here is a UI-only concept (active/trialing status +
    // auto_renew off) -- the backend never stores that literal word, see
    // the isCancelling derivation below for why.
    if ((row.status === "active" || row.status === "trialing") && row.auto_renew === false) {
      return (
        <Badge variant="secondary">
          {t("marketplace.status.cancelling", { date: formatDate(row.current_period_end) })}
        </Badge>
      );
    }
    switch (row.status) {
      case "active":
        return <Badge>{t("marketplace.status.active")}</Badge>;
      case "trialing":
        return <Badge variant="accent">{t("marketplace.status.trialing")}</Badge>;
      case "incomplete":
        return <Badge variant="destructive">{t("marketplace.status.incomplete")}</Badge>;
      default:
        return <Badge variant="outline">{row.status}</Badge>;
    }
  }

  const catalog = useQuery({ queryKey: ["module-catalog"], queryFn: getModuleCatalog });
  const companyModules = useQuery({
    queryKey: ["company-modules"],
    queryFn: getMyCompanyModules,
  });
  // Checked proactively before enabling -- if there's no card yet, open
  // the payment step first instead of attempting the charge and finding
  // out after the fact. retry:0 since a 409 here just means "no card
  // yet," not a transient failure worth retrying.
  const paymentMethod = useQuery({
    queryKey: ["payment-method"],
    queryFn: getPaymentMethod,
    retry: 0,
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["company-modules"] });

  const enable = useMutation({
    mutationFn: enableModule,
    onSuccess: () => {
      setEnablingKey(null);
      invalidate();
    },
    onError: (error, moduleKey) => {
      setEnablingKey(null);
      // Safety net, not the primary path anymore -- onEnableClick below
      // checks for a card BEFORE calling this, so this only fires if
      // something changed between that check and the actual call (e.g.
      // the card was removed in another tab) or a genuinely unexpected
      // failure.
      if (error instanceof AxiosError && [402, 409].includes(error.response?.status ?? 0)) {
        setNeedsPaymentFor(moduleKey);
      } else {
        window.alert(t("marketplace.enableFailed"));
      }
    },
  });

  const disable = useMutation({
    mutationFn: disableModule,
    onSuccess: () => {
      invalidate();
      setDisableTarget(null);
    },
    onError: () => window.alert(t("marketplace.disableFailed")),
  });

  // Real SSO handoff: issue a single-use code (good for ~30s), then redirect
  // straight there with it attached. mutationFn ignores the moduleKey
  // argument itself -- POST /auth/sso/issue-code doesn't take one, it's
  // generic per already-authenticated-user -- but keeping it as the
  // mutate() variable lets onSuccess/onError know which card triggered this.
  const enterModule = useMutation({
    mutationFn: async (_moduleKey: string) => issueSsoCode(),
    onSuccess: (data, moduleKey) => {
      const dashboardUrl = MODULE_DASHBOARD_URLS[moduleKey];
      setEnteringKey(null);
      if (!dashboardUrl) {
        window.alert(t("marketplace.dashboardNotConfigured"));
        return;
      }
      const url = new URL(dashboardUrl);
      url.searchParams.set("code", data.code);
      // New tab, same as the previous plain link -- Core Dashboard stays
      // open as home base rather than navigating away from it entirely.
      window.open(url.toString(), "_blank", "noopener,noreferrer");
    },
    onError: () => {
      setEnteringKey(null);
      window.alert(t("marketplace.enterFailed"));
    },
  });

  const onEnter = (moduleKey: string) => {
    if (!MODULE_DASHBOARD_URLS[moduleKey]) {
      window.alert(t("marketplace.dashboardNotConfigured"));
      return;
    }
    setEnteringKey(moduleKey);
    enterModule.mutate(moduleKey);
  };

  const hasCard = !!paymentMethod.data?.last4;

  // Check for a card BEFORE attempting to enable, not after -- if none,
  // open the payment step first; if one's already on file, purchase
  // with it directly. Also covers the "incomplete" case (a previous
  // attempt got stuck without a card): if a card exists now, just retry
  // enable directly rather than reopening the dialog unnecessarily.
  const onEnableClick = (moduleKey: string) => {
    if (!hasCard) {
      setNeedsPaymentFor(moduleKey);
      return;
    }
    setEnablingKey(moduleKey);
    enable.mutate(moduleKey);
  };

  const rowsByKey = new Map(
    (companyModules.data ?? []).map((row) => [row.module_key, row]),
  );

  const isLoading = catalog.isLoading || companyModules.isLoading;
  const isError = catalog.isError || companyModules.isError;
  // paymentMethod deliberately NOT included in isLoading/isError above --
  // a company with no card yet is an expected, common state (not an
  // error), and the marketplace itself should still render fully while
  // it resolves; onEnableClick just treats "not loaded yet" the same as
  // "no card" until it resolves, which is the safe default either way.

  return (
    <>
      <PageHeader
        title={t("marketplace.pageTitle")}
        description={t("marketplace.pageDescription")}
      />

      <QueryBoundary
        isLoading={isLoading}
        isError={isError}
        onRetry={() => {
          void catalog.refetch();
          void companyModules.refetch();
        }}
        label={t("marketplace.boundaryLabel")}
      >
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {catalog.data?.map((module) => {
            const row = rowsByKey.get(module.module_key);
            // Backend's disable endpoint only ever flips auto_renew to
            // false -- it never sets status to a "cancelling" string
            // (that value doesn't exist anywhere in the backend).
            // Deriving these from auto_renew directly is what actually
            // reflects reality; checking row?.status === "cancelling"
            // here would never be true, since the status word itself
            // stays "active" right up until the real period end.
            const isOn =
              (row?.status === "active" || row?.status === "trialing") &&
              row?.auto_renew !== false;
            const isCancelling =
              (row?.status === "active" || row?.status === "trialing") &&
              row?.auto_renew === false;
            const isIncomplete = row?.status === "incomplete";
            const isEntering = enteringKey === module.module_key;
            const isEnabling = enablingKey === module.module_key;
            const image = MODULE_IMAGES[module.module_key];
            const needsTruncation = module.description.length > DESCRIPTION_TRUNCATE_LENGTH;

            return (
              <Card key={module.module_key} className="relative flex flex-col overflow-hidden">
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <CardTitle>{module.name}</CardTitle>
                    {statusBadge(row)}
                  </div>
                  <CardDescription>{truncateDescription(module.description)}</CardDescription>
                  {needsTruncation && (
                    <button
                      type="button"
                      onClick={() => setDescriptionTarget(module)}
                      className="w-fit text-xs font-medium text-primary underline-offset-2 hover:underline"
                    >
                      {t("marketplace.seeMore")}
                    </button>
                  )}
                </CardHeader>
                <CardContent className="flex-1 space-y-1">
                  <p className="text-xl font-semibold tabular">
                    {formatMonthlyPrice(module.price_monthly_usd)}
                  </p>
                  {(isOn || isCancelling) && row?.current_period_end && (
                    <p className="text-xs text-muted-foreground">
                      {isCancelling
                        ? t("marketplace.ends", { date: formatDate(row.current_period_end) })
                        : t("marketplace.renews", { date: formatDate(row.current_period_end) })}
                    </p>
                  )}
                </CardContent>
                <CardFooter className="relative z-10 flex flex-wrap gap-2">
                  {!isOn && !isCancelling && (
                    <Button
                      onClick={() => onEnableClick(module.module_key)}
                      disabled={isEnabling}
                    >
                      {isEnabling
                        ? t("marketplace.enabling")
                        : isIncomplete
                          ? t("marketplace.finishPayment")
                          : t("marketplace.enable")}
                    </Button>
                  )}
                  {isOn && (
                    <Button
                      variant="outline"
                      onClick={() => setDisableTarget(module)}
                      disabled={disable.isPending}
                    >
                      {t("marketplace.disable")}
                    </Button>
                  )}
                  {/* Once cancelling, the Disable button is gone entirely
                      (not just disabled/greyed-out) -- the muted "ends on
                      {date}" text above already communicates the state,
                      and there's no undo action currently wired (re-enabling
                      before period end isn't exposed here), so a disabled
                      button with nothing it can do would just be confusing
                      chrome. */}
                  {isCancelling && (
                    <p className="text-xs text-muted-foreground">
                      {t("marketplace.disableDialog.scheduledNote", {
                        date: row?.current_period_end ? formatDate(row.current_period_end) : "",
                      })}
                    </p>
                  )}
                  {(isOn || isCancelling) && (
                    <Button
                      variant="secondary"
                      onClick={() => onEnter(module.module_key)}
                      disabled={isEntering}
                    >
                      {isEntering ? t("marketplace.opening") : t("marketplace.enter")}{" "}
                      <ExternalLink aria-hidden />
                    </Button>
                  )}
                </CardFooter>
                {/* Absolutely positioned, anchored to the card's bottom-right
                    corner -- takes it OUT of normal flex flow entirely, so it
                    can be as large as we want without growing the footer or
                    the card. z-0 (vs. the footer's z-10 above) puts the
                    buttons visually on top of it where they overlap.
                    pointer-events-none so it never intercepts clicks meant
                    for whatever's on top of it. Card has overflow-hidden so
                    this never spills past the card's rounded corners. */}
                {image && (
                  <img
                    src={image}
                    alt=""
                    className="pointer-events-none absolute bottom-6 right-4 z-0 h-28 w-28 object-contain opacity-90"
                  />
                )}
              </Card>
            );
          })}
        </div>
      </QueryBoundary>

      {/* Full description -- each feature gets a Crown icon instead of a
          plain bullet point. */}
      <Dialog open={!!descriptionTarget} onOpenChange={(open) => !open && setDescriptionTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{descriptionTarget?.name}</DialogTitle>
          </DialogHeader>
          <ul className="space-y-2">
            {descriptionTarget &&
              splitDescription(descriptionTarget.description).map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <Crown className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
          </ul>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDescriptionTarget(null)}>
              {t("common.close")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Disable confirmation — explains the deferred-cancellation rule */}
      <Dialog open={!!disableTarget} onOpenChange={(open) => !open && setDisableTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t("marketplace.disableDialog.title", { name: disableTarget?.name })}
            </DialogTitle>
            <DialogDescription>
              {t("marketplace.disableDialog.description")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDisableTarget(null)}>
              {t("marketplace.disableDialog.keepOn")}
            </Button>
            <Button
              variant="destructive"
              onClick={() => disableTarget && disable.mutate(disableTarget.module_key)}
              disabled={disable.isPending}
            >
              {disable.isPending
                ? t("marketplace.disableDialog.disabling")
                : t("marketplace.disableDialog.disableAtPeriodEnd")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment-method step when enabling with no card on file */}
      <PaymentMethodDialog
        open={!!needsPaymentFor}
        onOpenChange={(open) => !open && setNeedsPaymentFor(null)}
        onSaved={() => {
          const key = needsPaymentFor;
          setNeedsPaymentFor(null);
          queryClient.invalidateQueries({ queryKey: ["payment-method"] });
          if (key) {
            setEnablingKey(key);
            enable.mutate(key);
          }
        }}
      />
    </>
  );
}