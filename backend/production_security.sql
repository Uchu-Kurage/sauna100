-- Production Security Configuration (RLS)
-- This script secures the database for global launch.

-- 1. Secure 'visits' table
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;

-- Clear debug policies
DROP POLICY IF EXISTS "Allow all authenticated users" ON visits;
DROP POLICY IF EXISTS "Users can see their own visits" ON visits;
DROP POLICY IF EXISTS "Users can insert their own visits" ON visits;
DROP POLICY IF EXISTS "Users can update their own visits" ON visits;
DROP POLICY IF EXISTS "Users can delete their own visits" ON visits;

-- Strict Production Policies
CREATE POLICY "Users can see their own visits"
ON visits FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own visits"
ON visits FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own visits"
ON visits FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own visits"
ON visits FOR DELETE
TO authenticated
USING (auth.uid() = user_id);


-- 2. Secure 'saunas' table (Read-only for users)
ALTER TABLE saunas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for all users" ON saunas;

CREATE POLICY "Anyone can view active saunas"
ON saunas FOR SELECT
TO anon, authenticated
USING (is_active = true);


-- 3. Storage Security (sauna-photos bucket)
-- Note: These must be set in the Supabase Dashboard under Storage -> Policies,
-- but here is the logic for documentation:
-- Bucket: "sauna-photos"
-- SELECT: authenticated (auth.uid() = (storage.foldername(name))[1]::uuid) -- If using user-id folders
-- INSERT: authenticated
-- DELETE: authenticated (auth.uid() = (storage.foldername(name))[1]::uuid)
