# SCHEMA UPDATE REQUIRED FOR PRE-LAUNCH

The pre-launch rehearsal detected that your database schema is missing critical metadata columns in the `action_queue` table.

## Action Required

Please run the following SQL in your **Supabase SQL Editor**:

```sql
-- Add missing AI metadata columns
ALTER TABLE action_queue
  ADD COLUMN IF NOT EXISTS ai_confidence FLOAT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS requires_human_review BOOLEAN DEFAULT TRUE;

COMMENT ON COLUMN action_queue.ai_confidence IS 'AI confidence score (0-1) for the generated action.';
COMMENT ON COLUMN action_queue.requires_human_review IS 'Whether this item MUST be reviewed by a human before execution.';
```

---

## Why this is required
These columns enable the **Review-First** workflow by allowing the system to track which items require mandatory human oversight and what the system's confidence in the generated draft was.

**Status**: Waiting for schema update before re-running pre-launch rehearsal.
