-- Email uniqueness constraint for contacts
-- Ensures no duplicate emails per account (case-insensitive)

-- Create unique index on normalized (lowercase) email
-- Only applies where email is not null
CREATE UNIQUE INDEX IF NOT EXISTS ux_contacts_account_email_lower
  ON contacts(account_id, lower(email))
  WHERE email IS NOT NULL;

COMMENT ON INDEX ux_contacts_account_email_lower IS
  'Ensures email uniqueness per account (case-insensitive). Prevents duplicate contacts with same email.';

-- Note: This constraint allows multiple contacts with NULL email (expected behavior)
-- Example valid data:
--   account_id | name         | email
--   -----------+--------------+-------------------
--   acc-1      | John Smith   | john@company.com
--   acc-1      | Jane Doe     | jane@company.com
--   acc-1      | Bob Wilson   | NULL              ← allowed
--   acc-1      | Alice Brown  | NULL              ← allowed
--
-- Example blocked (duplicate email):
--   acc-1      | John Smith   | john@company.com
--   acc-1      | John Smith   | JOHN@COMPANY.COM  ← blocked (same email, case-insensitive)
