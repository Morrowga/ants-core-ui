import { useQuery } from "@tanstack/react-query";
import { CreditCard } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { PageHeader } from "@/components/layout/PageHeader";
import { QueryBoundary } from "@/components/shared/QueryBoundary";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getCompanies,
  getModuleCatalog,
  getMyCompanyModules,
  getPaymentMethod,
} from "@/lib/api";
import { formatMonthlyPrice } from "@/lib/utils";
import { PaymentMethodDialog } from "./PaymentMethodDialog";

export function BillingOverviewPage() {
  const { t } = useTranslation();
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);

  const paymentMethod = useQuery({
    queryKey: ["payment-method"],
    queryFn: getPaymentMethod,
    retry: 0,
  });
  const catalog = useQuery({ queryKey: ["module-catalog"], queryFn: getModuleCatalog });
  const companies = useQuery({ queryKey: ["companies"], queryFn: getCompanies });
  // Fallback for backends where GET /companies doesn't include module rows.
  const myModules = useQuery({ queryKey: ["company-modules"], queryFn: getMyCompanyModules });

  const priceByKey = new Map(
    (catalog.data ?? []).map((m) => [m.module_key, m]),
  );

  // Itemized charges: per enabled module across every Company.
  const chargeRows = (companies.data ?? []).flatMap((company) => {
    const rows =
      company.modules ??
      // Single-company orgs: use the "me"-scoped rows as the fallback.
      (companies.data?.length === 1 ? myModules.data ?? [] : []);
    return rows
      .filter((m) => m.status === "active" || m.status === "trialing" || m.status === "cancelling")
      .map((m) => ({
        companyName: company.name,
        module: priceByKey.get(m.module_key),
        moduleKey: m.module_key,
        status: m.status,
      }));
  });

  const total = chargeRows.reduce(
    (sum, row) => sum + (row.status !== "cancelling" ? row.module?.price_monthly_usd ?? 0 : 0),
    0,
  );

  const isLoading = catalog.isLoading || companies.isLoading;
  const isError = catalog.isError || companies.isError;

  return (
    <>
      <PageHeader
        title={t("features.billing.pageTitle")}
        description={t("features.billing.pageDescription")}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Payment method */}
        <Card>
          <CardHeader>
            <CardTitle>{t("features.billing.paymentMethod.title")}</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm">
              <CreditCard className="h-4 w-4 text-muted-foreground" aria-hidden />
              {paymentMethod.data?.last4 ? (
                <span className="tabular">
                  {paymentMethod.data.brand ? `${paymentMethod.data.brand} ` : ""}
                  •••• {paymentMethod.data.last4}
                </span>
              ) : (
                <span className="text-muted-foreground">{t("features.billing.paymentMethod.noCard")}</span>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={() => setPaymentDialogOpen(true)}>
              {t("features.billing.paymentMethod.update")}
            </Button>
          </CardContent>
        </Card>

        {/* Current charges */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t("features.billing.currentCharges.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <QueryBoundary
              isLoading={isLoading}
              isError={isError}
              onRetry={() => {
                void catalog.refetch();
                void companies.refetch();
              }}
              label={t("features.billing.currentCharges.boundaryLabel")}
            >
              {chargeRows.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  {t("features.billing.currentCharges.empty")}
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("features.billing.currentCharges.table.company")}</TableHead>
                      <TableHead>{t("features.billing.currentCharges.table.module")}</TableHead>
                      <TableHead>{t("features.billing.currentCharges.table.price")}</TableHead>
                      <TableHead>{t("features.billing.currentCharges.table.status")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {chargeRows.map((row) => (
                      <TableRow key={`${row.companyName}-${row.moduleKey}`}>
                        <TableCell>{row.companyName}</TableCell>
                        <TableCell className="font-medium">
                          {row.module?.name ?? row.moduleKey}
                        </TableCell>
                        <TableCell className="tabular">
                          {row.module ? formatMonthlyPrice(row.module.price_monthly_usd) : "—"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={row.status === "cancelling" ? "secondary" : "default"}>
                            {row.status === "cancelling"
                              ? t("features.billing.currentCharges.statusCancelling")
                              : t(`marketplace.status.${row.status}`, { defaultValue: row.status })}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={2} className="font-medium">
                        {t("features.billing.currentCharges.table.total")}
                      </TableCell>
                      <TableCell className="tabular font-semibold">
                        {formatMonthlyPrice(total)}
                      </TableCell>
                      <TableCell />
                    </TableRow>
                  </TableBody>
                </Table>
              )}
            </QueryBoundary>
          </CardContent>
        </Card>
      </div>

      <PaymentMethodDialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen} />
    </>
  );
}