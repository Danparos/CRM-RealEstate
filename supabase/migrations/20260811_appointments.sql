-- Appointments table for calendar feature
create table if not exists appointments (
  id          uuid        primary key default gen_random_uuid(),
  date        date        not null,
  time        text        not null,
  type        text        not null default 'viewing',
  client_name text        not null,
  client_id   text        references clients(id) on delete set null,
  agent_name  text        not null,
  note        text        not null default '',
  location    text,
  created_at  timestamptz not null default now()
);

-- Disable RLS and grant access (same pattern as all other tables)
alter table appointments disable row level security;
grant all on appointments to anon, authenticated;
