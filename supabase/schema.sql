-- ─────────────────────────────────────────────────────────────
--  RealEstateCRM — Supabase Schema
--  Run this once in the Supabase SQL Editor
-- ─────────────────────────────────────────────────────────────

-- CLIENTS
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

-- PROPERTIES
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
  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);

-- ACTIVITIES
create table if not exists activities (
  id          text primary key,
  client_id   text references clients(id) on delete cascade,
  type        text not null,
  date        timestamptz not null,
  note        text not null default '',
  agent_name  text not null,
  metadata    jsonb default '{}'
);

-- PROPERTY PHOTOS
create table if not exists property_photos (
  id          uuid primary key default gen_random_uuid(),
  property_id text references properties(id) on delete cascade,
  url         text not null,
  position    integer not null default 0,
  created_at  timestamptz default now()
);

-- AGENTS
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

-- CUSTOM AREAS
create table if not exists custom_areas (
  id   uuid primary key default gen_random_uuid(),
  name text not null unique
);

-- Allow full access via anon key (no auth required)
grant usage  on schema public to anon;
grant all    on all tables    in schema public to anon;
grant all    on all sequences in schema public to anon;

alter table agents         disable row level security;
alter table clients        disable row level security;
alter table properties     disable row level security;
alter table activities     disable row level security;
alter table property_photos disable row level security;
alter table custom_areas   disable row level security;
