
-- Fix ID: 34 - Resolve RLS and Constraint issues for visits table

-- 1. Remove incorrect unique constraint (if it exists) that prevents multiple users from visiting the same sauna
ALTER TABLE visits DROP CONSTRAINT IF EXISTS visits_sauna_id_key;

-- 2. Ensure correct unique constraint (one visit per sauna per user)
ALTER TABLE visits DROP CONSTRAINT IF EXISTS visits_user_sauna_unique;
ALTER TABLE visits ADD CONSTRAINT visits_user_sauna_unique UNIQUE(user_id, sauna_id);

-- 3. Enable RLS
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;

-- 4. Re-define Policies (Drop first to avoid conflicts)

-- SELECT: Users can see their own visits
DROP POLICY IF EXISTS "Users can see their own visits" ON visits;
CREATE POLICY "Users can see their own visits" ON visits FOR SELECT USING (auth.uid() = user_id);

-- INSERT: Users can insert their own visits
DROP POLICY IF EXISTS "Users can insert their own visits" ON visits;
CREATE POLICY "Users can insert their own visits" ON visits FOR INSERT WITH CHECK (auth.uid() = user_id);

-- UPDATE: Users can update their own visits
DROP POLICY IF EXISTS "Users can update their own visits" ON visits;
CREATE POLICY "Users can update their own visits" ON visits FOR UPDATE USING (auth.uid() = user_id);

-- DELETE: Users can delete their own visits
DROP POLICY IF EXISTS "Users can delete their own visits" ON visits;
CREATE POLICY "Users can delete their own visits" ON visits FOR DELETE USING (auth.uid() = user_id);

-- 5. Grant access to authenticated users
GRANT ALL ON TABLE visits TO authenticated;
GRANT ALL ON TABLE saunas TO authenticated, anon;
