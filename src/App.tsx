import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router-dom";
import { AuthProvider } from "@/lib/auth";
import { queryClient } from "@/lib/query-client";
import { router } from "./routes";

// Side-effect import: initializes i18next (sets up resources/fallback
// language) before anything using useTranslation() renders. Same pattern
// as the employee portal's App.tsx -- must run once, before the tree
// mounts, which is why it's a bare import at the very top here rather
// than something called from inside a component.
import "@/lib/i18n";

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryClientProvider>
  );
}