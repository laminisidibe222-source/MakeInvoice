-- ============================================
-- MakeInvoice Database Schema
-- ============================================

-- Profiles table (extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  company_name text,
  company_address text,
  company_phone text,
  plan text default 'starter' check (plan in ('starter', 'pro', 'business')),
  invoices_generated integer default 0,
  invoices_limit integer default 10,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Invoices table
create table public.invoices (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  invoice_number text not null,
  client_name text,
  client_address text,
  client_email text,
  client_phone text,
  issue_date date default current_date,
  due_date date,
  items jsonb default '[]'::jsonb,
  tax_rate numeric default 18,
  discount numeric default 0,
  subtotal numeric default 0,
  tax_amount numeric default 0,
  discount_amount numeric default 0,
  total numeric default 0,
  notes text,
  status text default 'draft' check (status in ('draft', 'sent', 'paid', 'cancelled')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Payment transactions log
create table public.payments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  plan text not null,
  amount numeric not null,
  currency text default 'XOF',
  provider text default 'paydunya',
  provider_token text,
  status text default 'pending' check (status in ('pending', 'completed', 'failed', 'cancelled')),
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.invoices enable row level security;
alter table public.payments enable row level security;

-- Profiles policies
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Invoices policies
create policy "Users can view own invoices"
  on public.invoices for select
  using (auth.uid() = user_id);

create policy "Users can insert own invoices"
  on public.invoices for insert
  with check (auth.uid() = user_id);

create policy "Users can update own invoices"
  on public.invoices for update
  using (auth.uid() = user_id);

create policy "Users can delete own invoices"
  on public.invoices for delete
  using (auth.uid() = user_id);

-- Payments policies (read-only for users)
create policy "Users can view own payments"
  on public.payments for select
  using (auth.uid() = user_id);

-- Trigger: auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function: increment invoice count safely
create or replace function public.increment_invoice_count(p_user_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  update public.profiles
  set invoices_generated = invoices_generated + 1,
      updated_at = now()
  where id = p_user_id;
end;
$$;

-- Function: upgrade plan
create or replace function public.upgrade_plan(p_user_id uuid, p_plan text)
returns void
language plpgsql
security definer
as $$
declare
  v_limit integer;
begin
  v_limit := case p_plan
    when 'starter' then 10
    when 'pro' then 30
    when 'business' then 100
    else 10
  end;

  update public.profiles
  set plan = p_plan,
      invoices_limit = v_limit,
      invoices_generated = 0,
      updated_at = now()
  where id = p_user_id;
end;
$$;