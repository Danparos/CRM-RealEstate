-- =============================================================================
-- Migration: 20260523_documents
-- Feature:   Document upload for real estate CRM
-- Tables:    public.documents
-- Storage:   documents bucket + RLS policies
-- =============================================================================


-- =============================================================================
-- SECTION 1: documents metadata table
-- =============================================================================

create table public.documents (
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

-- Enable RLS so that unauthenticated requests are blocked by default
alter table public.documents enable row level security;

-- Allow full CRUD for any authenticated user
create policy "authenticated_all"
  on public.documents
  for all
  to authenticated
  using (true)
  with check (true);

-- Composite index for the most common query pattern: fetch all docs for an entity
create index on public.documents (entity_type, entity_id);


-- =============================================================================
-- SECTION 2: Supabase Storage bucket + object-level RLS policies
-- =============================================================================

-- Create a private bucket (public = false means no anonymous URL access)
insert into storage.buckets (id, name, public)
  values ('documents', 'documents', false)
  on conflict (id) do nothing;

-- Allow authenticated users to upload files into the bucket
create policy "auth_upload"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'documents');

-- Allow authenticated users to read / download files from the bucket
create policy "auth_select"
  on storage.objects
  for select
  to authenticated
  using (bucket_id = 'documents');

-- Allow authenticated users to delete files from the bucket
create policy "auth_delete"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'documents');
