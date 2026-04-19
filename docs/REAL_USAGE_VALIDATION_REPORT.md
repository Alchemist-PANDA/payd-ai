# Real Usage Validation Report
**Date**: 2026-04-19  
**Method**: Simulated user workflows based on system documentation and code analysis

---

## Validation Approach

Since live Supabase credentials are not available in the validation environment, this report is based on:
1. Code path analysis of CSV import, scheduler, and queue flows
2. Test suite behavior (45 passing tests)
3. Documented system constraints and edge cases
4. Manual trace-through of user workflows

---

## Scenario 1: Basic CSV Import (5 invoices, mixed due dates)

### Expected Flow
1. User uploads `01-basic-invoices.csv` (5 rows)
2. Parse → Validate → Preview
3. User confirms import
4. System commits invoices + contacts + links
5. Auto-generates 5 queue items (pending_review)

### Observations
- **Parse**: PapaParse handles standard CSV format cleanly
- **Validation**: Zod schema validates required fields (invoice_number, amount, due_date, issued_date, contact_name)
- **Commit**: Creates/reuses contacts by name match, inserts invoices, creates primary contact links
- **Queue auto-generation**: Calls `QueueIngestionService.generateDraftAndQueue` for each invoice

### Friction Points
1. **No progress indicator during commit**: User sees no feedback while 5 invoices are being processed sequentially
2. **Queue auto-generation failures are silent in UI**: If queue generation fails, invoice still commits but user only sees success message
3. **Contact deduplication logic unclear**: Matches by `name` only, not `name + email`. Two contacts with same name but different emails will be treated as one contact.

### Unexpected Behaviors
- **Contact reuse by name only**: `John Smith <john@company1.com>` and `John Smith <john@company2.com>` would reuse the same contact record, potentially linking wrong email to invoice

---

## Scenario 2: Due Today Invoices + Scheduler (Stage 0)

### Expected Flow
1. Import 3 invoices with `due_date = 2026-04-19` (today)
2. Auto-queue generation creates 3 pending_review items
3. Run scheduler
4. Scheduler computes `overdueDays = 0`, maps to stage 0
5. Scheduler attempts to create stage-0 queue items
6. Idempotent conflict: stage 0 already exists from auto-generation
7. Scheduler skips with `skip_reason = 'idempotent_conflict'`

### Observations
- **Stage mapping**: `overdueDays = 0` correctly maps to stage 0
- **Idempotency**: `scheduler_state` unique constraint prevents duplicate queue items
- **Skip reason**: Audit log records `skip_reason = 'idempotent_conflict'`

### Friction Points
1. **Confusing skip reason for users**: "idempotent_conflict" is technical jargon. User may think something went wrong when scheduler shows "3 skipped (idempotent)" even though system is working correctly.
2. **No UI visibility into scheduler_state**: User cannot see why scheduler skipped invoices without checking audit log or database directly.
3. **Auto-queue + scheduler overlap unclear**: User doesn't know that CSV import already created stage-0 queue items, so scheduler skip seems unexpected.

### Unexpected Behaviors
- **Double queue attempt is invisible**: User imports CSV (queue created), then runs scheduler (queue skipped), but UI shows no indication that queue item already exists from import.

---

## Scenario 3: Overdue Invoices (3/7/14 day stages)

### Expected Flow
1. Import invoices with due dates: 2026-04-16 (3d overdue), 2026-04-12 (7d), 2026-04-09 (10d), 2026-04-05 (14d)
2. Run scheduler
3. Scheduler maps:
   - 3 days overdue → stage 3
   - 7 days overdue → stage 7
   - 10 days overdue → stage 7 (still in 7-13 range)
   - 14 days overdue → stage 14

### Observations
- **Stage boundaries**: 0-2 days → stage 0, 3-6 → stage 3, 7-13 → stage 7, 14+ → stage 14
- **Overdue calculation**: Uses UTC date comparison, strips time component

### Friction Points
1. **Stage 7 covers wide range (7-13 days)**: Invoice at 7 days and 13 days both trigger stage 7, but urgency is different. No sub-staging or priority adjustment.
2. **No stage progression visibility**: User cannot see which stage an invoice is currently in without checking `scheduler_state` table.
3. **Stage 14 is final**: No further escalation after 14 days. Very old invoices (30+ days) still only trigger stage 14.

### Unexpected Behaviors
- **Stage 7 duration**: 7-day window for stage 7 means invoice could sit in same stage for a week without further action.

---

## Scenario 4: Validation Edge Cases

### Test Cases
- Missing contact name
- Invalid currency
- Negative amount
- Missing invoice number
- Future issued_date (after due_date)

### Observations
- **Zod validation**: Catches all schema violations
- **Error messages**: Field-level errors like `invoice_number: Required`, `amount: Number must be greater than 0`
- **Preview UI**: Shows valid/invalid row status before commit

### Friction Points
1. **Error messages are technical**: `invoice_number: Required` instead of "Invoice number is missing"
2. **No row-level error summary**: User must scan each field error individually
3. **Duplicate detection happens late**: Duplicate invoice numbers are only detected during validation, not during parse. User sees "valid" row in preview, then "duplicate" error.
4. **No bulk error download**: If 100 rows have errors, user cannot export error list for offline fixing.

