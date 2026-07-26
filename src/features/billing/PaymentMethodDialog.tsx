import { loadStripe } from "@stripe/stripe-js";
import {
  CardElement,
  Elements,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createSetupIntent, updatePaymentMethod } from "@/lib/api";

/**
 * Real Stripe Elements card entry, entirely in-dashboard -- no redirect
 * to a Stripe-hosted page. Two-step flow, matching the backend:
 *   1. POST /billing/setup-intent -> client_secret
 *   2. stripe.confirmCardSetup(client_secret, { payment_method: { card } })
 *      -- this is what actually handles 3DS/SCA client-side, if the
 *      card needs it (Stripe shows its own modal for that automatically)
 *   3. PATCH /billing/payment-method with the resulting payment_method id
 *      -- saves it as the customer's default for future module charges.
 *
 * Needs VITE_STRIPE_PUBLISHABLE_KEY set -- loadStripe() below reads it.
 * loadStripe() is called once at module scope (not per-render), which is
 * the documented pattern -- it memoizes internally regardless, but this
 * avoids re-triggering Stripe.js's own setup on every dialog open.
 */
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ?? "");

interface PaymentMethodDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: () => void;
}

export function PaymentMethodDialog(props: PaymentMethodDialogProps) {
  return (
    <Elements stripe={stripePromise}>
      <PaymentMethodDialogInner {...props} />
    </Elements>
  );
}

function PaymentMethodDialogInner({ open, onOpenChange, onSaved }: PaymentMethodDialogProps) {
  const { t } = useTranslation();
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!stripe || !elements) return; // Stripe.js hasn't finished loading yet
    const card = elements.getElement(CardElement);
    if (!card) return;

    setSubmitting(true);
    setError(null);
    try {
      const { client_secret } = await createSetupIntent();
      const result = await stripe.confirmCardSetup(client_secret, {
        payment_method: { card },
      });

      if (result.error) {
        // Covers a declined card, a failed 3DS challenge, or any other
        // Stripe-side rejection -- surfaced directly from Stripe's own
        // message (always English, dynamic, not ours to translate),
        // which is usually more specific than anything we'd write
        // ourselves. Our own fallback IS translated, for the rare case
        // Stripe doesn't supply a message at all.
        setError(result.error.message ?? t("features.billing.paymentMethodDialog.genericError"));
        return;
      }

      const paymentMethodId =
        typeof result.setupIntent.payment_method === "string"
          ? result.setupIntent.payment_method
          : result.setupIntent.payment_method?.id;
      if (!paymentMethodId) {
        setError(t("features.billing.paymentMethodDialog.cardConfirmError"));
        return;
      }

      await updatePaymentMethod({ payment_method_id: paymentMethodId });
      card.clear();
      onOpenChange(false);
      onSaved?.();
    } catch {
      setError(t("features.billing.paymentMethodDialog.genericError"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("features.billing.paymentMethodDialog.title")}</DialogTitle>
          <DialogDescription>
            {t("features.billing.paymentMethodDialog.description")}
          </DialogDescription>
        </DialogHeader>
        <div className="rounded-md border p-4">
          <CardElement
            options={{
              style: {
                base: { fontSize: "14px", "::placeholder": { color: "#9ca3af" } },
              },
            }}
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            {t("features.billing.paymentMethodDialog.cancel")}
          </Button>
          <Button onClick={handleSave} disabled={!stripe || submitting}>
            {submitting
              ? t("features.billing.paymentMethodDialog.saving")
              : t("features.billing.paymentMethodDialog.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}