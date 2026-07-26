import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import logo from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const contactSchema = z.object({
  name: z.string().min(2, "Tell us your name."),
  email: z.string().email("Enter a valid email address."),
  message: z.string().min(10, "Write at least a sentence."),
});

type ContactForm = z.infer<typeof contactSchema>;

export function ContactSection() {
  const [submitted, setSubmitted] = useState(false);
  const form = useForm<ContactForm>({ resolver: zodResolver(contactSchema) });

  const onSubmit = (_values: ContactForm) => {
    // TODO: wire to backend once the contact endpoint exists
    setSubmitted(true);
  };

  return (
    <section id="contact" className="mx-auto w-full max-w-6xl px-6 py-16">
      <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
        {/* Left: image area */}
        <div className="flex items-center justify-center rounded-lg border bg-accent/40 p-12">
          {/* TODO: replace with real imagery (using logo.png as a temporary
              placeholder until real contact/office photos exist) */}
          <img src={logo} alt="ANTS" className="h-40 w-40 rounded-xl shadow-sm" />
        </div>

        {/* Right: contact form */}
        <div>
          <h2 className="text-3xl font-semibold">Talk to us</h2>
          <p className="mt-2 max-w-md text-muted-foreground">
            Questions about pricing, a module you wish existed, or rolling
            ANTS out across teams — write to us and we'll reply by email.
          </p>

          {submitted ? (
            <div className="mt-6 rounded-md bg-accent p-4 text-sm text-accent-foreground">
              <p className="font-medium">Message received.</p>
              <p className="mt-1">
                We'll get back to you soon. (Placeholder success state — the
                contact form isn't wired to a backend yet.)
              </p>
            </div>
          ) : (
            <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="contact-name">Name</Label>
                  <Input id="contact-name" placeholder="Your name" {...form.register("name")} />
                  {form.formState.errors.name && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.name.message}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="contact-email">Email</Label>
                  <Input
                    id="contact-email"
                    type="email"
                    placeholder="you@company.com"
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
                <Label htmlFor="contact-message">Message</Label>
                <Textarea
                  id="contact-message"
                  rows={4}
                  placeholder="What would you like to know?"
                  {...form.register("message")}
                />
                {form.formState.errors.message && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.message.message}
                  </p>
                )}
              </div>
              <Button type="submit">Send message</Button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