### Unexpected Behaviors
- **Partial commit is silent**: If 10 rows are valid and 5 are invalid, system commits 10 and skips 5. User sees "10 invoices imported" but may not notice 5 were skipped.

---

## Scenario 5: Duplicate Contact Handling

### Test Case
- 5 invoices, 2 contacts: "John Smith" (2 invoices), "Jane Doe" (3 invoices)

### Observations
- **Contact lookup**: `SELECT * FROM contacts WHERE account_id = ? AND name = ?`
- **Reuse logic**: If contact exists, reuse ID; otherwise create new

### Friction Points
1. **Name-only matching is fragile**: "John Smith" with different emails will reuse same contact
2. **No email update on reuse**: If existing contact has no email, and new import has email, email is not updated
3. **No contact merge UI**: If user realizes two contacts should be one, no way to merge them

### Unexpected Behaviors
- **Email mismatch**: Import "John Smith <john@newcompany.com>" when "John Smith <john@oldcompany.com>" exists → reuses old contact, new email is ignored
- **Contact proliferation**: Slight name variations ("John Smith", "John Smith Jr.", "J. Smith") create separate contacts

---

## Scenario 6: Large Amounts + Overdue Priority

### Test Case
- 4 invoices: $50k, $125k, $87.5k, $150k (all overdue 14+ days)

### Observations
- **Queue priority**: Currently hardcoded to `'medium'` in `QueueIngestionService`
- **No amount-based prioritization**: $150k invoice gets same priority as $500 invoice

### Friction Points
1. **No priority logic**: High-value invoices are not automatically prioritized
2. **Manual priority adjustment required**: User must manually change priority in Action Queue UI
3. **Priority field is not prominent in UI**: User may not notice priority column

### Unexpected Behaviors
- **Large overdue invoices buried**: $150k invoice 30 days overdue appears in queue with same priority as $500 invoice due today

---

## Scenario 7: Action Queue State Transitions

### Test Cases
- Approve: `pending_review → approved`
- Skip: `pending_review → skipped`
- Edit: `pending_review → edited` (with payload update)

### Observations
- **State machine**: Enforced in `ActionQueueService`
- **Audit events**: Each transition creates audit log entry
- **Payload updates**: Edit action updates `payload` field with modified draft

### Friction Points
1. **No "send" action available**: User approves item, but cannot send from UI (expected, but may confuse users expecting immediate send)
2. **Edit UX is unclear**: User must understand that editing changes status to `edited`, not back to `pending_review`
3. **No bulk actions**: User must approve/skip items one at a time
4. **No undo**: Once skipped or approved, no way to revert (must manually change status back)

### Unexpected Behaviors
- **Approved items sit forever**: No downstream process consumes `approved` items and sends emails (Phase 4 blocked)
- **Edited vs pending_review distinction unclear**: Both require review, but different status values

---

## Scenario 8: Scheduler Idempotency (Double Run)

### Test Case
- Run scheduler twice in immediate succession

### Observations
- **First run**: Triggers actions for eligible invoices
- **Second run**: All invoices skipped with `skip_reason = 'idempotent_conflict'`
- **No duplicate queue items**: `scheduler_state` unique constraint prevents duplicates

### Friction Points
1. **Idempotent skip noise**: Second run produces many audit events with `idempotent_conflict`, cluttering audit log
2. **No "already processed" indicator**: Scheduler output shows "10 skipped (idempotent)" but doesn't explain that this is expected behavior
3. **Scheduler run frequency unclear**: User doesn't know how often to run scheduler (daily? hourly?)

### Unexpected Behaviors
- **Audit log pollution**: Running scheduler hourly creates 23 idempotent skip events per invoice per day (if invoice stays in same stage)

---

## Cross-Cutting Friction Points

### 1. No Real-Time Feedback
- CSV import: No progress bar during commit
- Scheduler: No live progress during run
- Queue generation: Failures are silent

### 2. Technical Language Everywhere
- "idempotent_conflict"
- "pending_review" vs "edited" vs "approved"
- "scheduler_state"
- "queue_item_id"

### 3. No Undo/Rollback
- Cannot undo CSV import
- Cannot revert queue item status changes
- Cannot delete imported invoices from UI

### 4. Limited Bulk Operations
- Cannot bulk-approve queue items
- Cannot bulk-skip queue items
- Cannot bulk-delete invoices

### 5. No Dashboard/Overview
- No "invoices due this week" summary
- No "queue items pending review" count
- No "scheduler last run" timestamp
- No "high-priority items" alert

### 6. Unclear System State
- User cannot see which stage an invoice is in
- User cannot see if scheduler has run today
- User cannot see if queue auto-generation succeeded

### 7. Contact Management Gaps
- No contact editing UI
- No contact merging
- No contact deduplication review
- Email-only matching not supported

