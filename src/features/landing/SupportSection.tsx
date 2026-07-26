import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const ticketSchema = z.object({
  subject: z.string().min(3, "Give the ticket a short subject."),
  message: z.string().min(10, "Describe the problem in a sentence or two."),
});

type TicketForm = z.infer<typeof ticketSchema>;

/**
 * Support section — FRONTEND-ONLY for now. The form validates client-side
 * but submission is stubbed; no network call is made.
 */
export function SupportSection() {
  const [submitted, setSubmitted] = useState(false);
  const form = useForm<TicketForm>({ resolver: zodResolver(ticketSchema) });

  const onSubmit = (_values: TicketForm) => {
    // TODO: wire to backend once the support-ticket endpoint exists
    setSubmitted(true);
  };

  return (
    <section id="support" className="mx-auto w-full max-w-6xl px-6 py-16">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <div>
          <h2 className="text-3xl font-semibold">We're here when something breaks</h2>
          <p className="mt-3 max-w-md text-muted-foreground">
            Stuck on setup, billing, or a module that isn't behaving? Send a
            ticket and the ANTS team will get back to you by email — usually
            within one business day.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Submit a ticket</CardTitle>
          </CardHeader>
          <CardContent>
            {submitted ? (
              <div className="rounded-md bg-accent p-4 text-sm text-accent-foreground">
                <p className="font-medium">Ticket received.</p>
                <p className="mt-1">
                  We'll reply by email. (Placeholder success state — support
                  tickets aren't wired to a backend yet.)
                </p>
              </div>
            ) : (
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
                <div className="space-y-1.5">
                  <Label htmlFor="ticket-subject">Subject</Label>
                  <Input
                    id="ticket-subject"
                    placeholder="e.g. Can't enable the HR module"
                    {...form.register("subject")}
                  />
                  {form.formState.errors.subject && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.subject.message}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ticket-message">Message</Label>
                  <Textarea
                    id="ticket-message"
                    rows={4}
                    placeholder="What happened, and what did you expect?"
                    {...form.register("message")}
                  />
                  {form.formState.errors.message && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.message.message}
                    </p>
                  )}
                </div>
                <Button type="submit">Send ticket</Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
