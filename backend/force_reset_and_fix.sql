
-- Force Reset ID: 36 - Truncate and Rebuild Visits Table

-- 1. Truncate table to remove any bad data preventing constraints
TRUNCATE TABLE visits;

-- 2. Drop constraints to ensure clean slate
ALTER TABLE visits DROP CONSTRAINT IF EXISTS visits_sauna_id_key;
ALTER TABLE visits DROP CONSTRAINT IF EXISTS visits_user_sauna_unique;

-- 3. Add correct unique constraint
ALTER TABLE visits ADD CONSTRAINT visits_user_sauna_unique UNIQUE(user_id, sauna_id);

-- 4. Reset RLS
ALTER TABLE visits DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can see their own visits" ON visits;
DROP POLICY IF EXISTS "Users can insert their own visits" ON visits;
DROP POLICY IF EXISTS "Users can update their own visits" ON visits;
DROP POLICY IF EXISTS "Users can delete their own visits" ON visits;
DROP POLICY IF EXISTS "Enable access to all users" ON visits;
DROP POLICY IF EXISTS "Allow all authenticated users" ON visits;

ALTER TABLE visits ENABLE ROW LEVEL SECURITY;

-- 5. Create Permissive Policy for Debugging
-- Once this works, we can tighten it later.
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

-- 7. Verification Dummy Insert (Will show up in "Results" tab in Supabase)
-- This confirms the query ran successfully and database accepts inserts.
INSERT INTO visits (user_id, sauna_id, totonoi_score, totonoi_status, visited_at)
SELECT auth.uid(), id, 100, 'totonotta', NOW()
FROM saunas
LIMIT 1;

-- Clean up that dummy insert
DELETE FROM visits WHERE totonoi_score = 100;
