# ReviewGen — Production Readiness Review

Reviewed as a senior frontend/full-stack engineer. Findings are ranked by risk and
each item notes the remediation that is now in the repository, or the follow-up
that is still recommended.

## What changed at a glance

- Real backend path added: Supabase Auth + Postgres + RLS, with localStorage kept
  as an explicitly labelled demo adapter.
- Admin authorization moved from a UI-only check to `app_metadata.role = 'admin'`
  enforced by database policies.
- Review generator rewritten for correctness and determinism.
- All data access is asynchronous, validated, and error-handled.
- Accessibility, error recovery, deployment headers, tests, and CI added.

---

## Critical

### 1. No production backend / admin auth was client-side only

**Original:** Business data lived in `localStorage`, and the admin gate was a
React route check. Any visitor could edit storage, and customers on another
device could never see a business created by the owner.

**Remediation:** Added a backend adapter contract (`src/lib/db.js`) with two
implementations:

- `src/lib/db/supabase.js` — Supabase Auth + Postgres for production.
- `src/lib/db/local.js` — demo-only localStorage adapter.

The demo adapter now hashes the demo password with PBKDF2-SHA256, migrates
legacy plaintext passwords on first load, expires sessions after 8 hours, and
rate-limits repeated sign-in failures. The admin UI displays a persistent
"Demo mode" warning.

**Residual risk:** browser-side auth in demo mode is bypassable by design. It is
documented as non-production and is disabled as soon as Supabase env vars exist.

### 2. Any authenticated Supabase user was treated as an admin

**Original schema:** `CREATE POLICY "Admin has full access to businesses" …
TO authenticated USING (true)` — every signed-up user could modify all data.

**Remediation:** `public.is_admin()` reads the server-controlled
`app_metadata.role` from the JWT. Admin policies use it for `USING` and
`WITH CHECK`. `ProtectedRoute` and `AdminLogin` also require `user.isAdmin`.

**Residual risk:** an operator must actually set `app_metadata.role = 'admin'`;
the setup steps are in the README and the schema file.

### 3. Unbounded anonymous analytics writes

**Original schema:** public `INSERT` with `WITH CHECK (true)` and no metadata
column or event-size limits.

**Remediation:** Event type is constrained to a fixed enum, metadata is `jsonb`
with a 4 KB check, the schema adapter rejects unknown types and oversized
metadata, and the insert policy only accepts events for existing active
businesses.

**Residual risk:** a scripted visitor can still insert valid events. Before
relying on analytics for billing or reporting, add rate limiting at an Edge
Function or gateway, and/or a signed session token. Treat counts as directional.

### 4. Generator could hang the UI and leaked state across businesses

**Original:** index selection retried in a `while` loop; a stubbed/edge RNG could
loop forever. Generator state was module-level, so two business pages shared
"last used" indices.

**Remediation:** `createReviewGenerator()` keeps state per instance, clamps RNG
output without looping, supports deterministic RNG injection for tests, and
falls back safely for invalid ratings. `BusinessReviewPage` owns one generator
per mounted page.

---

## High

### 5. Grammar bug: lowercase pronoun after connectors

`Additionally, i was impressed` was produced because the first character of
every option label was lowercased. Fixed by preserving `I` / `I'd` / `I'm`
(`lowerFirstForConnector`).

### 6. Hardcoded production URL

`https://review-gen-rho.vercel.app` was baked into link generation. QR links now
use `VITE_PUBLIC_BASE_URL` and fall back to the current origin. The browser
origin is also used as a sensible local default.

### 7. Unsafe dynamic values reaching CSS / links

Business colours and logo URLs are user-controlled. Colours now pass
`safeHexColor`, logos pass `isSafeImageUrl` (http(s) or root-relative only), and
Google review links pass `isHttpUrl` before becoming an anchor `href`. This
prevents `javascript:`/`data:` URLs and arbitrary CSS values.

### 8. Rendering crashes had no recovery path

Added `src/components/ErrorBoundary.jsx`, wrapping the router in `main.jsx`.
Unexpected render errors now show a reload action instead of a blank page.

### 9. `ConfirmDialog` reset focus on every parent render

The focus effect depended on an inline `onClose` callback, so any parent render
re-ran focus restoration. The effect now depends only on `open` and reads the
latest callbacks from refs. Escape handling and the tab trap are preserved.

### 10. Slug handling was inconsistent and race-prone

