# RLS BLOCKING VALIDATION

## Problem
RLS policies require authenticated user, but validation script uses anon key without auth.

Error: `new row violates row-level security policy for table "accounts"`

## Solution Options

### Option 1: Create Test Account Manually (Recommended)

Run this in Supabase SQL Editor:

```sql
-- Create test account (bypasses RLS)
INSERT INTO accounts (name) VALUES ('Test Validation Account');

-- Get the account ID
SELECT id, name FROM accounts;
```

Then re-run validation - it will use the existing account.

### Option 2: Temporarily Disable RLS for Validation

Run this in Supabase SQL Editor:

```sql
-- Disable RLS temporarily
ALTER TABLE accounts DISABLE ROW LEVEL SECURITY;
ALTER TABLE contacts DISABLE ROW LEVEL SECURITY;
ALTER TABLE invoices DISABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_contact_links DISABLE ROW LEVEL SECURITY;
ALTER TABLE action_queue DISABLE ROW LEVEL SECURITY;
ALTER TABLE scheduler_state DISABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log DISABLE ROW LEVEL SECURITY;
```

Run validation, then **re-enable RLS**:

```sql
-- Re-enable RLS after validation
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_contact_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduler_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
```

### Option 3: Use Service Role Key (Most Secure)

If you have the service role key, use it instead:

```cmd
set NEXT_PUBLIC_SUPABASE_URL=https://ewcuhsoylempdbnmegqo.supabase.co
set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
node scripts\real-validation.js
```

(Script would need modification to use service role key)

---

## Recommended: Option 1

**Run this SQL:**
```sql
INSERT INTO accounts (name) VALUES ('Test Validation Account');
```

**Then re-run validation:**
```cmd
cd C:\Users\CGS_Computer\payd-ai
set NEXT_PUBLIC_SUPABASE_URL=https://ewcuhsoylempdbnmegqo.supabase.co
set NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_7uHgv7CWUrTsVbeOCPRqag_vktgC_cP
node scripts\real-validation.js
```

The script will now use the existing account instead of trying to create one.
