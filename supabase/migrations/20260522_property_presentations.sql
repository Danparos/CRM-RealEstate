-- Property Presentations table
-- Tracks property share links sent to clients, with terms acceptance gating

create table if not exists public.property_presentations (
  id              uuid primary key default gen_random_uuid(),
  token           uuid unique not null default gen_random_uuid(),
  property_id     text not null,
  property_ref    text not null,
  property_title  text not null,
  client_id       text,
  client_name     text not null,
  client_email    text not null,
  agent_name      text not null,
  agent_email     text,
  agent_phone     text,
  created_at      timestamptz not null default now(),
  sent_at         timestamptz,
  opened_at       timestamptz,
  accepted_at     timestamptz,
  accepted_name   text,
  accepted_ip     text,
  message         text
);

-- Allow public read by token (for /share/[token] page)
alter table public.property_presentations enable row level security;

create policy "Public can read by token"
  on public.property_presentations for select
  using (true);

create policy "Authenticated can insert"
  on public.property_presentations for insert
  to authenticated
  with check (true);

create policy "Public can update opened_at and acceptance"
  on public.property_presentations for update
  using (true)
  with check (true);
