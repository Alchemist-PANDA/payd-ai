# FIX RLS INFINITE RECURSION

## Problem
The RLS policies have circular dependency:
- `accounts` policy checks `memberships`
- `memberships` policy checks `accounts`
- Result: "infinite recursion detected"

## Solution

### Step 1: Run This SQL in Supabase Dashboard
Go to: https://supabase.com/dashboard/project/ewcuhsoylempdbnmegqo/sql

Copy and paste this SQL, then click "Run":

```sql
-- Fix for infinite recursion in RLS policies

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Tenant access: accounts" ON accounts;
DROP POLICY IF EXISTS "Tenant access: memberships" ON memberships;

-- Fix: memberships policy should directly check user_id (no recursion)
CREATE POLICY "Tenant access: memberships"
  ON memberships
  FOR ALL
  USING (user_id = auth.uid());

-- Fix: accounts policy references memberships (but memberships no longer references accounts)
CREATE POLICY "Tenant access: accounts"
  ON accounts
  FOR ALL
  USING (
    id IN (
      SELECT account_id
      FROM memberships
      WHERE user_id = auth.uid()
    )
  );
```

### Step 2: Re-run Validation
```cmd
cd C:\Users\CGS_Computer\payd-ai
set NEXT_PUBLIC_SUPABASE_URL=https://ewcuhsoylempdbnmegqo.supabase.co
set NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_7uHgv7CWUrTsVbeOCPRqag_vktgC_cP
node scripts\real-validation.js
```

---

**The fix is also saved in:**
`supabase/migrations/20260419104000_fix_rls_recursion.sql`

**After applying the fix, validation should work.**
