# REAL VALIDATION - READY TO RUN

## Quick Start

I've created real validation scripts that will execute actual DB operations and verify results.

**I cannot run these without your Supabase credentials.**

### Run Now

1. **Set up credentials** (choose one):

   **Option A - .env.local file (recommended):**
   ```bash
   # Create .env.local in project root
   echo "NEXT_PUBLIC_SUPABASE_URL=your_url_here" > .env.local
   echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key_here" >> .env.local
   ```

   **Option B - Inline:**
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your_url NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key node scripts/real-validation.js
   ```

2. **Run validation:**
   ```bash
   cd C:\Users\CGS_Computer\payd-ai
   node scripts/real-validation.js
   ```

3. **Share results with me:**
   - Copy console output
   - Share `docs/REAL_VALIDATION_RESULTS.json`

## What Gets Tested (Real Execution)

### ✓ Scenario 1: Basic CSV Import
- Creates 2 invoices + contacts in real DB
- Verifies primary contact links exist
- Checks for orphan invoices

### ✓ Scenario 2: Scheduler Execution  
- Runs real scheduler logic
- Creates scheduler_state rows
- Creates queue items
- Verifies triggered vs skipped counts

### ✓ Scenario 3: Contact Matching Bug
- Creates "John Smith <old@email.com>"
- Imports invoice with "John Smith <new@email.com>"
- **Confirms if name-only matching causes email mismatch**

### ✓ Scenario 4: Idempotency
- Runs scheduler twice on same invoice/stage
- **Confirms if unique constraint prevents duplicates**

## Expected Bugs to Confirm

1. **Contact email mismatch**: Name-only matching reuses wrong email
2. **Any idempotency failures**: Duplicate scheduler_state rows
3. **Missing primary links**: Invoices without contact links

## Alternative: Provide Credentials Now

If you want me to run this, provide:
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

I'll execute the validation and analyze real results immediately.

---

**Status**: Scripts ready, waiting for credentials to execute real validation.
