# Real End-to-End Validation Guide

## Prerequisites

You need live Supabase credentials to run real validation.

## Option 1: Using .env.local (Recommended)

1. Create `.env.local` file in project root:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

2. Run validation:
```bash
node scripts/real-validation.js
```

## Option 2: Using Environment Variables

Run with credentials inline:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_url NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key node scripts/real-validation.js
```

## What the Validation Does

### Scenario 1: Basic CSV Import
- Creates 2 test invoices with contacts
- Verifies invoices exist in DB
- Verifies primary contact links created
- **Tests**: Contact link integrity, invoice creation

### Scenario 2: Scheduler Execution
- Runs scheduler logic on test invoices
- Creates scheduler_state rows
- Creates queue items
- **Tests**: Stage mapping, queue generation, scheduler_state updates

### Scenario 3: Contact Matching
- Creates contact "John Smith <john@oldcompany.com>"
- Attempts to import invoice with "John Smith <john@newcompany.com>"
- Verifies which email gets linked
- **Tests**: Name-only vs email matching bug

### Scenario 4: Idempotency
- Runs scheduler twice on same invoice/stage
- Verifies unique constraint prevents duplicates
- **Tests**: Idempotency guarantee

## Expected Output

The script will:
1. Connect to Supabase
2. Create/reuse test account
3. Clean previous test data
4. Execute 4 real scenarios
5. Generate JSON report: `docs/REAL_VALIDATION_RESULTS.json`
6. Print summary to console

## What to Look For

### Confirmed Bugs
- Contact matching by name only (email mismatch)
- Any idempotency failures
- Missing primary contact links

### Mismatches
- Expected vs actual row counts
- Queue items vs triggered actions
- Scheduler_state status inconsistencies

### Unexpected Behaviors
- Silent failures
- Missing audit log entries
- Incorrect stage mapping

## After Running

Share the output with me:
1. Console output (copy/paste)
2. `docs/REAL_VALIDATION_RESULTS.json` file contents

I'll analyze the real results and identify:
- Confirmed bugs
- Mismatches between expected and actual
- Assumptions that were wrong
- Real-world friction points
