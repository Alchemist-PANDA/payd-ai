# REAL VALIDATION - EXECUTION INSTRUCTIONS

## 1. Required Environment Variables

You need exactly **2 environment variables**:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

**No other variables required** (Anthropic API, email, etc. not needed for this validation)

---

## 2. Exact Steps to Run (Windows CMD)

### Step 1: Open Windows CMD
```cmd
cd C:\Users\CGS_Computer\payd-ai
```

### Step 2: Set Environment Variables
```cmd
set NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
set NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

### Step 3: Run Validation
```cmd
node scripts\real-validation.js
```

**That's it.** The script will:
- Connect to Supabase
- Create/reuse test account
- Clean old test data
- Run 4 real scenarios
- Generate report

---

## 3. What Output to Copy Back

### Copy ALL of these:

#### A. Full Console Output
Copy everything from start to finish, including:
- "REAL END-TO-END VALIDATION" header
- All scenario logs
- All "✓" success messages
- All "❌" error messages
- Final summary section

#### B. JSON Report File
After script completes, copy contents of:
```
C:\Users\CGS_Computer\payd-ai\docs\REAL_VALIDATION_RESULTS.json
```

### Critical Data Points to Note:

**Scenario 1 (CSV Import):**
- `invoices_created` count
- `primary_links` count
- Any mismatches or bugs

**Scenario 2 (Scheduler):**
- `triggered` count
- `skipped` count
- `scheduler_state_rows` count
- `queue_items` count

**Scenario 3 (Contact Matching):**
- `linked_email` value
- `system_used_email` vs `user_intended_email`
- **This confirms the contact matching bug**

**Scenario 4 (Idempotency):**
- `first_run_result` (should be "success")
- `second_run_result` (should be "conflict")
- `total_state_rows` (should be 1)
- **This confirms idempotency works**

---

## 4. How to Identify Success vs Failure

### ✓ Success Indicators:
- Script completes without fatal errors
- All 4 scenarios execute
- Report file created at `docs/REAL_VALIDATION_RESULTS.json`
- Console shows "SUMMARY" section at end

### ❌ Failure Indicators:
- "FATAL ERROR" message
- Script exits early
- Missing report file
- Connection errors to Supabase

### Expected Bugs (These are GOOD findings):
- **Scenario 3**: Contact email mismatch (name-only matching bug)
- **Scenario 4**: Should show idempotency working correctly

---

## 5. If Script Fails

### Common Issues:

**"supabaseUrl is required"**
- Environment variables not set correctly
- Re-run `set` commands in same CMD window

**"Cannot find module '@supabase/supabase-js'"**
- Run: `npm install`

**"Permission denied" or "EACCES"**
- Check file permissions
- Run CMD as administrator

**Connection timeout**
- Check Supabase URL is correct
- Check network connection

---

## Quick Reference

**Full command sequence:**
```cmd
cd C:\Users\CGS_Computer\payd-ai
set NEXT_PUBLIC_SUPABASE_URL=your_url
set NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
node scripts\real-validation.js
```

**After completion, share with me:**
1. Full console output (copy/paste)
2. Contents of `docs\REAL_VALIDATION_RESULTS.json`

---

**Ready to run.** Execute the commands above and share the output.
