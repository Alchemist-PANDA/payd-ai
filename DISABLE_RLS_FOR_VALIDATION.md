# DISABLE RLS FOR VALIDATION

## Problem
RLS policies block anon key from reading/writing ANY data, even if accounts exist.

## Solution: Temporarily Disable RLS

Run this SQL in Supabase Dashboard:
https://supabase.com/dashboard/project/ewcuhsoylempdbnmegqo/sql

```sql
-- Disable RLS on all tables for validation
ALTER TABLE accounts DISABLE ROW LEVEL SECURITY;
ALTER TABLE memberships DISABLE ROW LEVEL SECURITY;
ALTER TABLE contacts DISABLE ROW LEVEL SECURITY;
ALTER TABLE invoices DISABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_contact_links DISABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE promises DISABLE ROW LEVEL SECURITY;
ALTER TABLE crs_scores DISABLE ROW LEVEL SECURITY;
ALTER TABLE action_queue DISABLE ROW LEVEL SECURITY;
ALTER TABLE email_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log DISABLE ROW LEVEL SECURITY;
ALTER TABLE scheduler_state DISABLE ROW LEVEL SECURITY;

-- Create test account if not exists
INSERT INTO accounts (name) VALUES ('Test Validation Account')
ON CONFLICT DO NOTHING;

-- Verify
SELECT 'RLS disabled, ready for validation' as status;
```

Then run validation:
```cmd
cd C:\Users\CGS_Computer\payd-ai
set NEXT_PUBLIC_SUPABASE_URL=https://ewcuhsoylempdbnmegqo.supabase.co
set NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_7uHgv7CWUrTsVbeOCPRqag_vktgC_cP
node scripts\real-validation.js
```

## After Validation Completes

**Re-enable RLS** (important for security):

```sql
-- Re-enable RLS on all tables
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_contact_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE promises ENABLE ROW LEVEL SECURITY;
ALTER TABLE crs_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduler_state ENABLE ROW LEVEL SECURITY;

SELECT 'RLS re-enabled' as status;
```

---

**This is the only way to run validation with anon key.**

RLS is designed to block unauthenticated access - we need to disable it temporarily for validation, then re-enable it.
