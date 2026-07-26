import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { changePassword, getOrganization, updateOrganizationName } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export function OrganizationSettingsPage() {
  const { t } = useTranslation();
  const { claims } = useAuth();
  const [nameServerError, setNameServerError] = useState<string | null>(null);
  const [nameSaved, setNameSaved] = useState(false);
  const [passwordServerError, setPasswordServerError] = useState<string | null>(null);
  const [passwordSaved, setPasswordSaved] = useState(false);

  // Built here, not as module-level constants, so the error messages
  // inside them are translated -- zod schemas can't call t() themselves.
  const orgNameSchema = useMemo(
    () =>
      z.object({
        name: z.string().min(2, t("features.organizationSettings.orgName.error")),
      }),
    [t],
  );
  const passwordSchema = useMemo(
    () =>
      z
        .object({
          current_password: z.string().min(1, t("features.organizationSettings.changePassword.current.error")),
          new_password: z.string().min(8, t("features.organizationSettings.changePassword.new.error")),
          confirm_password: z.string(),
        })
        .refine((v) => v.new_password === v.confirm_password, {
          path: ["confirm_password"],
          message: t("features.organizationSettings.changePassword.mismatchError"),
        }),
    [t],
  );

  const nameForm = useForm<z.infer<typeof orgNameSchema>>({
    resolver: zodResolver(orgNameSchema),
    defaultValues: { name: "" },
  });
  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
  });

  // This was the actual bug: nothing here ever loaded the organization, so
  // the name field always started (and stayed) empty regardless of what
  // was saved on the backend. GET /organizations/me now exists to load
  // from, and nameForm.reset() below populates the field once it arrives.
  const organizationQuery = useQuery({
    queryKey: ["organization"],
    queryFn: getOrganization,
  });

  useEffect(() => {
    if (organizationQuery.data) {
      nameForm.reset({ name: organizationQuery.data.name });
    }
  }, [organizationQuery.data, nameForm]);

  const saveNameMutation = useMutation({
    mutationFn: (name: string) => updateOrganizationName(name),
    onSuccess: (data) => {
      // Reset with the server's confirmed value (not just the submitted
      // one) so the field reflects exactly what was persisted.
      nameForm.reset({ name: data.name });
      setNameSaved(true);
      setTimeout(() => setNameSaved(false), 2500);
    },
    onError: (error) => {
      const detail =
        error instanceof AxiosError
          ? (error.response?.data as { detail?: string } | undefined)?.detail
          : undefined;
      setNameServerError(detail ?? t("features.organizationSettings.orgName.genericError"));
    },
  });

  const onSaveName = (values: z.infer<typeof orgNameSchema>) => {
    setNameServerError(null);
    saveNameMutation.mutate(values.name);
  };

  const changePasswordMutation = useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      passwordForm.reset({ current_password: "", new_password: "", confirm_password: "" });
      setPasswordSaved(true);
      setTimeout(() => setPasswordSaved(false), 2500);
    },
    onError: (error) => {
      const status = error instanceof AxiosError ? error.response?.status : undefined;
      const detail =
        error instanceof AxiosError
          ? (error.response?.data as { detail?: string } | undefined)?.detail
          : undefined;
      if (status === 400) {
        // Backend's specific "Current password incorrect" case -- put it
        // on the actual field rather than a generic banner, since the
        // person can act on this one directly.
        passwordForm.setError("current_password", {
          message: detail ?? t("features.organizationSettings.changePassword.incorrectCurrent"),
        });
        return;
      }
      setPasswordServerError(detail ?? t("features.organizationSettings.changePassword.genericError"));
    },
  });

  const onChangePassword = (values: z.infer<typeof passwordSchema>) => {
    setPasswordServerError(null);
    changePasswordMutation.mutate({
      current_password: values.current_password,
      new_password: values.new_password,
    });
  };

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader title={t("features.organizationSettings.pageTitle")} />

      <Card>
        <CardHeader>
          <CardTitle>{t("features.organizationSettings.orgName.title")}</CardTitle>
          <CardDescription>{t("features.organizationSettings.orgName.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={nameForm.handleSubmit(onSaveName)}
            className="flex flex-wrap items-end gap-3"
            noValidate
          >
            <div className="min-w-64 flex-1 space-y-1.5">
              <Label htmlFor="org-name">{t("features.organizationSettings.orgName.label")}</Label>
              <Input
                id="org-name"
                placeholder={t("features.organizationSettings.orgName.placeholder")}
                disabled={organizationQuery.isLoading}
                {...nameForm.register("name")}
              />
              {nameForm.formState.errors.name && (
                <p className="text-xs text-destructive">{nameForm.formState.errors.name.message}</p>
              )}
            </div>
            <Button type="submit" disabled={saveNameMutation.isPending || organizationQuery.isLoading}>
              {saveNameMutation.isPending
                ? t("features.organizationSettings.orgName.saving")
                : t("features.organizationSettings.orgName.save")}
            </Button>
          </form>
          {nameSaved && (
            <p className="mt-2 text-xs text-muted-foreground">
              {t("features.organizationSettings.orgName.saved")}
            </p>
          )}
          {nameServerError && (
            <p className="mt-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {nameServerError}
            </p>
          )}
          {organizationQuery.isError && (
            <p className="mt-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {t("features.organizationSettings.orgName.loadError")}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("features.organizationSettings.ownerEmail.title")}</CardTitle>
          <CardDescription>
            {t("features.organizationSettings.ownerEmail.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm">{claims?.email ?? "—"}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("features.organizationSettings.changePassword.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={passwordForm.handleSubmit(onChangePassword)}
            className="space-y-4"
            noValidate
          >
            <div className="space-y-1.5">
              <Label htmlFor="current_password">
                {t("features.organizationSettings.changePassword.current.label")}
              </Label>
              <Input
                id="current_password"
                type="password"
                autoComplete="current-password"
                {...passwordForm.register("current_password")}
              />
              {passwordForm.formState.errors.current_password && (
                <p className="text-xs text-destructive">
                  {passwordForm.formState.errors.current_password.message}
                </p>
              )}
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="new_password">
                  {t("features.organizationSettings.changePassword.new.label")}
                </Label>
                <Input
                  id="new_password"
                  type="password"
                  autoComplete="new-password"
                  {...passwordForm.register("new_password")}
                />
                {passwordForm.formState.errors.new_password && (
                  <p className="text-xs text-destructive">
                    {passwordForm.formState.errors.new_password.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirm_password">
                  {t("features.organizationSettings.changePassword.confirm.label")}
                </Label>
                <Input
                  id="confirm_password"
                  type="password"
                  autoComplete="new-password"
                  {...passwordForm.register("confirm_password")}
                />
                {passwordForm.formState.errors.confirm_password && (
                  <p className="text-xs text-destructive">
                    {passwordForm.formState.errors.confirm_password.message}
                  </p>
                )}
              </div>
            </div>
            <Button type="submit" disabled={changePasswordMutation.isPending}>
              {changePasswordMutation.isPending
                ? t("features.organizationSettings.changePassword.submitting")
                : t("features.organizationSettings.changePassword.submit")}
            </Button>
          </form>
          {passwordSaved && (
            <p className="mt-2 text-xs text-muted-foreground">
              {t("features.organizationSettings.changePassword.saved")}
            </p>
          )}
          {passwordServerError && (
            <p className="mt-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {passwordServerError}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}