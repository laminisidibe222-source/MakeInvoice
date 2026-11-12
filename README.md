# MakeInvoice — SaaS de facturation (Vite + Neon + Vercel + Saspay)

MakeInvoice is a professional invoice generator with a subscription business
model: users create branded PDF invoices (html2pdf), the app enforces a
per-plan monthly quota, and subscriptions are billed with **Saspay** (hosted
checkout, PayDunya-style REST) with automatic plan upgrade via IPN webhook.

**Architecture (all client data flows through Vercel serverless functions):**

```
browser ── /api/* (same origin) ──► Vercel Node functions ──► Neon Postgres (HTTP driver)
```

- No database connection string ever reaches the browser.
- Sessions are HS256 JWTs (app-level auth, **bcrypt** password hashes in `public.users`).
- Every query is scoped to the caller (`profiles.id`, `invoices.user_id`, `payments.user_id`).

---

## ✨ Features

- 🔐 Email + password auth (signup / signin / JWT sessions) — **no Supabase Auth**.
- 🧾 Invoice creation with live preview, VAT (`/18% default`), discounts, **PDF export**.
- 📊 Dashboard + invoice history (`/history`).
- 💳 3 plans — **Starter 4 500 FCFA** (10 factures), **Pro 7 500 FCFA** (30 factures), **Business 12 000 FCFA** (100 factures) — quota enforced server-side (`/api/invoices`).
- ⚡ Payments via **Saspay**: hosted checkout → Saspay IPN webhook (parallel confirm as fallback) → plan auto-upgrade, idempotent.
- ☁️ One **Vercel** deployment: `frontend/` hosts the static SPA **and** the `/api` serverless functions.

---

## 🚀 Quick start

### 1. Create a Neon project
1. <https://neon.tech> → **New project** (choose a region near your users).
2. Copy the **pooled connection string** (`postgresql://…?sslmode=require`).
3. Open **SQL Editor → New query**, paste the full contents of [`database/schema.sql`](./database/schema.sql), **Run**.

### 2. Configure environment
```bash
cp frontend/.env.example frontend/.env
```
Fill in at least:
```
DATABASE_URL=postgresql://...
JWT_SECRET=<openssl rand -hex 32>
SASPAY_* = (from your Saspay merchant dashboard)
```

### 3. Run
```bash
cd frontend
npm install
vercel dev          # recommended — serves SPA + /api together
# or: npm run dev   (Vite only — /api/* won't be served)
```

