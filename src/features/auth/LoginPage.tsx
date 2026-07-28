import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getCompanies } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { AuthLayout } from "./AuthLayout";
import { markJustLoggedIn } from "./WelcomeDialog";

type LoginForm = {
  email: string;
  password: string;
};

export function LoginPage() {
  const { t } = useTranslation();
  const { login, claims } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState<string | null>(null);

  // Built here, not as a module-level constant, so the error messages
  // inside it are translated -- zod schemas can't call t() themselves.
  const loginSchema = useMemo(
    () =>
      z.object({
        email: z.string().email(t("features.landing.login.emailError")),
        password: z.string().min(1, t("features.landing.login.passwordError")),
      }),
    [t],
  );

  const form = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  // Already signed in -- landing on the login form again makes no
  // sense; send them straight to their real home instead. Checked at
  // render time (not a useEffect) so there's no flash of the form
  // before redirecting.
  if (claims) {
    return <Navigate to="/companies" replace />;
  }

  const onSubmit = async (values: LoginForm) => {
    setServerError(null);
    try {
      await login(values.email, values.password);
      markJustLoggedIn();

      // If they were bounced here from a protected page, go back there.
      const from = (location.state as { from?: string } | null)?.from;
      if (from) {
        navigate(from, { replace: true });
        return;
      }

      // Otherwise: straight to the marketplace when the org has exactly one
      // company, or the companies list when there are several.
      try {
        const companies = await getCompanies();
        if (companies.length === 1) {
          navigate(`/companies/${companies[0].id}/modules`, { replace: true });
          return;
        }
      } catch {
        // Fall through to /companies; it has its own error state.
      }
      navigate("/companies", { replace: true });
    } catch (error) {
      const detail =
        error instanceof AxiosError
          ? (error.response?.data as { detail?: string } | undefined)?.detail
          : undefined;
      setServerError(detail ?? t("features.landing.login.serverError"));
    }
  };

  return (
    <AuthLayout title={t("features.landing.login.title")}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="email">{t("features.landing.login.emailLabel")}</Label>
          <Input id="email" type="email" autoComplete="email" {...form.register("email")} />
          {form.formState.errors.email && (
            <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">{t("features.landing.login.passwordLabel")}</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            {...form.register("password")}
          />
          {form.formState.errors.password && (
            <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>
          )}
        </div>

        {serverError && (
          <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{serverError}</p>
        )}

        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting
            ? t("features.landing.login.submitting")
            : t("features.landing.login.submit")}
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-muted-foreground">
        {t("features.landing.login.newToAnts")}{" "}
        <Link to="/register" className="font-medium text-foreground underline-offset-4 hover:underline">
          {t("features.landing.login.registerLink")}
        </Link>
      </p>
    </AuthLayout>
  );
}