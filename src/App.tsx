import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router-dom";
import { AuthProvider } from "@/lib/auth";
import { queryClient } from "@/lib/query-client";
import { router } from "./routes";
import { WelcomeDialog } from "@/features/auth/WelcomeDialog";

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
        {/* Mounted once, globally -- fires regardless of which page
            LoginPage happens to navigate to after a successful login
            (varies: straight into a company's modules, or /companies). */}
        <WelcomeDialog />
      </AuthProvider>
    </QueryClientProvider>
  );
}