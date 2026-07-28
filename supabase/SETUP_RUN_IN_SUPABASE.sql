-- ═══════════════════════════════════════════════════════════════
--  Paros CRM — Complete Supabase Setup
--  Paste this entire file into the Supabase SQL Editor → Run
--  Safe to run multiple times (all statements are idempotent)
-- ═══════════════════════════════════════════════════════════════

-- ── TABLES ───────────────────────────────────────────────────────────────────

create table if not exists clients (
  id                    text primary key,
  salutation            text,
  first_name            text not null,
  last_name             text not null,
  email                 text,
  phone                 text,
  nationality           text,
  language              text,
  client_class          text not null default 'C',
  price_group           text,
  budget_min            numeric,
  budget_max            numeric,
  stage                 text not null default 'new_inquiry',
  primary_agent         text,
  primary_agent_id      text,
  co_agent_ids          text[]   default '{}',
  property_interest     text,
  property_locations    text[]   default '{}',
  property_types        text[]   default '{}',
  property_bedrooms_min text,
  property_bedrooms_max text,
  property_pool         text,
  property_views        text[]   default '{}',
  last_activity_at      timestamptz,
  last_activity_note    text,
  stage_entered_at      timestamptz,
  created_at            timestamptz default now(),
  updated_at            timestamptz default now(),
  archived              boolean default false,
  archived_at           timestamptz
);

create table if not exists properties (
  id                    text primary key,
  reference             text not null unique,
  title                 jsonb not null default '{}',
  type                  text not null,
  status                text not null default 'draft',
  ownership_group       text,
  agent_id              text not null,
  co_agent_ids          text[]   default '{}',
  recording_responsible text,
  display_on_website    boolean  default false,
  disabled              boolean  default false,
  keys_available        boolean  default false,
  asking_price          numeric  not null default 0,
  buyer_commission      numeric,
  seller_commission     numeric,
  contract_type         text,
  bedrooms              integer  not null default 0,
  bathrooms             integer  not null default 0,
  build_area            numeric  not null default 0,
  buildable_area        numeric,
  plot_area             numeric,
  floors                integer,
  rooms                 integer,
  balconies             integer,
  terraces              integer,
  year_of_construction  integer,
  condition             text,
  energy_class          text,
  heating_types         text[]   default '{}',
  area                  text     not null,
  island                text,
  country               text,
  scout_region          text,
  address               text,
  postal_code           text,
  lat                   numeric,
  lng                   numeric,
  usage                 text,
  marketing_method      text,
  seafront              boolean  default false,
  sea_view              boolean  default false,
  pool                  boolean  default false,
  distance_from_sea     numeric,
  features              text[]   default '{}',
  description           text,
  comments              text,
  legal_checklist       jsonb    default '[]',
  cover_image           text,
  available_since       timestamptz,
  vendor_id             text,
  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);

create table if not exists vendors (
  id                  text primary key,
  salutation          text,
  first_name          text not null,
  last_name           text not null,
  email               text,
  phone               text,
  nationality         text,
  language            text,
  stage               text not null default 'owner_inquiry',
  primary_agent_id    text,
  primary_agent       text,
  property_id         text references properties(id) on delete set null,
  property_ref        text,
  asking_price        numeric,
  valuation_price     numeric,
  listing_commission  numeric,
  contract_type       text,
  exclusive_until     date,
  notes               text,
  last_activity_at    timestamptz,
  last_activity_note  text,
  stage_entered_at    timestamptz default now(),
  created_at          timestamptz default now(),
  updated_at          timestamptz default now(),
  archived            boolean default false,
  archived_at         timestamptz
);

create table if not exists activities (
  id          text primary key,
  client_id   text references clients(id) on delete cascade,
  property_id text references properties(id) on delete cascade,
  vendor_id   text references vendors(id) on delete cascade,
  type        text not null,
  date        timestamptz not null,
  note        text not null default '',
  agent_name  text not null,
  metadata    jsonb default '{}'
);

create table if not exists property_photos (
  id          uuid primary key default gen_random_uuid(),
  property_id text references properties(id) on delete cascade,
  url         text not null,
  position    integer not null default 0,
  created_at  timestamptz default now()
);

create table if not exists agents (
  id          text primary key,
  name        text not null,
  email       text not null,
  phone       text,
  role        text not null default 'agent',
  languages   text[]   default '{}',
  active      boolean  default true,
  created_at  timestamptz default now()
);

create table if not exists tasks (
  id          text primary key,
  title       text not null,
  description text,
  due_date    date,
  assigned_to text,
  client_id   text references clients(id) on delete set null,
  property_id text references properties(id) on delete set null,
  status      text not null default 'todo',
  priority    text not null default 'medium',
  created_at  timestamptz default now()
);

create table if not exists custom_areas (
  id   uuid primary key default gen_random_uuid(),
  name text not null unique
);

create table if not exists contracts (
  id                        text primary key,
  client_id                 text references clients(id) on delete set null,
  buyer_name                text not null,
  buyer_email               text,
  buyer_phone               text,
  buyer_nationality         text,
  buyer_lawyer              text,
  buyer_lawyer_phone        text,
  property_id               text references properties(id) on delete set null,
  property_ref              text,
  property_title            text,
  seller_name               text,
  seller_email              text,
  seller_phone              text,
  seller_lawyer             text,
  seller_lawyer_phone       text,
  notary_name               text,
  notary_date               date,
  agreed_price              numeric,
  buyer_commission          numeric,
  seller_commission         numeric,
  deposit_amount            numeric,
  deposit_paid_at           date,
  preliminary_contract_date date,
  final_contract_date       date,
  completion_date           date,
  stage                     text not null default 'legal_process',
  vendor_id                 text references vendors(id) on delete set null,
  agent_name                text,
  agent_id                  text,
  co_agent_id               text,
  co_agent_name             text,
  agent_split_percent       numeric default 100,
  commission_status         text default 'pending',
  commission_received_at    date,
  invoice_number            text,
  notes                     text,
  follow_up_items           jsonb default '[]',
  buyer_lawyer_id           uuid,
  seller_lawyer_id          uuid,
  buyer_accountant_id       uuid,
  seller_accountant_id      uuid,
  buyer_engineer_id         uuid,
  seller_engineer_id        uuid,
  notary_id                 uuid,
  created_at                timestamptz default now(),
  updated_at                timestamptz default now()
);

