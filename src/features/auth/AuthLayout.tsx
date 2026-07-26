import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { BrandMark } from "@/components/shared/BrandMark";

/**
 * Shared frame for /login and /register. The warm-brown --sidebar token
 * drives the auth page background (per the theme notes in index.css).
 */
export function AuthLayout({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-sidebar px-4 py-10">
      <Link to="/" className="mb-6" aria-label="Back to the landing page">
        <BrandMark wordmark="ANTS Central" textClassName="text-sidebar-foreground" />
      </Link>
      <div className="w-full max-w-md rounded-lg border bg-card p-6 shadow-lg sm:p-8">
        <h1 className="mb-6 text-xl font-semibold">{title}</h1>
        {children}
      </div>
    </div>
  );
}
