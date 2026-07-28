-- Commission tracking fields for contracts table
ALTER TABLE contracts
  ADD COLUMN IF NOT EXISTS agent_id            text,
  ADD COLUMN IF NOT EXISTS co_agent_id         text,
  ADD COLUMN IF NOT EXISTS co_agent_name       text,
  ADD COLUMN IF NOT EXISTS agent_split_percent numeric DEFAULT 100,
  ADD COLUMN IF NOT EXISTS commission_status   text    DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS commission_received_at date,
  ADD COLUMN IF NOT EXISTS invoice_number      text;
