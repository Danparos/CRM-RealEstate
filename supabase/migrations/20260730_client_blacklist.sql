-- Add blacklist fields to clients table
alter table clients
  add column if not exists blacklisted boolean default false,
  add column if not exists blacklisted_at timestamptz;
