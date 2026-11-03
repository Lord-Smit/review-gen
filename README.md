# ReviewGen

A mobile-first review funnel for QR-code cards. Customers rate their experience, pick a few highlights, get a natural review draft they can edit, and are handed off to Google with the review copied to their clipboard.

ReviewGen never posts to Google on the customer's behalf. It is a drafting and hand-off tool, not a review-bot.

## Features

- Four-step flow: rating → experience → editable draft → Google hand-off.
- Industry-specific review wording and tap-options (car showroom, bike showroom, or generic), resolved per business at runtime.
- Template-based review generator with rating-specific tone and per-session variety.
- Per-business branding, logo, welcome copy, and Google review URL.
- Admin dashboard with business CRUD, active/inactive toggles, and analytics.
- Anonymous visit / Google-click analytics with per-session deduplication.
- Supabase (Auth + Postgres + RLS) in production; a local demo adapter for development.
- Keyboard-accessible star rating and dialogs, visible focus states, reduced-motion support.
- Unit tests for the generator, validation, and the local data adapter.

## Industries

Each business stores an `industry_key` (`generic`, `car-showroom`, `bike-showroom`). The wording itself lives in code under `src/data/industries/`, so fixing a sentence updates every business in that industry at once.

Resolution order for both tap-options and sentence pools:

```text
per-business override (review_options / review_templates)
  → industry preset (industry_key)
    → generic preset
```

- Pick the industry in **Admin → Business → Industry**. The welcome heading and description are prefilled from the preset (only when they still hold the generic defaults), and the **Review preview** panel shows real samples for all five ratings.
- Adding an industry is one file in `src/data/industries/` plus one entry in `src/data/industries/index.js`. No schema migration is needed because `industry_key` is plain text.
- `src/data/industries/industries.test.js` fails the build if one industry's vocabulary leaks into another.

## Tech stack

React 19, Vite 8, Tailwind CSS 4, React Router 7, Lucide icons, Supabase JS.

## Quick start

Requirements: Node.js **22.12+** and npm.

```bash
npm install
cp .env.example .env.local   # Windows: copy .env.example .env.local
npm run dev
```

Without Supabase environment variables the app runs against the **local demo adapter** (localStorage). The admin UI shows a banner explaining that data is browser-local and cannot be shared with customers on other devices.

Default demo credentials:

```text
Email:    admin@reviewgen.local
Password: reviewgen-demo
```

Change them with `VITE_DEMO_ADMIN_EMAIL` / `VITE_DEMO_ADMIN_PASSWORD` before sharing a demo. Demo auth hashes the password with PBKDF2-SHA256 in the browser, but browser-side auth is inherently bypassable — it is **not** production security.

If sign-in fails with credentials that should work, the browser is holding demo data from an older build (the adapter keeps an existing admin rather than overwriting it). Use **Reset demo data** on the sign-in page, or clear it from the console:

```js
localStorage.removeItem('reviewgen_db');
sessionStorage.removeItem('reviewgen_auth');
location.reload();
```

Resetting deletes the businesses and analytics saved in that browser.

## Production setup (Supabase)

1. Create a Supabase project.
2. Run [`supabase/schema.sql`](supabase/schema.sql) in the Supabase SQL editor. The script is idempotent and creates tables, constraints, indexes, triggers, and RLS policies.
3. Create an admin user under **Authentication → Users** (auto-confirm it).
4. Set the user's **app metadata** to `{ "role": "admin" }`:
   - Dashboard: Users → select the user → Edit → App metadata.
   - Or run the commented `update auth.users …` statement at the bottom of the schema file.
   - Do **not** use `user_metadata`; users can edit that themselves.
5. Copy `.env.example` to `.env.local` and fill in:

```dotenv
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY
VITE_PUBLIC_BASE_URL=https://reviews.example.com
```

6. Restart the dev server / rebuild.

Only the **anon** key belongs in the browser. Never expose the `service_role` key through a `VITE_` variable.

### How authorization works

