-- Ensure properties table has a created_at timestamp
ALTER TABLE properties
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

-- Backfill any existing rows that have no value
UPDATE properties SET created_at = now() WHERE created_at IS NULL;
