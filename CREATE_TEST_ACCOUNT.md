# QUICK FIX: Create Test Account

## Run This SQL in Supabase Dashboard

Go to: https://supabase.com/dashboard/project/ewcuhsoylempdbnmegqo/sql

**Copy and paste this:**

```sql
-- Create test account (bypasses RLS when run in SQL Editor)
INSERT INTO accounts (name) VALUES ('Test Validation Account');

-- Verify it was created
SELECT id, name FROM accounts;
```

You should see output like:
```
id: 550e8400-e29b-41d4-a716-446655440000
name: Test Validation Account
```

---

## Then Re-run Validation

```cmd
cd C:\Users\CGS_Computer\payd-ai
set NEXT_PUBLIC_SUPABASE_URL=https://ewcuhsoylempdbnmegqo.supabase.co
set NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_7uHgv7CWUrTsVbeOCPRqag_vktgC_cP
node scripts\real-validation.js
```

The script will now find and use the existing account instead of trying to create one.

---

**Status**: Waiting for you to create the test account, then re-run validation.
