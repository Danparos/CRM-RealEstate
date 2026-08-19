-- Ensure all contracts columns exist (safe to run multiple times)

-- Commission tracking (added 20260527)
alter table contracts
  add column if not exists agent_id              text,
  add column if not exists co_agent_id           text,
  add column if not exists co_agent_name         text,
  add column if not exists agent_split_percent   numeric default 100,
  add column if not exists commission_status     text default 'pending',
  add column if not exists commission_received_at date,
  add column if not exists invoice_number        text;

-- Contact picker links (added 20260523)
alter table contracts
  add column if not exists buyer_lawyer_id      uuid,
  add column if not exists seller_lawyer_id     uuid,
  add column if not exists buyer_accountant_id  uuid,
  add column if not exists seller_accountant_id uuid,
  add column if not exists buyer_engineer_id    uuid,
  add column if not exists seller_engineer_id   uuid,
  add column if not exists notary_id            uuid;

-- Ensure RLS is off and anon/authenticated have full access
alter table contracts disable row level security;
grant all on contracts to anon, authenticated;
