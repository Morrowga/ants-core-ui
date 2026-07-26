import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "react-router-dom";

import { adminApi } from "./admin-api-client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Ticket {
  id: number;
  company_id: number;
  company_name: string;
  subject: string;
  message: string;
  status: "open" | "in_progress" | "resolved";
  created_at: string;
  resolved_at: string | null;
}

const fmtDateTime = (v: string) => new Date(v).toLocaleString("en", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

export function AdminTicketsPage() {
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("open");
  const tickets = useQuery({
    queryKey: ["admin", "tickets", statusFilter],
    queryFn: async () =>
      (await adminApi.get<Ticket[]>("/admin/tickets", {
        params: statusFilter !== "all" ? { status_filter: statusFilter } : {},
      })).data,
  });
  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      adminApi.patch(`/admin/tickets/${id}`, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "tickets"] }),
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Support tickets</h1>
        <p className="text-sm text-slate-400">Requests submitted by company owners</p>
      </div>

      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="w-48 border-slate-700 bg-slate-900 text-slate-100">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="open">Open</SelectItem>
          <SelectItem value="in_progress">In progress</SelectItem>
          <SelectItem value="resolved">Resolved</SelectItem>
          <SelectItem value="all">All</SelectItem>
        </SelectContent>
      </Select>

      <div className="space-y-2">
        {(tickets.data ?? []).length === 0 && (
          <p className="text-sm text-slate-500">No tickets match this filter.</p>
        )}
        {(tickets.data ?? []).map((t) => (
          <Card key={t.id} className="border-slate-800 bg-slate-900">
            <CardContent className="flex items-start justify-between gap-4 p-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-slate-100">{t.subject}</p>
                  <Badge variant={t.status === "resolved" ? "default" : t.status === "in_progress" ? "secondary" : "destructive"}>
                    {t.status.replace("_", " ")}
                  </Badge>
                </div>
                <Link to={`/internal-admin/companies/${t.company_id}`} className="text-xs text-blue-400 hover:underline">
                  {t.company_name}
                </Link>
                <p className="mt-1 whitespace-pre-wrap text-sm text-slate-300">{t.message}</p>
                <p className="mt-1 text-xs text-slate-500">
                  Submitted {fmtDateTime(t.created_at)}
                  {t.resolved_at ? ` · Resolved ${fmtDateTime(t.resolved_at)}` : ""}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                {t.status !== "in_progress" && (
                  <Button size="sm" variant="outline" onClick={() => updateStatus.mutate({ id: t.id, status: "in_progress" })}>
                    In progress
                  </Button>
                )}
                {t.status !== "resolved" && (
                  <Button size="sm" onClick={() => updateStatus.mutate({ id: t.id, status: "resolved" })}>
                    Resolve
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}