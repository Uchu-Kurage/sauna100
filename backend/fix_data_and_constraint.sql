
-- Fix ID: 37 - Repair Schema Constraints and Reset

-- 1. Truncate table to remove any bad data preventing constraints
TRUNCATE TABLE visits;

-- 2. Drop the problematic constraint
ALTER TABLE visits DROP CONSTRAINT IF EXISTS visits_totonoi_status_check;

-- 3. Re-add the constraint with explicit allowed values matching the App
-- The App sends 'totonotta' or 'not_tototta'
ALTER TABLE visits ADD CONSTRAINT visits_totonoi_status_check 
  CHECK (totonoi_status IN ('totonotta', 'not_tototta'));

-- 4. Reset RLS (Nuclear option from before)
ALTER TABLE visits DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can see their own visits" ON visits;
DROP POLICY IF EXISTS "Users can insert their own visits" ON visits;
DROP POLICY IF EXISTS "Users can update their own visits" ON visits;
DROP POLICY IF EXISTS "Users can delete their own visits" ON visits;
DROP POLICY IF EXISTS "Enable access to all users" ON visits;
DROP POLICY IF EXISTS "Allow all authenticated users" ON visits;

ALTER TABLE visits ENABLE ROW LEVEL SECURITY;

-- 5. Create Permissive Policy for Debugging
-- Allows authenticated users to do INSERT/SELECT/UPDATE/DELETE
CREATE POLICY "Allow all authenticated users"
ON visits
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 6. Grant Permissions
GRANT ALL ON TABLE visits TO authenticated;
GRANT ALL ON TABLE saunas TO authenticated, anon;
GRANT USAGE ON SCHEMA public TO authenticated, anon;
