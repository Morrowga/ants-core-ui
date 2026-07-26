# ANTS — Central

The public/front-door frontend for the ANTS platform: landing page,
registration, pricing/plans, and the per-company module marketplace +
billing UI. Talks to the same FastAPI backend as HR Dashboard (which is now
login-only).

## Run it

```bash
cp .env.example .env    # set VITE_API_BASE_URL and VITE_HR_DASHBOARD_URL
npm install
npm run dev
```

`npm run build` runs the strict TypeScript check and produces `dist/`.

## Assets

- `src/assets/logo.png` and `public/favicon.ico` currently contain
  **generated placeholders** so the build works — drop the real ANTS logo
  and favicon over them (same paths, already wired into the hero, sidebar,
  auth pages, contact section, and `index.html`).

## ⚠️ Things flagged back, not silently built around

Per the build spec, these are surfaced instead of guessed at:

1. **Web `tailwind.config.ts` is a reconstruction.** The HR Dashboard repo
   wasn't available, so `tailwind.config.ts` maps exactly the CSS variables
   in `src/index.css` to utility names, and the font pairing (Space Grotesk
   display + IBM Plex Sans/Mono, loaded via `<link>` in `index.html`)
   follows the spec's hint. Diff against the repo's real config when you
   have it. The NativeWind config is mobile-only and was not used.
2. **`src/components/ui/*` are stand-ins**, not verbatim copies. The spec
   asks for the HR Dashboard repo's `components/ui/*` to be copied directly
   for pixel-identical primitives; the repo wasn't available, so these are
   standard shadcn/ui implementations on the same token names. Replace the
   whole folder with the repo's copies when possible. Same for the
   timezone picker (`src/features/auth/timezones.ts` is a plain
   `Intl.supportedValuesOf` list, not HR Dashboard's onboarding component).
3. **Missing backend endpoints** — UI built, wiring stubbed with
   `// TODO: backend endpoint needed`:
   - `POST /organizations/{id}/companies` (Create Company page)
   - `PATCH` for Organization name (Settings)
   - Support-ticket backend (landing Support section)
   - Contact-form backend (landing Contact section)
4. **Stripe SetupIntent step**: the pinned stack has no Stripe frontend SDK
   (`@stripe/stripe-js` / Elements), and the SetupIntent create/confirm
   contract isn't documented. `PaymentMethodDialog` is the visual step with
   the save stubbed — confirm the contract and add the SDK before wiring.
5. **SSO handoff is out of scope**: the marketplace's "Enter →" button is a
   plain link to `VITE_HR_DASHBOARD_URL` (user will hit HR Dashboard's own
   login), marked with the required TODO.
6. **Paths assumed, confirm against the backend router**: `GET /companies`
   (companies list), `GET /billing/payment-method` (masked-card read),
   `POST /auth/refresh` + refresh-token storage in `lib/api-client.ts`
   (built to mirror HR Dashboard's described behavior — diff against its
   actual `api-client.ts`), and the error status the backend returns when
   enabling a module with no card on file (assumed 402/409).
7. **Register has no separate "organization name" field** — the backend's
   `register_company()` names the Organization after the company; adding a
   distinct field needs a backend schema change first.

## Notes

- `framer-motion` was added on top of the pinned stack (the spec calls for
  it) to drive the hero's looping module showcase; it respects
  `prefers-reduced-motion` by rendering a static first module.
- The showcase is data-driven: add Warehouse/POS to
  `src/features/landing/showcase-data.ts` and the hero picks them up with
  no new code.
- `PricingSection` is one component used both on the landing page and as
  the entire `/plans` route, per spec.