Slug generation previously read storage inside a state updater and could
collide. `src/lib/validation.js` now provides one contract used by the UI and
both adapters: `toSlug`, `sanitizeSlugInput`, `createUniqueSlug`, `isValidSlug`.
`BusinessForm` builds a canonical payload, validates it, and maps database
conflicts back to the slug field. The database still enforces uniqueness, so a
race between two admins cannot create duplicates.

### 11. Synchronous assumptions after the async migration

Every callsite was audited. Admin lists, dashboard, business form, business
page, auth context, and cards now `await` adapter calls and render explicit
loading/error/retry states.

---

## Medium

### 12. Analytics inflated by React StrictMode / refreshes

Page visits and Google clicks are deduplicated once per browser session with
`sessionStorage` keys. Writes are best-effort and never block the review flow;
read failures surface in the admin UI with a retry action.

### 13. No input length limits in the UI

Shared `LIMITS` are enforced in inputs (`maxLength`), in the generator, and in
the validation layer. Custom comments are clamped to 1,000 characters and
generated reviews to 4,096.

### 14. Accessibility gaps

- Star rating is a keyboard-operable `radiogroup` (arrow keys, Home/End,
  roving tab index).
- Step headings receive focus on transition.
- Dialog has `role="dialog"`, labelled/described IDs, focus trap, Escape close,
  and focus restore.
- Toasts expose `role`/`aria-live` and can be dismissed.
- Login inputs have correct `autocomplete` values.
- `maximum-scale=1.0, user-scalable=no` was removed from the viewport meta.
- Reduced-motion preferences are respected globally.

### 15. SEO / metadata

`useDocumentMeta` keeps title, description, Open Graph description, and robots
tags in sync. Admin routes are `noindex, nofollow`; `public/robots.txt` blocks
`/admin`. The customer page title includes the business name.

### 16. Deployment hardening

`vercel.json` now sets CSP, HSTS, `X-Content-Type-Options`, `X-Frame-Options`,
Referrer-Policy, Permissions-Policy, COOP, and immutable caching for hashed
assets. `index.html` adds `noscript`, a referrer policy, and `color-scheme`.

### 17. No automated verification

- 49 Vitest unit tests across the generator, validation, analytics aggregation,
  and local adapter.
- `.github/workflows/ci.yml` runs install → production audit → lint → tests →
  build on pushes and pull requests.
- `npm run check` runs the same locally.

### 18. Bundle size

The initial build was a single ~600 KB chunk. Vite/Rolldown code-splitting now
emits separate `react-vendor` and `supabase` chunks; no chunk exceeds 500 KB.

---

## Low / cleanup

- Removed unused Vite demo files (`src/App.css`, `src/assets/*`,
  `public/icons.svg`, `public/favicon.svg`) and the obsolete single-business
  config (`src/config/business.js`).
- Replaced the outdated README, which claimed the app had no backend.
- Added `.env.example` and ignored real `.env` files.
- Fixed an unused variable and duplicate star keyframes.
- Added empty-state and retry affordances in admin lists/dashboard.

---

## Recommended follow-ups (not blockers)

1. **Supabase integration tests.** Unit tests cover the pure/local layers. Add
   a disposable-project test that signs in as admin, as a non-admin user, and as
   anon to prove each RLS policy.
2. **Analytics abuse controls.** Anonymous inserts are inherently spoofable. If
   metrics become important, move event ingestion behind an Edge Function with
   rate limiting and server-side session/IP hashing.
3. **Consent and privacy.** If you operate in a jurisdiction requiring consent
   for analytics, add a notice or disable tracking until consent is given. The
   current data is anonymous but still behavioral.
4. **Monitoring.** The error boundary logs to the console. Forward
   `componentDidCatch` and unhandled rejections to Sentry (or similar) in
   production.
5. **End-to-end coverage.** Add Playwright tests for the full customer flow and
   one admin create → toggle → delete cycle.
6. **Business-specific templates.** `review_templates` is persisted but the
   generator still uses the bundled templates. Either wire it into
   `createReviewGenerator` or remove the column to avoid a misleading setting.
7. **Server-side validation parity.** The browser validates payloads, and
   Postgres constraints cover the most dangerous fields. Consider mirroring all
   `LIMITS` in database checks or a Postgres function for defense in depth.
8. **Admin provisioning.** Direct `auth.users` updates are a convenience.
   For larger teams, manage the `role` claim through an admin API or a custom
   claims hook.