### 8. Error Recovery Unclear
- If queue auto-generation fails, how does user retry?
- If scheduler fails on one invoice, does it continue with others? (Yes, but not obvious)
- If contact link insert fails, how does user fix orphan invoice?

---

## Unexpected Behaviors Summary

1. **Contact reuse by name only**: Different emails ignored
2. **Auto-queue + scheduler overlap**: Creates confusing idempotent skips
3. **Stage 7 wide range**: 7-13 days all treated the same
4. **No stage progression visibility**: User blind to current stage
5. **Approved items never sent**: Sit in queue forever (Phase 4 blocked)
6. **Partial import is silent**: Some rows skipped without prominent warning
7. **Audit log pollution**: Idempotent skips create noise
8. **Large amounts not prioritized**: $150k invoice same priority as $500

---

## Real User Confusion Scenarios

### Scenario A: "Why didn't the scheduler do anything?"
**User action**: Import CSV, run scheduler immediately  
**System behavior**: Scheduler skips all invoices (idempotent conflict)  
**User sees**: "0 triggered, 10 skipped (idempotent)"  
**User thinks**: "Scheduler is broken"  
**Reality**: Auto-queue already created stage-0 items

### Scenario B: "Where did my email go?"
**User action**: Import "John Smith <john@newcompany.com>"  
**System behavior**: Reuses existing "John Smith <john@oldcompany.com>" contact  
**User sees**: Invoice linked to John Smith  
**User thinks**: Email will go to john@newcompany.com  
**Reality**: Email will go to john@oldcompany.com (existing contact email)

### Scenario C: "I approved it, why wasn't it sent?"
**User action**: Approve queue item  
**System behavior**: Status changes to `approved`  
**User sees**: Item disappears from pending list  
**User thinks**: Email was sent  
**Reality**: No send action exists (Phase 4 blocked)

### Scenario D: "Why is this $100k invoice not at the top?"
**User action**: Import high-value overdue invoice  
**System behavior**: Creates queue item with priority = 'medium'  
**User sees**: $100k invoice mixed with $500 invoices  
**User thinks**: System should prioritize by amount  
**Reality**: No amount-based prioritization logic

### Scenario E: "How do I know if the scheduler ran today?"
**User action**: Opens dashboard  
**System behavior**: No scheduler status indicator  
**User sees**: List of invoices  
**User thinks**: "Did I run the scheduler? Should I run it again?"  
**Reality**: No UI visibility into scheduler execution history

---

## Recommendations (Not Implemented)

### High-Impact UX Improvements
1. **Scheduler status dashboard**: Last run time, next recommended run, summary stats
2. **Contact matching by email**: Use email as primary match key, not name
3. **Queue item priority auto-calculation**: Factor in amount + overdue days
4. **Bulk queue actions**: Approve/skip multiple items at once
5. **Import progress indicator**: Show "Processing invoice 3 of 10..."
6. **Stage visibility**: Show current stage badge on invoice list
7. **Plain-language skip reasons**: "Already processed" instead of "idempotent_conflict"
8. **Partial import warning**: Prominent alert if some rows were skipped

### Medium-Impact Improvements
9. **Contact merge UI**: Combine duplicate contacts
10. **Undo for queue actions**: Revert approve/skip within 5 minutes
11. **Error export**: Download CSV of validation errors
12. **Scheduler run frequency guidance**: "Run daily at 9am" recommendation
13. **Audit log filtering**: Hide idempotent skips by default
14. **Queue auto-generation retry**: Manual retry button if auto-gen failed

### Low-Impact Improvements
15. **Stage progression timeline**: Visual timeline showing stage history
16. **Contact email update on reuse**: Update email if new import has one
17. **Invoice deletion UI**: Soft-delete with undo
18. **Dashboard widgets**: "Due this week", "Overdue 14+ days", "Pending review count"

---

## System Behavior Under Variation

### Partial Payments
**Current behavior**: Not implemented  
**Expected confusion**: User marks invoice as partially paid, but scheduler still triggers reminders for full amount

### Promise Scenarios
**Current behavior**: Scheduler skips invoices with `active` promises  
**Friction**: User cannot see promise status from invoice list, must check promises table directly

### Dispute Scenarios
**Current behavior**: Scheduler skips invoices with dispute queue items  
**Friction**: Dispute detection relies on `action_type = 'dispute_review'` OR `payload.classification.category = 'dispute'`, which is fragile

---

## Conclusion

The system is **functionally correct** but has **significant UX friction** that would confuse real users:

1. **Technical language** throughout (idempotent_conflict, pending_review, scheduler_state)
2. **No visibility** into system state (scheduler runs, stage progression, queue auto-generation status)
3. **Silent failures** (queue auto-gen fails, partial import skips rows)
4. **Confusing overlaps** (auto-queue + scheduler both create stage-0 items)
5. **Missing bulk operations** (approve/skip one at a time)
6. **No undo/rollback** (cannot revert actions)
7. **Contact matching fragility** (name-only matching causes email mismatches)
8. **No prioritization logic** (large amounts not auto-prioritized)

**Recommendation**: Focus next pass on **visibility and clarity** (dashboards, plain language, status indicators) rather than new features.
