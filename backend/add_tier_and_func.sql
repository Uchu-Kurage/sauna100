-- Add sauna_tier column to saunas table
ALTER TABLE saunas ADD COLUMN IF NOT EXISTS sauna_tier TEXT DEFAULT 'normal';

-- Function to check if a user has visited all legendary saunas
CREATE OR REPLACE FUNCTION check_legendary_complete(uid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    total_legendary_count INTEGER;
    user_legendary_visits INTEGER;
BEGIN
    -- Get total count of legendary saunas
    SELECT COUNT(*) INTO total_legendary_count
    FROM saunas
    WHERE sauna_tier = 'legendary' AND is_active = TRUE;

    -- Get count of legendary saunas visited by the user
    SELECT COUNT(DISTINCT s.id) INTO user_legendary_visits
    FROM visits v
    JOIN saunas s ON v.sauna_id = s.id
    WHERE v.user_id = uid
      AND s.sauna_tier = 'legendary'
      AND s.is_active = TRUE;

    -- Check if counts match (and total > 0 to avoid true for 0 saunas)
    IF total_legendary_count = 0 THEN
        RETURN FALSE;
    END IF;

    RETURN user_legendary_visits >= total_legendary_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
