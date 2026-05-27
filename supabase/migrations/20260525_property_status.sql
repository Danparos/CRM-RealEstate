-- Add available_since column for tracking when a property became available
ALTER TABLE properties
  ADD COLUMN IF NOT EXISTS available_since timestamptz;

-- Update existing available properties to have available_since = now() if not set
UPDATE properties
  SET available_since = now()
  WHERE status = 'available' AND available_since IS NULL;
