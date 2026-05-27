-- Add property_id to activities so they can be linked to properties (not just clients)
ALTER TABLE activities
  ADD COLUMN IF NOT EXISTS property_id text REFERENCES properties(id) ON DELETE CASCADE;

-- Make client_id optional (it was previously required)
ALTER TABLE activities
  ALTER COLUMN client_id DROP NOT NULL;

CREATE INDEX IF NOT EXISTS activities_property_id_idx ON activities(property_id);
