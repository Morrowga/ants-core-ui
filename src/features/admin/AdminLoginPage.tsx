import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAdminAuth } from "./admin-auth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AdminLoginPage() {
  const { login } = useAdminAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      navigate("/internal-admin/organizations", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
      <div className="w-full max-w-sm">
        <Card className="border-slate-800 bg-slate-900">
          <CardHeader>
            <p className="font-semibold tracking-tight text-slate-100">Ants — Internal</p>
            <CardDescription className="text-slate-400">Platform staff only</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive" className="border-red-900 bg-red-950 text-red-200">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-1.5">
                <Label className="text-slate-300">Email</Label>
                <Input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email" required
                  className="border-slate-700 bg-slate-800 text-slate-100"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-300">Password</Label>
                <Input
                  type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password" required
                  className="border-slate-700 bg-slate-800 text-slate-100"
                />
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Signing in…" : "Sign in"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}