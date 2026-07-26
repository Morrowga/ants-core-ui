import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "react-router-dom";

import { adminApi } from "./admin-api-client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface OrganizationRow {
  id: number;
  name: string;
  owner_email: string | null;
  company_count: number;
  created_at: string;
}

const fmtDate = (v: string | null) => (v ? new Date(v).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" }) : "—");

export function AdminOrganizationsPage() {
  const [search, setSearch] = useState("");
  const organizations = useQuery({
    queryKey: ["admin", "organizations", search],
    queryFn: async () =>
      (await adminApi.get<OrganizationRow[]>("/admin/organizations", { params: search ? { search } : {} })).data,
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Organizations</h1>
        <p className="text-sm text-slate-400">Every account on the platform</p>
      </div>

      <Input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by organization name…"
        className="max-w-sm border-slate-700 bg-slate-900 text-slate-100"
      />

      <Card className="border-slate-800 bg-slate-900">
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-left text-slate-400">
                <th className="px-4 py-3 font-medium">Organization</th>
                <th className="px-4 py-3 font-medium">Owner</th>
                <th className="px-4 py-3 font-medium">Companies</th>
                <th className="px-4 py-3 font-medium">Signed up</th>
              </tr>
            </thead>
            <tbody>
              {(organizations.data ?? []).map((org) => (
                <tr key={org.id} className="border-b border-slate-800/60 last:border-0 hover:bg-slate-800/40">
                  <td className="px-4 py-3">
                    <Link to={`/internal-admin/organizations/${org.id}`} className="font-medium text-slate-100 hover:underline">
                      {org.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-300">{org.owner_email ?? "—"}</td>
                  <td className="px-4 py-3 tabular-nums text-slate-300">{org.company_count}</td>
                  <td className="px-4 py-3 tabular-nums text-slate-300">{fmtDate(org.created_at)}</td>
                </tr>
              ))}
              {organizations.data?.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                    No organizations match this search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}