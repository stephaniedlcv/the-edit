-- Backfill item_status from is_archived so item_status is the canonical source of truth.
-- Run once. Safe to re-run (uses WHERE item_status IS NULL / existing values are preserved).

-- 1. Where is_archived = true and item_status is still NULL → set to 'archived'
UPDATE wardrobe_items
SET item_status = 'archived'
WHERE is_archived = true
  AND item_status IS NULL;

-- 2. Where is_archived = false or null and item_status is still NULL → set to 'active'
UPDATE wardrobe_items
SET item_status = 'active'
WHERE (is_archived = false OR is_archived IS NULL)
  AND item_status IS NULL;

-- Verify counts (informational):
-- SELECT item_status, COUNT(*) FROM wardrobe_items GROUP BY item_status;
