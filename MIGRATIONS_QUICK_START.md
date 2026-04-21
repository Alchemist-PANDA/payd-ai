# QUICK START: Apply Migrations Now

## Step 1: Go to Supabase SQL Editor
https://supabase.com/dashboard/project/ewcuhsoylempdbnmegqo/sql

## Step 2: Run These 3 SQL Scripts (In Order)

### Migration 1: Initial Schema
**File**: `supabase/migrations/20260418000000_initial_schema.sql`

Copy the entire contents of this file and paste into SQL Editor, then click "Run".

This creates:
- accounts, memberships, contacts, invoices
- invoice_contact_links, promises, action_queue
- audit_log, email_events, invoice_payments
- RLS policies

### Migration 2: Scheduler State
**File**: `supabase/migrations/20260419052000_scheduler_state.sql`

Copy the entire contents of this file and paste into SQL Editor, then click "Run".

This creates:
- scheduler_state table
- Unique index for idempotency
- RLS policy

### Migration 3: Primary Contact Guarantee
**File**: `supabase/migrations/20260419093000_primary_contact_guarantee.sql`

Copy the entire contents of this file and paste into SQL Editor, then click "Run".

This creates:
- Unique partial index for primary contacts
- Check constraint for contact_type
- Validation function

---

## Step 3: After All 3 Migrations Succeed

Run validation again:

```cmd
cd C:\Users\CGS_Computer\payd-ai
set NEXT_PUBLIC_SUPABASE_URL=https://ewcuhsoylempdbnmegqo.supabase.co
set NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_7uHgv7CWUrTsVbeOCPRqag_vktgC_cP
node scripts\real-validation.js
```

Then share:
1. Full console output
2. `docs\REAL_VALIDATION_RESULTS.json`

---

**The migration files are in your local repo at:**
- `C:\Users\CGS_Computer\payd-ai\supabase\migrations\`

Open each file, copy contents, paste into Supabase SQL Editor, run.
