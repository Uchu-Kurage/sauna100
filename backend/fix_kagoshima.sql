-- Fix Kagoshima inconsistencies
UPDATE saunas SET prefecture = '鹿児島県' WHERE prefecture = '鹿児島';

-- Mark Hotel New Nishino (a very famous classic sauna) as legendary if appropriate
-- Assuming user would expect it to be.
UPDATE saunas SET is_legendary = true WHERE name = 'ホテルニューニシノ';
