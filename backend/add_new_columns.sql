-- Add new columns for enhanced sauna details
ALTER TABLE saunas ADD COLUMN IF NOT EXISTS perceived_temp REAL;     -- サ室温度（体感）
ALTER TABLE saunas ADD COLUMN IF NOT EXISTS sauna_type TEXT;         -- サウナ種類
ALTER TABLE saunas ADD COLUMN IF NOT EXISTS heat_quality TEXT;       -- 熱の質
ALTER TABLE saunas ADD COLUMN IF NOT EXISTS chair_type TEXT;         -- 椅子種類
ALTER TABLE saunas ADD COLUMN IF NOT EXISTS water_quality_2 TEXT;    -- 水質２
ALTER TABLE saunas ADD COLUMN IF NOT EXISTS view_desc TEXT;           -- 景観
