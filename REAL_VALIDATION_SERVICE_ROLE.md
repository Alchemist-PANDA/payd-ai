# REAL VALIDATION - SERVICE ROLE KEY APPROACH

## Environment Variables Required

You need exactly **2 environment variables**:

```
NEXT_PUBLIC_SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
```

**IMPORTANT:**
- Service role key bypasses RLS (required for validation)
- Use ONLY in server-side scripts, NEVER in frontend code
- Do NOT paste service role key in chat
- Keep it in local environment only

---

## Exact Windows CMD Commands

### Step 1: Set Environment Variables
```cmd
cd C:\Users\CGS_Computer\payd-ai
set NEXT_PUBLIC_SUPABASE_URL=https://ewcuhsoylempdbnmegqo.supabase.co
set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**Where to find service role key:**
- Supabase Dashboard → Settings → API
- Look for "service_role" key (NOT anon key)

### Step 2: Run Validation
```cmd
node scripts\real-validation.js
```

---

## What Output to Copy Back

**A. Full console output** - Everything printed to console

**B. JSON report file:**
```
C:\Users\CGS_Computer\payd-ai\docs\REAL_VALIDATION_RESULTS.json
```

### Critical Data Points:

**Scenario 1 (CSV Import):**
- `invoices_created` count
- `primary_links` count
- Any bugs or mismatches

**Scenario 2 (Scheduler):**
- `triggered` vs `skipped` counts
- `scheduler_state_rows` count
- `queue_items` count

**Scenario 3 (Contact Matching Bug):**
- `linked_email` value
- `system_used_email` vs `user_intended_email`
- **Confirms if name-only matching causes email mismatch**

**Scenario 4 (Idempotency):**
- `first_run_result` (should be "success")
- `second_run_result` (should be "conflict")
- `total_state_rows` (should be 1)
- **Confirms unique constraint prevents duplicates**

---

## Success Indicators

✓ Script completes without fatal errors
✓ All 4 scenarios execute
✓ Report file created
✓ Console shows "SUMMARY" section

---

## App Auth Model (Unchanged)

The product app continues to use:
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (frontend)
- User authentication + session
- RLS policies enforced
- No service role key in frontend

**Service role key is ONLY for this validation script.**

---

## Future Path: Authenticated Test User Validation

For more faithful testing that matches real app behavior:

1. Create test user via Supabase Auth
2. Create membership linking user to test account
3. Validation script signs in as test user
4. All operations run with authenticated session + RLS enforced

**Benefits:**
- Tests real auth flow
- RLS policies remain enabled
- More faithful to production behavior

**Not implemented yet** - current service role approach is sufficient for validation.

---

## Ready to Run

**Command sequence:**
```cmd
cd C:\Users\CGS_Computer\payd-ai
set NEXT_PUBLIC_SUPABASE_URL=https://ewcuhsoylempdbnmegqo.supabase.co
set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
node scripts\real-validation.js
```

**After completion, share:**
1. Full console output
2. `docs\REAL_VALIDATION_RESULTS.json`