create table if not exists contacts (
  id         uuid primary key default gen_random_uuid(),
  type       text not null check (type in ('lawyer', 'notary', 'accountant', 'engineer')),
  salutation text check (salutation in ('Mr', 'Mrs', 'Ms', 'Dr')),
  first_name text not null default '',
  last_name  text not null default '',
  email      text,
  phone      text,
  mobile     text,
  address    text,
  notes      text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists documents (
  id           uuid        primary key default gen_random_uuid(),
  entity_type  text        not null check (entity_type in ('client', 'property')),
  entity_id    text        not null,
  category     text        not null check (category in ('private', 'general')),
  file_name    text        not null,
  file_size    bigint,
  mime_type    text,
  storage_path text        not null,
  uploaded_at  timestamptz not null default now()
);

create table if not exists property_presentations (
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
  message         text,
  photos          text[] default '{}'
);

create table if not exists client_portals (
  id               uuid primary key default gen_random_uuid(),
  token            uuid unique not null default gen_random_uuid(),
  client_id        text not null references clients(id) on delete cascade,
  created_at       timestamptz default now(),
  last_accessed_at timestamptz,
  active           boolean default true
);

-- ── ADD MISSING COLUMNS (safe — IF NOT EXISTS) ───────────────────────────────

alter table activities  add column if not exists property_id text references properties(id) on delete cascade;
alter table activities  add column if not exists vendor_id   text references vendors(id) on delete cascade;
alter table properties  add column if not exists available_since timestamptz;
alter table properties  add column if not exists vendor_id   text references vendors(id) on delete set null;
alter table contracts   add column if not exists vendor_id   text references vendors(id) on delete set null;
alter table contracts   add column if not exists agent_id            text;
alter table contracts   add column if not exists co_agent_id         text;
alter table contracts   add column if not exists co_agent_name       text;
alter table contracts   add column if not exists agent_split_percent numeric default 100;
alter table contracts   add column if not exists commission_status   text default 'pending';
alter table contracts   add column if not exists commission_received_at date;
alter table contracts   add column if not exists invoice_number      text;

-- ── INDEXES ───────────────────────────────────────────────────────────────────

create index if not exists activities_client_id_idx   on activities(client_id);
create index if not exists activities_property_id_idx on activities(property_id);
create index if not exists activities_vendor_id_idx   on activities(vendor_id);
create index if not exists documents_entity_idx       on documents(entity_type, entity_id);
create index if not exists idx_client_portals_token     on client_portals(token);
create index if not exists idx_client_portals_client_id on client_portals(client_id);

-- ── PERMISSIONS ───────────────────────────────────────────────────────────────

grant usage on schema public to anon, authenticated;
grant all on all tables    in schema public to anon, authenticated;
grant all on all sequences in schema public to anon, authenticated;

alter table agents                 disable row level security;
alter table clients                disable row level security;
alter table properties             disable row level security;
alter table activities             disable row level security;
alter table property_photos        disable row level security;
alter table custom_areas           disable row level security;
alter table tasks                  disable row level security;
alter table contracts              disable row level security;
alter table vendors                disable row level security;
alter table contacts               disable row level security;
alter table documents              disable row level security;
alter table property_presentations disable row level security;
alter table client_portals         disable row level security;

-- ── STORAGE BUCKETS ───────────────────────────────────────────────────────────

-- Documents bucket (private — accessed via signed URLs)
insert into storage.buckets (id, name, public)
  values ('documents', 'documents', false)
  on conflict (id) do nothing;

-- Property photos bucket (public — images served directly)
insert into storage.buckets (id, name, public)
  values ('property-photos', 'property-photos', true)
  on conflict (id) do nothing;

-- ── STORAGE POLICIES ─────────────────────────────────────────────────────────

-- property-photos: anyone can read (public bucket)
drop policy if exists "property-photos public read" on storage.objects;
create policy "property-photos public read"
  on storage.objects for select
  using (bucket_id = 'property-photos');

-- property-photos: anon can upload
drop policy if exists "property-photos anon insert" on storage.objects;
create policy "property-photos anon insert"
  on storage.objects for insert
  with check (bucket_id = 'property-photos');

-- property-photos: anon can delete their files
drop policy if exists "property-photos anon delete" on storage.objects;
create policy "property-photos anon delete"
  on storage.objects for delete
  using (bucket_id = 'property-photos');

-- documents: anon can upload
drop policy if exists "documents anon insert" on storage.objects;
create policy "documents anon insert"
  on storage.objects for insert
  with check (bucket_id = 'documents');

-- documents: anon can read (for signed URL generation)
drop policy if exists "documents anon read" on storage.objects;
create policy "documents anon read"
  on storage.objects for select
  using (bucket_id = 'documents');

-- documents: anon can delete
drop policy if exists "documents anon delete" on storage.objects;
create policy "documents anon delete"
  on storage.objects for delete
  using (bucket_id = 'documents');
