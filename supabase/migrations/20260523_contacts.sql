-- Migration: contacts module
-- Creates a reusable contacts table for professionals (lawyers, notaries, accountants, engineers)
-- and links them to the contracts table via FK columns.

-- ─── 1. contacts table ────────────────────────────────────────────────────────

create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('lawyer', 'notary', 'accountant', 'engineer')),
  salutation text check (salutation in ('Mr', 'Mrs', 'Ms', 'Dr')),
  first_name text not null default '',
  last_name text not null default '',
  email text,
  phone text,
  mobile text,
  address text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.contacts enable row level security;

create policy "authenticated_all" on public.contacts
  for all
  to authenticated
  using (true)
  with check (true);

-- ─── 2. FK columns on contracts ───────────────────────────────────────────────

alter table public.contracts
  add column if not exists buyer_lawyer_id uuid references public.contacts(id) on delete set null,
  add column if not exists seller_lawyer_id uuid references public.contacts(id) on delete set null,
  add column if not exists buyer_accountant_id uuid references public.contacts(id) on delete set null,
  add column if not exists seller_accountant_id uuid references public.contacts(id) on delete set null,
  add column if not exists buyer_engineer_id uuid references public.contacts(id) on delete set null,
  add column if not exists seller_engineer_id uuid references public.contacts(id) on delete set null,
  add column if not exists notary_id uuid references public.contacts(id) on delete set null;
