
-- Fix Kanagawa prefecture name
UPDATE saunas
SET prefecture = '神奈川県'
WHERE prefecture = '神奈川';

-- Verify the change
SELECT DISTINCT prefecture FROM saunas WHERE prefecture LIKE '神奈川%';
