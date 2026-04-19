# Production-Readiness Usage Simulation Report

## Scope
This report validates the current tenant-aware, review-first system behavior without introducing new product features.

Validated domains:
1. End-to-end user workflow simulation (login → import → queue → scheduler → review actions)
2. Data integrity tightening analysis
3. Operational visibility check (logs + `scheduler_state`)
4. System boundary clarity (guaranteed vs best-effort vs not implemented)

Constraints respected:
- No Anthropic integration
- No AI evaluation runs
- Phase 4 remains blocked

---

## 1) End-to-End Real Usage Simulation (Step-by-step)

### Preconditions
- Supabase credentials configured (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
- User has exactly one membership row
- CSV file available (e.g. `sample-invoices.csv`)

### Step 1 — Login
**Path**: `/login`
- User enters email/password
- `supabase.auth.signInWithPassword(...)` executes
- On success, user is routed to `/dashboard`

**Expected behavior**:
- Session exists
- App shell shows account label from membership/account resolution
- Logout button is visible

### Step 2 — Import CSV
**Path**: `/invoices`
- Upload CSV via "Import CSV"
- `CsvIngestionService.parseFile(...)`
- `CsvIngestionService.validateImport(...)`
- Preview shows valid/invalid rows
- User confirms import

**Expected behavior**:
- Valid rows committed
- Invalid rows skipped before commit
- For each valid row:
  1. contact created/reused
  2. invoice created
  3. primary contact link inserted (now enforced)
  4. `invoice.import` audit event written
  5. queue auto-generation attempted

### Step 3 — Verify invoices created
**Data source**: `invoices` table
**Expected**:
- Newly imported invoices exist for resolved `account_id`
- Invoice status starts as `pending`

### Step 4 — Verify queue items generated automatically
**Data source**: `action_queue` table
**Expected**:
- Each successful auto-generation creates one `send_email` queue item
- Status is `pending_review`
- Associated `invoice_id` and `contact_id` are present
- No direct send path is used

### Step 5 — Run scheduler
**Command**: `npm run scheduler:run`
- Scans accounts
- For each invoice in `pending|partial|overdue`, computes stage 0/3/7/14
- Applies skip rules (paid/promise/dispute/idempotent)
- Creates queue item for successful stage trigger

### Step 6 — Verify stage-based queue items appear
**Data sources**:
- `scheduler_state` table (source of truth for stage execution)
- `action_queue` table (review queue)

**Expected**:
- For triggered stage rows, queue items exist and remain `pending_review`
- For skipped/failed stage rows, queue item may be null and reason set

### Step 7 — Review actions in Action Queue
**Path**: `/action-queue`
- User approves item (`pending_review -> approved`)
- User edits item (`pending_review -> edited` with payload update)
- User skips item (`pending_review -> skipped`)

**Expected**:
- State transitions persist in `action_queue`
- Corresponding audit events are created
- No direct send action available in UI

---

## 2) Data Integrity Tightening

### Verified: no invoice creation path outside import service
Code search result for `invoices.insert(...)`:
- `src/services/ingestion/CsvIngestionService.ts` only

### Integrity checks

#### A) Invoice must have one primary contact link
Current enforcement:
- Import commit now checks `invoice_contact_links` insert result
- On failure, writes `invoice.import.failed` and throws

Current gap:
- No DB-level uniqueness constraint enforcing exactly one `primary` link per invoice

#### B) Orphan invoices
Current risk status:
- Reduced in CSV import path due to explicit link insertion check
- Still possible if future non-import path inserts invoices without link logic

#### C) Scheduler processing invalid invoices
Current handling:
- Missing contact during scheduler run -> `scheduler_state.failed(reason=missing_contact)` + `scheduler.invoice.error`
- Invalid invoice is not silently processed

### Enforcement strategy (recommended)
1. **Primary**: keep import-time enforcement (already implemented)
2. **DB hardening** (next): add unique partial index for primary link, e.g. one primary contact per invoice
3. **Integrity job** (optional): periodic orphan invoice detector writing audit alerts

---

## 3) Minimal Operational Visibility

### Scheduler run visibility
From `scripts/run-reminder-scheduler.ts`:
- Start log: `[Scheduler] Starting reminder scheduler run...`
- Per-account summary includes:
  - scanned
  - eligible
  - triggered
  - skipped_paid
  - skipped_promise
  - skipped_dispute
  - skipped_idempotent
  - errors
- Fatal and non-fatal error counts are surfaced

### Audit visibility
Scheduler emits:
- `scheduler.run.started`
- `scheduler.run.completed`
- `scheduler.run.failed`
- `scheduler.stage.triggered`
- `scheduler.invoice.skipped` (with reason)
- `scheduler.invoice.error` (with message)

Ingestion emits:
- `invoice.import`
- `invoice.import.failed`
- `queue.auto_generated`
- `queue.auto_generation_failed`

### Debuggability assessment
An engineer can debug from:
1. `scheduler_state` (stage source of truth)
2. `action_queue` (actual review items)
3. `audit_log` (timeline and reasons)
4. scheduler runner stdout summary

This is sufficient for v1 operational triage.

---

## 4) System Boundaries (Explicit)

### Guaranteed
1. Scheduler idempotency is source-of-truth via `scheduler_state` unique `(account_id, invoice_id, stage)`
2. Scheduler outputs are review-first (`action_queue.status = pending_review`)
3. CSV import auto-attempts queue generation for each successfully committed invoice
4. Scheduler skip/failure reasons are persisted

### Best-effort
1. Audit logging is observability-oriented; failures are logged but may not hard-fail every path
2. Scheduler run logs are process logs (not centralized observability stack)
3. Concurrency handling relies on unique conflict behavior (safe for duplicates, but may produce skip-conflict noise)

### Not implemented yet
1. Multi-account membership switching UI (currently temporary single-membership constraint)
2. Distributed scheduler lock/orchestration
3. DB-level hard guarantee of exactly one primary contact link per invoice
4. Real AI evaluation/unblocking (Phase 4 remains blocked)

---

## Friction points found

1. **Multiple memberships blocked**
- Current behavior intentionally throws clear error.
- Correct for safety, but UX friction until account switching exists.

2. **Scheduler conflict visibility is audit-driven**
- Conflicts are visible, but no dedicated dashboard yet.

3. **No interactive progress indicators for long scheduler runs**
- Operator relies on CLI summary and audit logs.

---

## Potentially confusing behaviors

1. Invoice imported successfully but queue auto-generation failed:
- Invoice still exists; queue item may not.
- Must inspect `queue.auto_generation_failed` and `scheduler.invoice.error` events.

2. Stage skip due to idempotent conflict:
- Appears as skipped even when prior trigger succeeded.
- This is expected and prevents duplication.

3. Missing-contact scenario:
- Should be rare after import hardening, but still possible from future non-import paths.

---

## Final remaining risks before real users

1. **No account-switching UX** (single membership only)
2. **No distributed scheduler lock** (idempotency protects duplicates but not execution contention noise)
3. **No DB-level one-primary-contact guarantee**
4. **Audit log write failure can reduce observability completeness**

Overall readiness: **strong for controlled early users in single-account flow**, with known operational and tenancy UX constraints documented.
