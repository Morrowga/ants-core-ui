import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/lib/auth";

/** sessionStorage (not localStorage) on purpose -- this should show once
 * per actual login, not once per browser forever. Cleared the instant
 * it's read, so a page refresh afterward never shows it again until the
 * next real login. */
const JUST_LOGGED_IN_KEY = "ants.just_logged_in";

/** Called by LoginPage right after a successful login, before it
 * navigates anywhere -- since where someone lands varies (straight into
 * a company's modules vs. the companies list), this flag is the one
 * thing that's true regardless of which page actually mounts next. */
export function markJustLoggedIn() {
  sessionStorage.setItem(JUST_LOGGED_IN_KEY, "1");
}

/** Mounted once, globally (in App.tsx) -- so it fires no matter which
 * page LoginPage happens to navigate to afterward, rather than needing
 * to be duplicated into every possible landing page. */
export function WelcomeDialog() {
  const { claims } = useAuth();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Depends on `claims`, not just [] -- this component is mounted
    // once at the app root and never remounts on client-side
    // navigation, so an empty-deps effect only ever checks the flag
    // once, before any login has happened. Re-running whenever `claims`
    // changes means it correctly re-checks the moment login actually
    // completes (claims flips from null to a real decoded token),
    // instead of only working after a full page reload.
    if (claims && sessionStorage.getItem(JUST_LOGGED_IN_KEY) === "1") {
      sessionStorage.removeItem(JUST_LOGGED_IN_KEY);
      setOpen(true);
    }
  }, [claims]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Welcome back{claims?.email ? `, ${claims.email}` : ""}!
          </DialogTitle>
          <DialogDescription>
            Good to see you again. Pick up right where you left off.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={() => setOpen(false)}>Continue</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}