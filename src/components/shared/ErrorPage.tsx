import { Link, useRouteError } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function ErrorPage() {
  const error = useRouteError() as { statusText?: string; message?: string } | undefined;
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
      <h1 className="text-3xl font-semibold">Something went wrong</h1>
      <p className="max-w-md text-muted-foreground">
        {error?.statusText || error?.message || "The page you asked for couldn't be shown."}
      </p>
      <Button asChild>
        <Link to="/">Back to the landing page</Link>
      </Button>
    </div>
  );
}
