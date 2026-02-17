
-- Debug Fix ID: 35 - Reset RLS policies to be permissive for authenticated users

-- 1. Disable RLS temporarily to clean up
ALTER TABLE visits DISABLE ROW LEVEL SECURITY;

-- 2. Drop ALL existing policies to ensure no conflicts
DROP POLICY IF EXISTS "Users can see their own visits" ON visits;
DROP POLICY IF EXISTS "Users can insert their own visits" ON visits;
DROP POLICY IF EXISTS "Users can update their own visits" ON visits;
DROP POLICY IF EXISTS "Users can delete their own visits" ON visits;
DROP POLICY IF EXISTS "Enable access to all users" ON visits;

-- 3. Re-enable RLS
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;

-- 4. Create a single, simple permissive policy for ALL operations for authenticated users
-- This allows any logged-in user to do anything to the visits table (temporarily for debugging)
CREATE POLICY "Allow all authenticated users"
ON visits
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 5. Verify grants
GRANT ALL ON TABLE visits TO authenticated;
GRANT ALL ON TABLE saunas TO authenticated, anon;
