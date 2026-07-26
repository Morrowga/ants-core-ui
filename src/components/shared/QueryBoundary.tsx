import { Loader2, RefreshCw } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface QueryBoundaryProps {
  isLoading: boolean;
  isError: boolean;
  onRetry?: () => void;
  /** What failed, in user terms — e.g. "modules" -> "Modules didn't load." */
  label?: string;
  children: ReactNode;
}

/**
 * Wraps query-driven sections with consistent loading and error states so
 * every page doesn't hand-roll its own. py-8 (not py-16) -- a one-line
 * message and a button shouldn't force a huge empty block, especially
 * next to a sibling card that's sized to its actual (short) content.
 */
export function QueryBoundary({
  isLoading,
  isError,
  onRetry,
  label = "This section",
  children,
}: QueryBoundaryProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        <span>Loading…</span>
      </div>
    );
  }
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
        <p className="text-sm text-muted-foreground">
          {label} didn't load. Check your connection and try again.
        </p>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry}>
            <RefreshCw aria-hidden /> Try again
          </Button>
        )}
      </div>
    );
  }
  return <>{children}</>;
}