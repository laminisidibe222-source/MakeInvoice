-- ═════════════════════════════════════════════════════════════════
-- MakeInvoice — Neon schema (PostgreSQL)
-- Run this in the Neon SQL Editor (or via psql) once your project exists.
--
-- Migration from Supabase:
--   * Supabase Auth is gone. public.users holds email + bcrypt password
--     hashes; sessions are HS256 JWTs issued by /api/auth.
--   * public.payments logs checkout intents/completions (provider_token =
--     Saspay checkout token).
--   * RLS is gone: serverless functions scope every query by the user id
--     carried in the JWT (profiles by id, invoices/payments by user_id).
--   * The `manual_payments` table and the manual Wave approval flow are
--     removed — Saspay (REST, PayDunya-style) is the only provider.
-- ═════════════════════════════════════════════════════════════════

create extension if not exists "uuid-ossp";

-- ─── Users (replaces Supabase auth.users) ────────────────────────
create table if not exists public.users (
  id            uuid primary key default uuid_generate_v4(),
  email         text unique not null,
  password_hash text not null,
  created_at    timestamptz not null default now()
);
create index if not exists users_email_idx on public.users(email);

-- One-time tokens for magic links & password resets (single-use, hashed).
create table if not exists public.auth_tokens (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references public.users(id) on delete cascade,
  type       text not null check (type in ('magic','reset')),
  token_hash text unique not null,
  expires_at timestamptz not null,
  used_at    timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists auth_tokens_user_idx on public.auth_tokens(user_id);

-- ─── Profiles (1:1 with users; plan/quota live here) ────────────
create table if not exists public.profiles (
  id                  uuid primary key references public.users(id) on delete cascade,
  email               text,
  full_name           text,
  company_name        text,
  company_address     text,
  company_phone       text,
  plan                text not null default 'starter' check (plan in ('starter', 'pro', 'business')),
  invoices_generated  integer not null default 0,
  invoices_limit      integer not null default 10,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
create index if not exists profiles_plan_idx on public.profiles(plan);

-- ─── Invoices ────────────────────────────────────────────────────
create table if not exists public.invoices (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  invoice_number  text not null,
  client_name     text,
  client_address  text,
  client_email    text,
  client_phone    text,
  issue_date      date default current_date,
  due_date        date,
  items           jsonb not null default '[]'::jsonb,
  tax_rate        numeric not null default 18,
  discount        numeric not null default 0,
  subtotal        numeric not null default 0,
  tax_amount      numeric not null default 0,
  discount_amount numeric not null default 0,
  total           numeric not null default 0,
  notes           text,
  status          text not null default 'draft' check (status in ('draft', 'sent', 'paid', 'cancelled')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists invoices_user_idx on public.invoices(user_id);
create index if not exists invoices_created_idx on public.invoices(created_at desc);

-- ─── Payment attempts/transactions (Saspay) ──────────────────────
create table if not exists public.payments (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  plan            text not null check (plan in ('starter', 'pro', 'business')),
  amount          numeric not null,
  currency        text not null default 'XOF',
  provider        text not null default 'saspay',
  provider_token  text,               -- Saspay checkout token (confirm endpoint)
  status          text not null default 'pending' check (status in ('pending', 'completed', 'failed', 'cancelled')),
  metadata        jsonb not null default '{}'::jsonb,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists payments_user_idx on public.payments(user_id);
create index if not exists payments_token_idx on public.payments(provider_token);
create index if not exists payments_status_idx on public.payments(status);

comment on table public.payments is 'Saspay checkout lifecycle: one row per checkout attempt; the webhook marks it completed and upgrades the plan.';
