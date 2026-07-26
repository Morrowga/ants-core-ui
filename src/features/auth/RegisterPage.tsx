import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { AuthLayout } from "./AuthLayout";

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
const registerSchema = z.object({
  organization_name: z.string().min(2, "Enter your organization's name."),
  owner_email: z.string().email("Enter a valid email address."),
  owner_password: z.string().min(8, "Use at least 8 characters."),
  owner_full_name: z.string().optional(),
});

type RegisterForm = z.infer<typeof registerSchema>;

export function RegisterPage() {
  const { register: registerAccount } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);
  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

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
      setServerError(detail ?? "Registration didn't go through. Check the fields and try again.");
    }
  };

  return (
    <AuthLayout title="Create your ANTS account">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="organization_name">Organization name</Label>
          <Input
            id="organization_name"
            placeholder="Acme Holdings"
            {...form.register("organization_name")}
          />
          <p className="text-xs text-muted-foreground">
            This is your account -- you'll create your first company next.
          </p>
          {form.formState.errors.organization_name && (
            <p className="text-xs text-destructive">
              {form.formState.errors.organization_name.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="owner_full_name">Your name (optional)</Label>
          <Input id="owner_full_name" autoComplete="name" {...form.register("owner_full_name")} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="owner_email">Email</Label>
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
          <Label htmlFor="owner_password">Password</Label>
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
          {form.formState.isSubmitting ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-muted-foreground">
        Already registered?{" "}
        <Link to="/login" className="font-medium text-foreground underline-offset-4 hover:underline">
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
}