-- Add AI metadata columns to action_queue for better review workflow

ALTER TABLE action_queue
  ADD COLUMN IF NOT EXISTS ai_confidence FLOAT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS requires_human_review BOOLEAN DEFAULT TRUE;

COMMENT ON COLUMN action_queue.ai_confidence IS 'AI confidence score (0-1) for the generated action.';
COMMENT ON COLUMN action_queue.requires_human_review IS 'Whether this item MUST be reviewed by a human before execution.';