- `anon` can read **active** businesses and append analytics events.
- `authenticated` users can manage businesses and read analytics **only** when `auth.jwt() → app_metadata → role = 'admin'`.
- The UI also requires `user.isAdmin`; hiding the button is not the security boundary — RLS is.

### Analytics caveat

Visit and Google-click counts are collected client-side. A determined visitor can inflate them, and the app cannot prove that a review was actually submitted to Google. Treat the numbers as directional funnel metrics, not audited conversions.

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | Production | Supabase project URL. |
| `VITE_SUPABASE_ANON_KEY` | Production | Supabase anon/public key. |
| `VITE_PUBLIC_BASE_URL` | Recommended | Canonical origin used in generated customer links/QR destinations. Defaults to `window.location.origin`. |
| `VITE_DEMO_ADMIN_EMAIL` | No | Local demo adapter email. |
| `VITE_DEMO_ADMIN_PASSWORD` | No | Local demo adapter password. |

Both Supabase values must be present to enable the Supabase adapter; otherwise the app falls back to the demo adapter.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server. |
| `npm run build` | Build the production bundle into `dist/`. |
| `npm run preview` | Serve the production build locally. |
| `npm run lint` | Run oxlint. |
| `npm run test` | Run Vitest in watch mode. |
| `npm run test:run` | Run the unit test suite once. |
| `npm run check` | Lint + tests + production build (use before merging). |

## Deployment (Vercel)

`vercel.json` configures:

- SPA rewrites so `/:slug` and `/admin/*` resolve to `index.html`.
- Security headers (CSP, HSTS, `X-Content-Type-Options`, `X-Frame-Options`, Referrer-Policy, Permissions-Policy).
- Immutable caching for hashed `/assets/*` files.

Set the three production environment variables in the Vercel project before deploying. The CSP allows Supabase over HTTPS/WSS; if you add another API or analytics provider, extend `connect-src` accordingly.

Any static host works as long as it rewrites unknown paths to `index.html`.

## Project structure

```text
review-gen/
├── .github/workflows/ci.yml    # lint + test + build on every push/PR
├── public/
│   ├── logo.svg
│   └── robots.txt
├── src/
│   ├── components/            # shared UI + admin components
│   ├── config/app.js          # environment-driven configuration
│   ├── contexts/              # Auth + current business
│   ├── data/
│   │   ├── industries/        # per-industry presets + resolver
│   │   ├── reviewOptions.js   # generic tap-options
│   │   └── reviewTemplates.js # generic sentence pools
│   ├── hooks/                 # document metadata
│   ├── lib/
│   │   ├── analytics.js       # client-side tracking facade
│   │   ├── analyticsShared.js # backend-agnostic aggregation
│   │   ├── crypto.js          # demo-only PBKDF2 helpers
│   │   ├── db.js              # backend-selecting facade
│   │   ├── db/local.js        # localStorage demo adapter
│   │   ├── db/supabase.js     # production adapter
│   │   ├── supabase.js        # Supabase client
│   │   └── validation.js      # shared validation + sanitisation
│   ├── pages/                 # customer flow + admin pages
│   └── utils/                 # review generator, clipboard
├── supabase/schema.sql
└── vercel.json
```

## Testing

```bash
npm run test:run
```

The suite runs in Node and covers:

- `src/utils/generateReview.test.js` — determinism, rating normalisation, pronoun casing, comment clamping, RNG edge cases.
- `src/data/industries/industries.test.js` — preset completeness, icon whitelist, cross-industry vocabulary leaks, override → preset → generic cascade.
- `src/lib/validation.test.js` — slugs, URL/colour/email validation, payload normalisation, industry keys.
- `src/lib/analyticsShared.test.js` — time-range filtering, funnel aggregation, legacy event names.
- `src/lib/db/local.test.js` — demo auth, lockout, legacy password migration, business CRUD, slug conflicts, analytics aggregation, persistence, corrupt-storage recovery.

Supabase adapter behaviour is exercised through RLS in the database; run integration tests against a disposable Supabase project before changing policies.

## License

MIT