Open the printed URL (default <http://localhost:3000>), create an account, and
you'll start on the Starter plan (10 invoices).

---

## 🔐 How auth works

- `public.users` — email + bcrypt password hash.
- `public.auth_tokens` — single-use, SHA-256 hashed tokens for magic/reset links (issued by `/api/auth`, e.g. `action: "magic"` / `action: "reset"`). In dev, links are returned in the API response when `AUTH_DEV_EXPOSE_LINKS=true` (default in dev); wire an email provider at the `TODO` markers in `api/auth.ts` for production. There is intentionally **no Google OAuth**; email + password only.
- `JWT_SECRET` signs HS256 session tokens (`{ sub, email }`, 7-day TTL). The browser stores them in `localStorage` and sends `Authorization: Bearer …` to every `/api/*` call.
- `public.profiles` — 1:1 with users; holds `plan`, `invoices_generated`, `invoices_limit`, plus company identity for invoice pre-fill.

## 💳 How payments flow (Saspay)

1. User picks a plan in PricingSection → **PaymentModal** → `POST /api/pay { plan }`.
2. The function logs a `payments` row (`status: pending`), asks Saspay for a
   checkout invoice (`POST {SASPAY_BASE_URL}/checkout-invoice/create`), and
   returns `checkout_url` to the browser.
3. Browser redirects to the Saspay hosted page (Wave, Orange Money, card…).
4. Saspay calls the IPN webhook → `POST /api/pay/webhook` with `{ data: { token } }`.
   The webhook does **not** trust the payload: it re-confirms the checkout with
   `GET …/checkout-invoice/confirm/:token` (source of truth), then upgrades the
   plan **idempotently** (`payments.status → completed` + profile plan/limit
   update, quota reset).
5. Back in the app, `/payment/success` calls `GET /api/pay/verify` (no token
   needed — it checks the user's latest pending payment and confirms it) as a
   fallback if the IPN is delayed. Idempotent as well.

> **If your Saspay dashboard issues different endpoint paths / headers**, only
> `api/_lib/saspay.js` needs to change — the merchant-call shapes, the env
> names, and the idempotency semantics are all centralized there. Set
> `SASPAY_BASE_URL` to override the mode-derived base URL, and `SASPAY_MODE=test|production`.

---

## 📁 Project structure

```
Makeinvoice/
├── database/schema.sql      # Neon schema: users, profiles, invoices, payments, auth_tokens
├── frontend/                # ← Vercel project root (rootDirectory = frontend)
│   ├── api/                 # Vercel serverless functions (Node 20)
│   │   ├── auth.js          # signup / signin / magic / reset / me / update-password
│   │   ├── query.js         # read-only, user-scoped query proxy for the SPA
│   │   ├── invoices.js      # POST — server-side quota check + increment
│   │   ├── pay.js           # POST — create Saspay checkout
│   │   ├── pay/webhook.js   # POST — Saspay IPN (server-confirmed, idempotent)
│   │   ├── pay/verify.js    # GET  — success-page fallback confirm (idempotent)
│   │   └── _lib/            # db.js, auth.js, plans.js, saspay.js
│   └── src/                 # React 19 SPA (components, context, lib, i18n, utils)
├── backend/                 # LEGACY Express app (Supabase/PayDunya/LemonSqueezy) — unused
├── Supabase/                # LEGACY Supabase schema — unused
└── README.md
```

The legacy `backend/` and `Supabase/` folders are kept only as historical
reference and are excluded from deployment (Vercel `rootDirectory = frontend`).
Delete them if you no longer need them — **the old `backend/.env` contains
real-looking PayDunya keys; rotate them if they were ever shared.**

---

## ☁️ Deploy to Vercel

1. Push this repo to GitHub.
2. Vercel → **New Project** → import the repo.
3. **Root Directory = `frontend/`**; Framework preset = **Vite** (autodetected).
4. Add environment variables (Production + Preview):
   - `DATABASE_URL` (Neon pooled string, `sslmode=require`)
   - `JWT_SECRET`
   - `SASPAY_MASTER_KEY`, `SASPAY_PRIVATE_KEY`, `SASPAY_TOKEN`, `SASPAY_MODE`
   - `VITE_APP_URL=https://<your-domain>`
5. The frontend and `/api/*` deploy as one project; `vercel.json` rewrites
   non-API paths to the SPA.
6. In your Saspay dashboard, set the webhook/IPN callback to
   `https://<your-domain>/api/pay/webhook`.

---

## 🔁 Migrating from Supabase (this repo's history)

- `auth.users` → `public.users` (bcrypt; users must set a new password or ask an admin to reset it).
- `profiles` RLS → server-side scoping by JWT `user_id` / `id`.
- Express `backend/server.js` → `frontend/api/*.js` Vercel functions.
- PayDunya **and** Lemon Squeezy **and** the manual Wave approval flow → **Saspay only**
  (`Neon` logs in `public.payments`; Wave/manual approval is removed by design).
- Create fresh SaaS data: existing Supabase rows can be imported with
  `INSERT … SELECT` in the Neon SQL Editor (keep the same UUIDs).

---

## ❓ Troubleshooting

- **`DATABASE_URL is not configured`** → set it in `frontend/.env` (dev) or Vercel env vars (prod).
- **`JWT_SECRET is not configured`** → same.
- **Payment returns error 502** → check `SASPAY_*` keys/mode; test mode only accepts sandbox checkouts.
- **Checkout completed but plan didn't change** → the IPN didn't reach the
  webhook (wrong URL/secret) or the payment wasn't actually completed —
  `/payment/success` confirms via the server as fallback and logs the outcome.
- **Lint** → `npm run lint` in `frontend/` (config is scoped to the app; the repo's old root-level `eslint.config.js` is superseded).
