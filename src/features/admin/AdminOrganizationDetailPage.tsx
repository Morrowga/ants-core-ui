import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import { adminApi } from "./admin-api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface OrganizationDetail {
  id: number;
  name: string;
  owner_email: string | null;
  owner_id: number | null;
  stripe_customer_id: string | null;
  created_at: string;
  company_count: number;
}

const fmtDate = (v: string) => new Date(v).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" });

export function AdminOrganizationDetailPage() {
  const { id } = useParams();
  const organization = useQuery({
    queryKey: ["admin", "organization", id],
    queryFn: async () => (await adminApi.get<OrganizationDetail>(`/admin/organizations/${id}`)).data,
  });

  if (organization.isLoading) return <p className="text-slate-400">Loading…</p>;
  if (!organization.data) return <p className="text-slate-400">Organization not found.</p>;
  const data = organization.data;

  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" asChild className="-ml-2 text-slate-400 hover:bg-slate-800 hover:text-slate-100">
        <Link to="/internal-admin/organizations"><ArrowLeft className="h-4 w-4" /> Organizations</Link>
      </Button>

      <div>
        <h1 className="text-xl font-semibold">{data.name}</h1>
        <p className="text-sm text-slate-400">
          {data.owner_email ?? "No owner on record"} · Signed up {fmtDate(data.created_at)}
        </p>
      </div>

      <Card className="border-slate-800 bg-slate-900">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-slate-200">Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm text-slate-300">
          <p>Owner email: {data.owner_email ?? "—"}</p>
          <p>Companies: {data.company_count}</p>
          <p>Stripe customer: {data.stripe_customer_id ?? "Not set"}</p>
          <p>Signed up: {fmtDate(data.created_at)}</p>
        </CardContent>
      </Card>
    </div>
  );
}