-- Add water_desc column to saunas table
ALTER TABLE saunas ADD COLUMN IF NOT EXISTS water_desc TEXT; -- 水質（説明）
