import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createCompany } from "@/lib/api";
import { useAuth } from "@/lib/auth";

/**
 * "New project" — create an additional Company under the existing
 * Organization. organization_id comes from the JWT (see auth.tsx), not
 * from anywhere in this component's own state -- it's who's logged in
 * that determines which org a new company belongs to, never a value
 * typed/guessed on this form.
 *
 * NOTE on workdays: displayed here as "Mon"/"Tue"/etc for readability, but
 * the backend stores and compares these lowercase ("mon","tue",...) --
 * see CompanyCreate's default in app/core/schemas/organizations.py.
 * Lowercased right before submit so this never depends on the backend
 * silently normalizing casing for us.
 *
 * TIMEZONE_OPTIONS below is copied verbatim from HR Dashboard's
 * SettingsPage.tsx (features/settings/SettingsPage.tsx), so the two
 * projects show IDENTICAL timezone choices -- same values, same display
 * labels. There's no shared package between these two separate frontend
 * projects, so this is a deliberate duplication, same pattern HR
 * Dashboard already uses between its own SettingsPage.tsx and
 * auth_pages.tsx. If the list changes, update both copies.
 * Intentionally untranslated (place names/IANA identifiers, not UI
 * chrome), matching that file's own stated reasoning.
 */

const TIMEZONE_OPTIONS = [
  { value: "UTC", label: "UTC" },
  { value: "Asia/Yangon", label: "Yangon (Myanmar)" },
  { value: "Asia/Bangkok", label: "Bangkok (Thailand)" },
  { value: "Asia/Ho_Chi_Minh", label: "Ho Chi Minh City (Vietnam)" },
  { value: "Asia/Jakarta", label: "Jakarta (Indonesia)" },
  { value: "Asia/Singapore", label: "Singapore" },
  { value: "Asia/Kuala_Lumpur", label: "Kuala Lumpur (Malaysia)" },
  { value: "Asia/Manila", label: "Manila (Philippines)" },
  { value: "Asia/Hong_Kong", label: "Hong Kong" },
  { value: "Asia/Shanghai", label: "Shanghai (China)" },
  { value: "Asia/Taipei", label: "Taipei (Taiwan)" },
  { value: "Asia/Tokyo", label: "Tokyo (Japan)" },
  { value: "Asia/Seoul", label: "Seoul (South Korea)" },
  { value: "Asia/Kolkata", label: "Kolkata (India)" },
  { value: "Asia/Dhaka", label: "Dhaka (Bangladesh)" },
  { value: "Asia/Dubai", label: "Dubai (UAE)" },
  { value: "Europe/London", label: "London (UK)" },
  { value: "Europe/Paris", label: "Paris (France)" },
  { value: "Europe/Berlin", label: "Berlin (Germany)" },
  { value: "Europe/Moscow", label: "Moscow (Russia)" },
  { value: "America/New_York", label: "New York (US Eastern)" },
  { value: "America/Chicago", label: "Chicago (US Central)" },
  { value: "America/Denver", label: "Denver (US Mountain)" },
  { value: "America/Los_Angeles", label: "Los Angeles (US Pacific)" },
  { value: "America/Sao_Paulo", label: "São Paulo (Brazil)" },
  { value: "Australia/Sydney", label: "Sydney (Australia)" },
  { value: "Pacific/Auckland", label: "Auckland (New Zealand)" },
];

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

const createCompanySchema = z.object({
  name: z.string().min(2, "Enter the company's name."),
  industry: z.string().min(2, "Enter an industry."),
  timezone: z.string().min(1, "Pick a timezone."),
  currency: z.string().min(3, "Pick a currency.").max(3),
  working_hours_start: z.string().min(1, "Set a start time."),
  working_hours_end: z.string().min(1, "Set an end time."),
  workdays: z.array(z.string()).min(1, "Pick at least one workday."),
});

type CreateCompanyForm = z.infer<typeof createCompanySchema>;

export function CreateCompanyPage() {
  const navigate = useNavigate();
  const { claims } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<CreateCompanyForm>({
    resolver: zodResolver(createCompanySchema),
    defaultValues: {
      currency: "USD",
      working_hours_start: "09:00",
      working_hours_end: "18:00",
      workdays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    },
  });

  const mutation = useMutation({
    mutationFn: (values: CreateCompanyForm) => {
      if (!claims?.organization_id) {
        throw new Error("Your session doesn't have an organization on it — try logging in again.");
      }
      return createCompany(claims.organization_id, {
        name: values.name,
        industry: values.industry,
        timezone: values.timezone,
        currency: values.currency.toUpperCase(),
        working_hours_start: values.working_hours_start,
        working_hours_end: values.working_hours_end,
        workdays: values.workdays.map((d) => d.toLowerCase()),
      });
    },
    onSuccess: (company) => {
      navigate(`/companies/${company.id}/modules`, { replace: true });
    },
    onError: (error) => {
      const detail =
        error instanceof AxiosError
          ? (error.response?.data as { detail?: string } | undefined)?.detail
          : error instanceof Error
            ? error.message
            : undefined;
      setServerError(detail ?? "Couldn't create the company. Check the fields and try again.");
    },
  });

  const onSubmit = (values: CreateCompanyForm) => {
    setServerError(null);
    mutation.mutate(values);
  };

  const workdays = form.watch("workdays");

  return (
    <div className="max-w-2xl">
      <PageHeader
        title="New company"
        description="A separate workspace under your organization, with its own modules and billing rows."
      />

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="name">Name</Label>
                <Input id="name" {...form.register("name")} />
                {form.formState.errors.name && (
                  <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="industry">Industry</Label>
                <Input id="industry" placeholder="e.g. Retail" {...form.register("industry")} />
                {form.formState.errors.industry && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.industry.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="timezone">Timezone</Label>
                <Controller
                  control={form.control}
                  name="timezone"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="timezone">
                        <SelectValue placeholder="Pick a timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        {TIMEZONE_OPTIONS.map((tz) => (
                          <SelectItem key={tz.value} value={tz.value}>
                            {tz.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {form.formState.errors.timezone && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.timezone.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="currency">Currency</Label>
                <Input id="currency" placeholder="USD" maxLength={3} {...form.register("currency")} />
                {form.formState.errors.currency && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.currency.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="working_hours_start">Working hours start</Label>
                <Input id="working_hours_start" type="time" {...form.register("working_hours_start")} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="working_hours_end">Working hours end</Label>
                <Input id="working_hours_end" type="time" {...form.register("working_hours_end")} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Workdays</Label>
              <div className="flex flex-wrap gap-2">
                {WEEKDAYS.map((day) => {
                  const selected = workdays?.includes(day);
                  return (
                    <Button
                      key={day}
                      type="button"
                      size="sm"
                      variant={selected ? "default" : "outline"}
                      aria-pressed={selected}
                      onClick={() => {
                        const next = selected
                          ? workdays.filter((d) => d !== day)
                          : [...(workdays ?? []), day];
                        form.setValue("workdays", next, { shouldValidate: true });
                      }}
                    >
                      {day}
                    </Button>
                  );
                })}
              </div>
              {form.formState.errors.workdays && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.workdays.message as string}
                </p>
              )}
            </div>

            {serverError && (
              <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {serverError}
              </p>
            )}

            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Creating…" : "Create company"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}