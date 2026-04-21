# READY TO RUN - FINAL CHECKLIST

## ✓ Scripts Ready
- `scripts\real-validation.js` - Entry point (Windows-compatible)
- `scripts\real-validation-runner.js` - Test scenarios
- Both scripts verified and ready

## ✓ Dependencies Installed
- `@supabase/supabase-js@2.103.3` - Confirmed installed
- No additional packages needed

## ✓ Test Scenarios Configured
1. **Basic CSV Import** - Creates 2 invoices, verifies primary links
2. **Scheduler Execution** - Runs scheduler, verifies state + queue
3. **Contact Matching** - Tests name-only vs email bug
4. **Idempotency** - Double-run to confirm unique constraint

---

## EXECUTE NOW

### 1. Required Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### 2. Windows CMD Commands
```cmd
cd C:\Users\CGS_Computer\payd-ai
set NEXT_PUBLIC_SUPABASE_URL=your_url_here
set NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key_here
node scripts\real-validation.js
```

### 3. Share Back With Me
**A. Full console output** (everything printed)

**B. JSON report file:**
```
C:\Users\CGS_Computer\payd-ai\docs\REAL_VALIDATION_RESULTS.json
```

---

## What I'm Looking For

### Confirmed Bugs
- **Scenario 3**: Contact email mismatch (name-only matching)
- Any idempotency failures
- Missing primary contact links

### Real DB Counts
- Invoices created vs expected
- Queue items vs triggered actions
- Scheduler_state rows vs expected

### Mismatches
- Expected vs actual row counts
- Status inconsistencies
- Missing audit entries

---

## If You Hit Errors

**"supabaseUrl is required"**
→ Re-run `set` commands in same CMD window

**"Cannot find module"**
→ Run `npm install` first

**Connection errors**
→ Verify Supabase URL is correct

---

**Status**: Everything ready. Waiting for your execution output.

**Current time**: 2026-04-19T10:01:02.689Z
