-- Vendors table (property sellers / owners)
CREATE TABLE IF NOT EXISTS vendors (
  id                  text PRIMARY KEY,
  salutation          text,
  first_name          text NOT NULL,
  last_name           text NOT NULL,
  email               text,
  phone               text,
  nationality         text,
  language            text,
  stage               text NOT NULL DEFAULT 'owner_inquiry',
  primary_agent_id    text,
  primary_agent       text,
  property_id         text REFERENCES properties(id) ON DELETE SET NULL,
  property_ref        text,
  asking_price        numeric,
  valuation_price     numeric,
  listing_commission  numeric,
  contract_type       text,
  exclusive_until     date,
  notes               text,
  last_activity_at    timestamptz,
  last_activity_note  text,
  stage_entered_at    timestamptz DEFAULT now(),
  created_at          timestamptz DEFAULT now(),
  updated_at          timestamptz DEFAULT now(),
  archived            boolean DEFAULT false,
  archived_at         timestamptz
);

-- Allow activities to reference a vendor
ALTER TABLE activities
  ADD COLUMN IF NOT EXISTS vendor_id text REFERENCES vendors(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS activities_vendor_id_idx ON activities(vendor_id);

-- Allow properties to reference their vendor/owner
ALTER TABLE properties
  ADD COLUMN IF NOT EXISTS vendor_id text REFERENCES vendors(id) ON DELETE SET NULL;

-- Allow contracts to reference the seller as a vendor record
ALTER TABLE contracts
  ADD COLUMN IF NOT EXISTS vendor_id text REFERENCES vendors(id) ON DELETE SET NULL;

-- Permissions (match the existing pattern from schema.sql)
ALTER TABLE vendors DISABLE ROW LEVEL SECURITY;
GRANT ALL ON vendors TO anon;
GRANT ALL ON vendors TO authenticated;
