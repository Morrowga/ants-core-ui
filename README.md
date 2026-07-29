# ANTS — Central

The public/front-door frontend for the ANTS platform: landing page,
registration, pricing, and the per-Organization company creation + module
marketplace + billing UI. Talks to the same FastAPI backend as HR Dashboard
(which is login-only from this app's perspective — Core Dashboard is where
an Organization's owner actually manages their account).

**Live at:** `https://ants-core-ui-nine.vercel.app`

## Run it

```bash
cp .env.example .env    # set VITE_API_BASE_URL, VITE_HR_DASHBOARD_URL,
                         # VITE_STRIPE_PUBLISHABLE_KEY
yarn install
yarn dev
```

`yarn build` runs the strict TypeScript check and produces `dist/`.

> **Deploying to Vercel:** this repo needs a `vercel.json` at the root with
> a catch-all rewrite to `index.html` (`{ "rewrites": [{ "source": "/(.*)",
> "destination": "/index.html" }] }`) — without it, reloading or directly
> hitting any route other than `/` returns Vercel's own 404, since only
> `index.html` exists as an actual static file and React Router needs the
> request to reach it first. Confirmed working once added.

## Assets

Real logo (`src/assets/logo.png`) and product imagery (`hr.png`, `wh.png`,
`pos.png`, `ai-ocr.png`, `contact.png`, `support.png`, `divider.png`) are in
place — the placeholder-asset situation from earlier in this project's life
no longer applies.

## What's actually wired end-to-end

- **Auth**: Login and Register, split-screen layout (`AuthLayout`) sharing
  the landing page's visual language. Registration creates **only** the
  Organization + its owner — no Company is created at this step (see
  "Organizations vs. Companies" below). Already-authenticated visitors
  hitting `/login` or `/register` are redirected to `/companies`
  automatically. A one-time `WelcomeDialog` fires right after a successful
  login (session-scoped, shows once per real login).
- **Company creation, flat per-module marketplace, and billing** —
  `ModuleMarketplacePage` proactively checks for a saved card before
  attempting to enable a module (`GET /billing/payment-method`); if none
  exists, `PaymentMethodDialog` runs a real Stripe Elements SetupIntent
  flow (`POST /billing/setup-intent` → `stripe.confirmCardSetup()` →
  `PATCH /billing/payment-method`), handling 3DS/SCA automatically. Real
  Stripe subscriptions are created on enable (confirmed visible in the
  Stripe test dashboard).
- **Organization Settings, Companies list, Invoice history** — all wired
  against real endpoints, i18n'd.
- **Landing page**: Hero, Services, Pricing, Support, Contact sections —
  all real components with real (or explicitly-stubbed, see below) backend
  wiring, not placeholder copy.
- **i18n**: 5 languages registered (`en`/`ja`/`ko`/`zh`/`hi`), free-choice
  language switcher (this app is owner-facing, not company-assigned like
  the employee Portal). A floating circular language switcher also exists
  specifically on the public landing/auth pages.

## Organizations vs. Companies

Registration creates **only** the Organization and its owner — this was a
deliberate architecture change from an earlier version of this app, where
registration used to create a Company automatically (named after the
company). **The old "Register has no separate organization name field"
limitation no longer applies** — `organization_name` is now its own
first-class field on the register form, entirely decoupled from any
Company. The owner creates their first Company explicitly afterward, from
its own screen, whenever they choose.

## Billing — flat per-module pricing, not tiers

Every module (currently `hr`, `warehouse` real and purchasable; `pos` and
`ai-ocr` shown as "coming soon" display-only cards on the landing page, not
real catalog entries — see note below) is one flat monthly price. No
seat-based tiers.

**Landing page's `PricingSection` note**: shows the first 2 real modules
from `GET /billing/modules` plus 2 static "coming soon" cards (POS, AI
OCR) that are hardcoded in the frontend only — deliberately **not** added
to the real backend catalog, since that catalog is shared with this same
authenticated marketplace, and a fake catalog entry there would let an
Owner try to "Enable" something that doesn't actually work.

## Still genuinely open (confirmed, not guessed)

Unlike the earlier version of this doc, these aren't speculative — each of
these is confirmed by an explicit `// TODO` or docstring still in the
actual component:

1. **Support ticket submission** (`SupportSection`) — form validates and
   has a UI success state, but submission is stubbed; no backend endpoint
   exists yet for support tickets from this landing page.
2. **Contact form submission** (`ContactSection`) — same situation; UI is
   complete, backend endpoint doesn't exist yet.

## Resolved since the earlier version of this doc

For anyone who's seen an older version of this README — these items used
to be flagged as assumed/stubbed/reconstructed and are now confirmed
real, not guesses:

- `tailwind.config.ts` and `src/components/ui/*` are the real, working
  shadcn/ui setup — not stand-ins waiting to be replaced with another
  repo's copies.
- Stripe SetupIntent is fully wired with the real `@stripe/stripe-js` /
  `@stripe/react-stripe-js` SDKs — not a visual-only stub.
- `POST /organizations/{id}/companies`-equivalent flow, and `PATCH` for
  Organization name, are both wired against real endpoints.

## Not independently re-confirmed this session

A couple of items from the earlier version of this doc weren't touched or
re-verified during this project's most recent work, so — rather than
assume either way — flagging them as genuinely unknown current status:

- **SSO handoff** ("Enter →" into HR Dashboard) — the backend now has a
  real `sso` router and an `sso_codes` table (confirmed present in the
  database), suggesting real SSO exists at the backend level. Whether
  this frontend's marketplace button was updated to actually use that
  flow (versus still being a plain link to `VITE_HR_DASHBOARD_URL`) was
  not directly confirmed — worth checking `ModuleMarketplacePage`'s
  "Enter" action directly before assuming either way.
- **A standalone `/plans` route reusing `PricingSection` verbatim** —
  `PricingSection` as it exists now is specifically the landing page's
  section (real modules + 2 static coming-soon cards, Learn More dialogs,
  watermark imagery). Whether a separate `/plans` route still reuses this
  exact component, given how much it's been redesigned, wasn't confirmed.

## Notes

- CORS: the backend's allowed-origins list is currently a small hardcoded
  array in `app/main.py` (not driven by an env var) — this frontend's
  Vercel URL needs to be in that list, or every request fails with a CORS
  error regardless of anything on this repo's side. If you redeploy this
  app to a new URL, that backend list needs updating too.
- `VITE_*` environment variables are baked in at **build time** — changing
  one in Vercel's project settings requires an actual redeploy (not just a
  page reload) before it takes effect.