# System-Level Verification & Cleanup (Final Pass)

## Scope
- Scheduler correctness and state lifecycle
- End-to-end behavior confirmation (auth/import/queue/scheduler)
- Data integrity checks
- Cleanup and architecture docs consistency

## 1) Scheduler correctness verification

### No state downgrade rule
Scheduler now prevents downgrades by design:
- Skip paths (`paid_or_void`, `active_promise`, `dispute_exists`) call `insertSchedulerStateIfAbsent(...)`.
- This only inserts if missing; on uniqueness conflict it does nothing.
- Therefore an existing `triggered` row is not overwritten by a later skip path.

### State transition model (effective)
- New stage attempt: `pending` row insert
- Success: `pending -> triggered` (+ `triggered_at`, `queue_item_id`)
- Skip before trigger: insert `skipped` if absent
- Failure after pending: `pending -> failed`
- Idempotent re-run: uniqueness conflict => `skipped_idempotent` count + audit, no queue trigger

### Duplicate queue prevention
- Unique `(account_id, invoice_id, stage)` in `scheduler_state`
- Scheduler attempts insert first; conflict prevents queue trigger
- No second queue item can be created for same stage by normal runner path

## 2) End-to-end verification (final pass)

### Auth flow
- Login page exists: `/login` (email/password)
- Root route `/` checks session and routes to `/dashboard` or `/login`
- App shell has logout action and `SIGNED_OUT` redirect handling

### Import flow
- CSV parse/validate/commit runs with resolved `account_id`
- Invoices + contacts + invoice_contact_links are created
- Contact-link insertion failure now fails commit path and logs `invoice.import.failed`
- Queue auto-generation triggered after each successful invoice commit

### Scheduler flow
- Scheduler scans `pending|partial|overdue` invoices
- Applies stage model 0/3/7/14
- Applies safety skips (paid/promise/dispute)
- Creates stage-based queue items via `QueueIngestionService.generateDraftAndQueue`
- Writes scheduler and invoice-level audit events

### Consistency targets
- `scheduler_state.triggered` rows should have corresponding queue item + stage audit
- `scheduler_state.skipped/failed` rows should have reason and matching skip/error audit

## 3) Data integrity checks

### Invoice/contact linkage
- Commit path now enforces link success (`invoice_contact_links` insert checked)
- If link fails: throws and logs `invoice.import.failed`

### Orphan invoice risk
- Reduced in import path due to explicit link error handling
- Still possible if invoices are created outside import path and bypass linkage rules

### Scheduler invalid-row processing
- Scheduler requires linked contact; missing contact becomes `scheduler.invoice.error` and `scheduler_state.failed(reason=missing_contact)`
- Invalid invoice rows are not silently processed

## 4) Cleanup and architecture notes

### Debug logs
- Existing operational logs remain in ingestion and mock AI service.
- No scheduler-only debug spam added.

### Architecture summary
- Ingestion: validates + persists invoice/contact/link + auto queue generation
- Queue: all outputs remain review-first (`pending_review`)
- Scheduler: stage triggers with `scheduler_state` idempotency source of truth
- Audit log: observability/history, not idempotency source of truth

## Verification outputs run
- Scheduler tests: `ReminderSchedulerService.test.ts`, `ReminderSchedulerStateLifecycle.test.ts`
- Ingestion test: `CsvIngestionService.test.ts`

Result at run time:
- `3 passed, 12 tests passed`

## Bugs found in this pass
1. **Fixed**: potential status downgrade risk from `upsert` on skip paths overwriting triggered rows.
   - Resolved by switching skip paths to insert-if-absent behavior.

## Inconsistencies to monitor
- Cross-table consistency (`scheduler_state` <-> `action_queue` <-> `audit_log`) is maintained by service flow, but not enforced with DB-level foreign-key constraints to audit records (expected).

## Remaining weak spots before moving forward
1. No explicit distributed lock around scheduler runner (idempotency still protects duplicates).
2. Non-import invoice creation paths may still create missing-contact scenarios.
3. `audit_log` and `scheduler_state` can diverge if an audit write fails silently (audit path logs errors without throwing).
