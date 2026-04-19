-- Primary contact guarantee for invoices
-- Ensures exactly one primary contact link exists per invoice

-- 1. Add unique partial index: only one 'primary' contact_type per invoice
CREATE UNIQUE INDEX IF NOT EXISTS ux_invoice_contact_links_primary
  ON invoice_contact_links(invoice_id)
  WHERE contact_type = 'primary';

-- 2. Add check constraint: contact_type must be valid
ALTER TABLE invoice_contact_links
  DROP CONSTRAINT IF EXISTS chk_contact_type_valid;

ALTER TABLE invoice_contact_links
  ADD CONSTRAINT chk_contact_type_valid
  CHECK (contact_type IN ('primary', 'finance', 'escalation', 'cc'));

-- 3. Create validation function for orphan detection
CREATE OR REPLACE FUNCTION validate_invoice_has_primary_contact()
RETURNS TABLE(invoice_id UUID, invoice_number TEXT, account_id UUID) AS $$
BEGIN
  RETURN QUERY
  SELECT i.id, i.invoice_number, i.account_id
  FROM invoices i
  LEFT JOIN invoice_contact_links icl
    ON icl.invoice_id = i.id AND icl.contact_type = 'primary'
  WHERE icl.id IS NULL;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION validate_invoice_has_primary_contact IS
  'Returns invoices without a primary contact link (orphans). Run periodically for integrity monitoring.';
