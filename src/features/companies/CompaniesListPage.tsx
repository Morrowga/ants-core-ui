import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { QueryBoundary } from "@/components/shared/QueryBoundary";
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
import { getCompanies } from "@/lib/api";
import { formatDate } from "@/lib/utils";

/** "Asia/Ho_Chi_Minh" -> "Ho Chi Minh". Drops everything before the
 * LAST "/" (also handles multi-segment zones like
 * "America/Argentina/Buenos_Aires" -> "Buenos Aires"), then swaps
 * underscores for spaces. Purely a display transform -- the underlying
 * IANA value stored/sent to the backend is untouched. */
function formatTimezoneLabel(timezone: string): string {
  const cityPart = timezone.includes("/") ? timezone.split("/").pop()! : timezone;
  return cityPart.replace(/_/g, " ");
}

export function CompaniesListPage() {
  const { t } = useTranslation();
  const companies = useQuery({ queryKey: ["companies"], queryFn: getCompanies });

  return (
    <>
      <PageHeader
        title={t("features.companies.pageTitle")}
        description={t("features.companies.pageDescription")}
        action={
          <Button asChild>
            <Link to="/companies/new">
              <Plus aria-hidden /> {t("features.companies.newCompany")}
            </Link>
          </Button>
        }
      />

      <QueryBoundary
        isLoading={companies.isLoading}
        isError={companies.isError}
        onRetry={() => companies.refetch()}
        label={t("features.companies.boundaryLabel")}
      >
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("features.companies.table.name")}</TableHead>
                <TableHead>{t("features.companies.table.industry")}</TableHead>
                <TableHead>{t("features.companies.table.timezone")}</TableHead>
                <TableHead>{t("features.companies.table.modulesEnabled")}</TableHead>
                <TableHead>{t("features.companies.table.created")}</TableHead>
                <TableHead className="text-right">{t("features.companies.table.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {companies.data?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                    {t("features.companies.empty")}
                  </TableCell>
                </TableRow>
              )}
              {companies.data?.map((company) => {
                const enabledCount =
                  company.modules?.filter((m) => m.status === "active" || m.status === "trialing")
                    .length ?? 0;
                return (
                  <TableRow key={company.id}>
                    <TableCell className="font-medium">{company.name}</TableCell>
                    <TableCell>{company.industry ?? "—"}</TableCell>
                    <TableCell>{formatTimezoneLabel(company.timezone)}</TableCell>
                    <TableCell className="tabular">{enabledCount}</TableCell>
                    <TableCell>{formatDate(company.created_at)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/companies/${company.id}/modules`}>
                          {t("features.companies.table.manageModules")}
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      </QueryBoundary>
    </>
  );
}