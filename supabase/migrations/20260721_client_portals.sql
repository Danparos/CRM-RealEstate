-- Client portal access tokens
CREATE TABLE IF NOT EXISTS client_portals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token uuid UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  client_id text NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  last_accessed_at timestamptz,
  active boolean DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_client_portals_token ON client_portals(token);
CREATE INDEX IF NOT EXISTS idx_client_portals_client_id ON client_portals(client_id);
