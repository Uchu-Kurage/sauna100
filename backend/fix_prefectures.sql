-- Fix malformed prefecture names
UPDATE saunas SET prefecture = '京都府' WHERE name LIKE '%ぬかとゆげ%' AND (prefecture IS NULL OR prefecture = 'null');
UPDATE saunas SET prefecture = '神奈川県' WHERE prefecture = '磯町国府';
UPDATE saunas SET prefecture = '栃木県' WHERE prefecture = '木県宇都';
UPDATE saunas SET prefecture = '山梨県' WHERE prefecture = '梨県南都';
UPDATE saunas SET prefecture = '大分県' WHERE prefecture = '分県別府';

-- Check for Wakayama candidates
SELECT id, name, prefecture, is_legendary FROM saunas WHERE name LIKE '%和歌山%' OR prefecture LIKE '%和歌山%';
