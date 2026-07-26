import { useQuery } from "@tanstack/react-query";
import { Download } from "lucide-react";
import { useTranslation } from "react-i18next";
import { PageHeader } from "@/components/layout/PageHeader";
import { QueryBoundary } from "@/components/shared/QueryBoundary";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getInvoices } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";

export function InvoiceHistoryPage() {
  const { t } = useTranslation();
  const invoices = useQuery({ queryKey: ["invoices"], queryFn: getInvoices });

  return (
    <>
      <PageHeader
        title={t("features.invoices.pageTitle")}
        description={t("features.invoices.pageDescription")}
      />

      <QueryBoundary
        isLoading={invoices.isLoading}
        isError={invoices.isError}
        onRetry={() => invoices.refetch()}
        label={t("features.invoices.boundaryLabel")}
      >
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("features.invoices.table.number")}</TableHead>
                <TableHead>{t("features.invoices.table.date")}</TableHead>
                <TableHead>{t("features.invoices.table.status")}</TableHead>
                <TableHead>{t("features.invoices.table.amount")}</TableHead>
                <TableHead className="text-right">{t("features.invoices.table.download")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.data?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                    {t("features.invoices.empty")}
                  </TableCell>
                </TableRow>
              )}
              {invoices.data?.map((invoice) => (
                <TableRow key={invoice.number}>
                  <TableCell className="font-mono text-xs">{invoice.number}</TableCell>
                  <TableCell>{formatDate(invoice.created)}</TableCell>
                  <TableCell>
                    <Badge variant={invoice.status === "paid" ? "default" : "secondary"}>
                      {invoice.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="tabular">
                    {formatCurrency(invoice.amount_paid ?? invoice.amount_due, invoice.currency)}
                  </TableCell>
                  <TableCell className="text-right">
                    {invoice.invoice_pdf ? (
                      <Button variant="ghost" size="sm" asChild>
                        <a href={invoice.invoice_pdf} target="_blank" rel="noreferrer">
                          <Download aria-hidden /> {t("features.invoices.table.pdf")}
                        </a>
                      </Button>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </QueryBoundary>
    </>
  );
}