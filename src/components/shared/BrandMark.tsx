import logo from "@/assets/logo.png";
import { cn } from "@/lib/utils";

interface BrandMarkProps {
  /** "ANTS" on compact surfaces, "ANTS Central" where there's room. */
  wordmark?: string;
  className?: string;
  imgClassName?: string;
  textClassName?: string;
}

/** Logo + wordmark on one row, vertically centered — used in the hero,
 * sidebar, and auth pages so the lockup stays consistent. */
export function BrandMark({
  wordmark = "ANTS",
  className,
  textClassName,
}: BrandMarkProps) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-white p-1">
          <img src={logo} alt="" className="h-full w-full object-contain" />
      </div>
      <span className={cn("font-display text-lg font-semibold tracking-tight", textClassName)}>
        {wordmark}
      </span>
    </div>
  );
}
