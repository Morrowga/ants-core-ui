import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMonthlyPrice(usd: number): string {
  const amount = Number.isInteger(usd) ? `$${usd}` : `$${usd.toFixed(2)}`;
  return `${amount}/month`;
}

export function formatDate(value: string | number | Date | null | undefined): string {
  if (value === null || value === undefined) return "—";
  const date =
    typeof value === "number"
      ? new Date(value * 1000) // unix seconds (Stripe-style)
      : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatCurrency(cents: number | null | undefined, currency = "usd"): string {
  if (cents === null || cents === undefined) return "—";
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}
