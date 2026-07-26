import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { QueryBoundary } from "@/components/shared/QueryBoundary";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getModuleCatalog } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { formatMonthlyPrice } from "@/lib/utils";

/**
 * Services & pricing grid: one card per module from GET /billing/modules,
 * 3 per row on desktop, 1 per row on mobile. Reused unmodified as the
 * entire content of the standalone /plans route.
 */
export function PricingSection() {
  const { isAuthenticated } = useAuth();
  const catalog = useQuery({ queryKey: ["module-catalog"], queryFn: getModuleCatalog });

  return (
    <section id="pricing" className="mx-auto w-full max-w-6xl px-6 py-16">
      <div className="mb-8">
        <h2 className="text-3xl font-semibold">Services &amp; pricing</h2>
        <p className="mt-2 max-w-xl text-muted-foreground">
          Every module is one flat monthly price — no tiers, no seat math.
          Turn a module on when you need it, off when you don't.
        </p>
      </div>

      <QueryBoundary
        isLoading={catalog.isLoading}
        isError={catalog.isError}
        onRetry={() => catalog.refetch()}
        label="Pricing"
      >
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {catalog.data?.map((module) => (
            <Card key={module.module_key} className="flex flex-col">
              <CardHeader>
                <CardTitle>{module.name}</CardTitle>
                <CardDescription>{module.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-2xl font-semibold tabular">
                  {formatMonthlyPrice(module.price_monthly_usd)}
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  {/* Logged-out visitors register first; logged-in owners
                      manage modules from their company's marketplace. */}
                  <Link to={isAuthenticated ? "/companies" : "/register"}>
                    Get started
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </QueryBoundary>
    </section>
  );
}
