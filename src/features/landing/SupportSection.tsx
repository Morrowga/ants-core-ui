import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import supportImage from "@/assets/support.png";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SectionDivider } from "./SectionDivider";

type TicketForm = {
  subject: string;
  message: string;
};

/**
 * Support section -- now wired to POST /public/support (a new,
 * unauthenticated endpoint, deliberately separate from
 * app/core/routers/support.py's owner-only POST /support/tickets, which
 * requires a logged-in account with an active plan). This one just
 * sends an email; there's no company/account context for an anonymous
 * landing-page visitor to attach a DB row to.
 */
export function SupportSection() {
  const { t } = useTranslation();

  // Built here, not as a module-level constant, so the error messages
  // inside it are translated -- zod schemas can't call t() themselves.
  const ticketSchema = useMemo(
    () =>
      z.object({
        subject: z.string().min(3, t("features.landing.support.subjectError")),
        message: z.string().min(10, t("features.landing.support.messageError")),
      }),
    [t],
  );

  const form = useForm<TicketForm>({ resolver: zodResolver(ticketSchema) });

  const submit = useMutation({
    mutationFn: (values: TicketForm) => apiClient.post("/public/support", values),
  });

  const onSubmit = (values: TicketForm) => submit.mutate(values);

  return (
    <section id="support" className="mx-auto w-full max-w-6xl px-6 py-16">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <div>
          <h2 className="text-3xl font-semibold">{t("features.landing.support.title")}</h2>
          <SectionDivider />
          <p className="mt-3 max-w-md text-muted-foreground">
            {t("features.landing.support.description")}
          </p>

          {/* Same treatment as ContactSection's image -- circle, tilted,
              ambient glow that fades via a mask -- but MIRRORED: shadow
              visible on the RIGHT, fading out toward the left (opposite
              of Contact's left-visible/right-fading version). */}
          <div className="mt-8 flex justify-center">
            <div className="relative h-56 w-56 rotate-3 lg:h-96 lg:w-96">
              <div
                className="pointer-events-none absolute -inset-24 rounded-full"
                style={{
                  WebkitMaskImage: "linear-gradient(to left, black 0%, black 35%, transparent 75%)",
                  maskImage: "linear-gradient(to left, black 0%, black 35%, transparent 75%)",
                }}
              >
                <div
                  className="absolute inset-24 rounded-full"
                  style={{ boxShadow: "0 0 70px 20px hsla(23, 33%, 32%, 0.1)" }}
                />
              </div>
              <img
                src={supportImage}
                alt="Support"
                className="relative h-full w-full rounded-full object-contain"
              />
            </div>
          </div>
        </div>

        <Card className="border-0 shadow-none">
          <CardHeader>
            <CardTitle>{t("features.landing.support.formTitle")}</CardTitle>
          </CardHeader>
          <CardContent>
            {submit.isSuccess ? (
              <div className="rounded-md bg-accent p-4 text-sm text-accent-foreground">
                <p className="font-medium">{t("features.landing.support.successTitle")}</p>
                <p className="mt-1">{t("features.landing.support.successBody")}</p>
              </div>
            ) : (
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
                <div className="space-y-1.5">
                  <Label htmlFor="ticket-subject">{t("features.landing.support.subjectLabel")}</Label>
                  <Input
                    id="ticket-subject"
                    placeholder={t("features.landing.support.subjectPlaceholder")}
                    {...form.register("subject")}
                  />
                  {form.formState.errors.subject && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.subject.message}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ticket-message">{t("features.landing.support.messageLabel")}</Label>
                  <Textarea
                    id="ticket-message"
                    rows={4}
                    placeholder={t("features.landing.support.messagePlaceholder")}
                    {...form.register("message")}
                  />
                  {form.formState.errors.message && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.message.message}
                    </p>
                  )}
                </div>
                {submit.isError && (
                  <p className="text-xs text-destructive">
                    {t("features.landing.support.submitError")}
                  </p>
                )}
                <Button type="submit" disabled={submit.isPending}>
                  {submit.isPending ? t("features.landing.support.submitting") : t("features.landing.support.submit")}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}