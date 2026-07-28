import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import contactImage from "@/assets/contact.png";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SectionDivider } from "./SectionDivider";

type ContactForm = {
  name: string;
  email: string;
  message: string;
};

export function ContactSection() {
  const { t } = useTranslation();
  const [submitted, setSubmitted] = useState(false);

  // Built here, not as a module-level constant, so the error messages
  // inside it are translated -- zod schemas can't call t() themselves.
  const contactSchema = useMemo(
    () =>
      z.object({
        name: z.string().min(2, t("features.landing.contact.nameError")),
        email: z.string().email(t("features.landing.contact.emailError")),
        message: z.string().min(10, t("features.landing.contact.messageError")),
      }),
    [t],
  );

  const form = useForm<ContactForm>({ resolver: zodResolver(contactSchema) });

  const onSubmit = (_values: ContactForm) => {
    // TODO: wire to backend once the contact endpoint exists
    setSubmitted(true);
  };

  return (
    <section id="contact" className="mx-auto w-full max-w-6xl px-6 py-16">
      <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
        {/* Left: image area -- no background box/border anymore, just
            the image itself, bigger, with a neutral (colorless) soft
            blur shadow instead of the espresso-tinted ones used
            elsewhere on this page. */}
        <div className="flex items-center justify-center">
          <div className="relative h-56 w-56 -rotate-3 lg:h-96 lg:w-96">
            {/* Mask applied to a LARGER outer wrapper (not directly on
                the shadow div) -- mask-image clips an element's render
                to its own box, which was cutting off the shadow's blur
                since it extends ~90px beyond the circle itself. This
                outer div is padded well past that reach, so the shadow
                has room to actually render before the fade kicks in. */}
            <div
              className="pointer-events-none absolute -inset-24 rounded-full"
              style={{
                WebkitMaskImage: "linear-gradient(to right, black 0%, black 35%, transparent 75%)",
                maskImage: "linear-gradient(to right, black 0%, black 35%, transparent 75%)",
              }}
            >
              <div
                className="absolute inset-24 rounded-full"
                style={{ boxShadow: "0 0 70px 20px hsla(23, 33%, 32%, 0.1)" }}
              />
            </div>
            <img
              src={contactImage}
              alt="Contact us"
              className="relative h-full w-full rounded-full object-contain"
            />
          </div>
        </div>

        {/* Right: contact form -- same Card layout as SupportSection's
            ticket form, border-0 shadow-none so it sits flush rather
            than reading as a distinct bordered panel. */}
        <Card className="border-0 shadow-none">
          <CardHeader>
            <CardTitle>{t("features.landing.contact.title")}</CardTitle>
            <SectionDivider />
            <p className="mt-1 max-w-md text-sm font-normal text-muted-foreground">
              {t("features.landing.contact.description")}
            </p>
          </CardHeader>
          <CardContent>
            {submitted ? (
              <div className="rounded-md bg-accent p-4 text-sm text-accent-foreground">
                <p className="font-medium">{t("features.landing.contact.successTitle")}</p>
                <p className="mt-1">{t("features.landing.contact.successBody")}</p>
              </div>
            ) : (
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="contact-name">{t("features.landing.contact.nameLabel")}</Label>
                    <Input
                      id="contact-name"
                      placeholder={t("features.landing.contact.namePlaceholder")}
                      {...form.register("name")}
                    />
                    {form.formState.errors.name && (
                      <p className="text-xs text-destructive">
                        {form.formState.errors.name.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="contact-email">{t("features.landing.contact.emailLabel")}</Label>
                    <Input
                      id="contact-email"
                      type="email"
                      placeholder={t("features.landing.contact.emailPlaceholder")}
                      {...form.register("email")}
                    />
                    {form.formState.errors.email && (
                      <p className="text-xs text-destructive">
                        {form.formState.errors.email.message}
                      </p>
                    )}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="contact-message">{t("features.landing.contact.messageLabel")}</Label>
                  <Textarea
                    id="contact-message"
                    rows={4}
                    placeholder={t("features.landing.contact.messagePlaceholder")}
                    {...form.register("message")}
                  />
                  {form.formState.errors.message && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.message.message}
                    </p>
                  )}
                </div>
                <Button type="submit">{t("features.landing.contact.submit")}</Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}