-- Enable RLS (if disabled)
ALTER TABLE saunas ENABLE ROW LEVEL SECURITY;

-- Drop existing policies that might conflict
DROP POLICY IF EXISTS "Allow All" ON saunas;
DROP POLICY IF EXISTS "Public Access" ON saunas;
DROP POLICY IF EXISTS "Public Upload" ON saunas;
DROP POLICY IF EXISTS "Public Update" ON saunas;

-- Create a permissive policy for ALL roles (anon and authenticated)
CREATE POLICY "Allow All Operations"
ON saunas
FOR ALL
USING (true)
WITH CHECK (true);
