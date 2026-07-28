import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { AuthLayout } from "./AuthLayout";

type RegisterForm = {
  organization_name: string;
  owner_email: string;
  owner_password: string;
  owner_full_name?: string;
};

/** Registration now creates ONLY the Organization + its owner_admin user --
 *  no Company gets created here anymore (that used to happen automatically,
 *  named after company_name or organization_name). The owner creates their
 *  first Company explicitly, whenever they choose, from the company-create
 *  screen after landing -- see the post-submit navigate() below.
 *
 *  company_name and timezone are REMOVED from this form on purpose, not
 *  just hidden: they described a Company that no longer gets created at
 *  this step, so asking for them here would be misleading. Backend still
 *  accepts them on CompanyRegisterRequest for compatibility, but this form
 *  no longer sends them. */
export function RegisterPage() {
  const { t } = useTranslation();
  const { register: registerAccount, claims } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  // Built here, not as a module-level constant, so the error messages
  // inside it are translated -- zod schemas can't call t() themselves.
  const registerSchema = useMemo(
    () =>
      z.object({
        organization_name: z.string().min(2, t("features.landing.register.orgNameError")),
        owner_email: z.string().email(t("features.landing.register.emailError")),
        owner_password: z.string().min(8, t("features.landing.register.passwordError")),
        owner_full_name: z.string().optional(),
      }),
    [t],
  );

  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  // Already signed in -- registering again makes no sense; send them
  // straight to their real home instead of showing this form at all.
  // Checked at render time (not a useEffect) so there's no flash of the
  // form before redirecting.
  if (claims) {
    return <Navigate to="/companies" replace />;
  }

  const onSubmit = async (values: RegisterForm) => {
    setServerError(null);
    try {
      await registerAccount({
        organization_name: values.organization_name,
        owner_email: values.owner_email,
        owner_password: values.owner_password,
        owner_full_name: values.owner_full_name,
      });
      // No Company exists yet -- there's nothing to land in except the
      // "create your first company" step. Previously this branched on
      // claims.company_id to skip straight to a module marketplace; that
      // branch is gone because company_id is never set at this point
      // anymore, not even for the common case.
      navigate("/companies/new", { replace: true });
    } catch (error) {
      const detail =
        error instanceof AxiosError
          ? (error.response?.data as { detail?: string } | undefined)?.detail
          : undefined;
      setServerError(detail ?? t("features.landing.register.serverError"));
    }
  };

  return (
    <AuthLayout title={t("features.landing.register.title")}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="organization_name">{t("features.landing.register.orgNameLabel")}</Label>
          <Input
            id="organization_name"
            placeholder={t("features.landing.register.orgNamePlaceholder")}
            {...form.register("organization_name")}
          />
          <p className="text-xs text-muted-foreground">
            {t("features.landing.register.orgNameHelp")}
          </p>
          {form.formState.errors.organization_name && (
            <p className="text-xs text-destructive">
              {form.formState.errors.organization_name.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="owner_full_name">{t("features.landing.register.fullNameLabel")}</Label>
          <Input id="owner_full_name" autoComplete="name" {...form.register("owner_full_name")} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="owner_email">{t("features.landing.register.emailLabel")}</Label>
          <Input
            id="owner_email"
            type="email"
            autoComplete="email"
            {...form.register("owner_email")}
          />
          {form.formState.errors.owner_email && (
            <p className="text-xs text-destructive">{form.formState.errors.owner_email.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="owner_password">{t("features.landing.register.passwordLabel")}</Label>
          <Input
            id="owner_password"
            type="password"
            autoComplete="new-password"
            {...form.register("owner_password")}
          />
          {form.formState.errors.owner_password && (
            <p className="text-xs text-destructive">
              {form.formState.errors.owner_password.message}
            </p>
          )}
        </div>

        {serverError && (
          <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{serverError}</p>
        )}

        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting
            ? t("features.landing.register.submitting")
            : t("features.landing.register.submit")}
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-muted-foreground">
        {t("features.landing.register.alreadyRegistered")}{" "}
        <Link to="/login" className="font-medium text-foreground underline-offset-4 hover:underline">
          {t("features.landing.register.loginLink")}
        </Link>
      </p>
    </AuthLayout>
  );
}