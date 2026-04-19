-- Scheduler state table for idempotent stage execution tracking

CREATE TABLE IF NOT EXISTS scheduler_state (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  stage INTEGER NOT NULL CHECK (stage IN (0, 3, 7, 14)),
  status TEXT NOT NULL CHECK (status IN ('pending', 'triggered', 'skipped', 'failed')),
  triggered_at TIMESTAMPTZ,
  queue_item_id UUID REFERENCES action_queue(id) ON DELETE SET NULL,
  reason TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Idempotency guarantee per account+invoice+stage
CREATE UNIQUE INDEX IF NOT EXISTS ux_scheduler_state_account_invoice_stage
  ON scheduler_state(account_id, invoice_id, stage);

-- Operational lookups
CREATE INDEX IF NOT EXISTS idx_scheduler_state_account_status_created
  ON scheduler_state(account_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_scheduler_state_account_invoice
  ON scheduler_state(account_id, invoice_id);

-- RLS enforcement
ALTER TABLE scheduler_state ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Tenant access: scheduler_state" ON scheduler_state;

CREATE POLICY "Tenant access: scheduler_state"
  ON scheduler_state
  FOR ALL
  USING (account_id IN (SELECT account_id FROM memberships WHERE memberships.user_id = auth.uid()));
