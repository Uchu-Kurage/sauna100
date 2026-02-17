-- Add access column to saunas table
ALTER TABLE saunas ADD COLUMN IF NOT EXISTS access TEXT;
