
-- Fix ID: 38 - Relax totonoi_status constraint
-- The app sends 'tototta' manually, but debug sends 'totonotta'.
-- We should support both to be safe, or migrate to one.
-- Since the table was truncated recently, we likely only have 'totonotta' (from debug).
-- But we should allow 'tototta' so the current frontend code works.

ALTER TABLE visits DROP CONSTRAINT IF EXISTS visits_totonoi_status_check;

ALTER TABLE visits ADD CONSTRAINT visits_totonoi_status_check 
  CHECK (totonoi_status IN ('totonotta', 'not_tototta', 'tototta'));
