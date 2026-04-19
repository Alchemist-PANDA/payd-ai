# Real Usage Validation Summary

**Date**: 2026-04-19  
**Status**: Validation complete via code analysis and workflow trace-through

---

## Real Usage Observations

### What Works
1. CSV import parse/validate/commit flow is solid
2. Scheduler idempotency prevents duplicate queue items
3. Primary contact guarantee enforced at DB level
4. State machine transitions work correctly
5. Audit logging captures all events
6. Error categorization is structured

### What Confuses Users

#### 1. Auto-Queue + Scheduler Overlap
**Scenario**: User imports CSV → auto-queue creates stage-0 items → user runs scheduler → scheduler skips all with "idempotent_conflict"

**User sees**: "0 triggered, 10 skipped (idempotent)"  
**User thinks**: "Scheduler is broken"  
**Reality**: Auto-queue already created the items

#### 2. Contact Matching by Name Only
**Scenario**: Import "John Smith <john@newcompany.com>" when "John Smith <john@oldcompany.com>" exists

**User expects**: New contact created or email updated  
**System does**: Reuses old contact, ignores new email  
**Result**: Invoice linked to wrong email address

#### 3. Approved Items Never Sent
**Scenario**: User approves queue item

**User expects**: Email sent immediately  
**System does**: Changes status to `approved`, nothing else  
**Reality**: No send action exists (Phase 4 blocked)

#### 4. Technical Language Everywhere
- "idempotent_conflict" instead of "Already processed"
- "pending_review" instead of "Needs review"
- "scheduler_state" instead of "Reminder status"

#### 5. No System State Visibility
- Cannot see which stage an invoice is in
- Cannot see if scheduler ran today
- Cannot see if queue auto-generation succeeded
- Cannot see last scheduler run time

---

## Friction Points

### High-Impact Friction
1. **No progress indicators**: CSV import and scheduler run with no feedback
2. **Silent queue auto-generation failures**: Invoice commits but queue item fails silently
3. **Contact email mismatch**: Name-only matching causes wrong email linkage
4. **No scheduler status dashboard**: User doesn't know when to run scheduler or if it already ran
5. **No bulk queue actions**: Must approve/skip items one at a time

### Medium-Impact Friction
6. **Stage 7 wide range**: 7-13 days all treated the same (no urgency differentiation)
7. **No priority logic**: $150k invoice same priority as $500 invoice
8. **Partial import is silent**: Some rows skipped without prominent warning
9. **No undo for queue actions**: Cannot revert approve/skip
10. **Audit log pollution**: Idempotent skips create noise

### Low-Impact Friction
11. **No contact merge UI**: Cannot combine duplicate contacts
12. **No invoice deletion UI**: Cannot remove mistaken imports
13. **No error export**: Cannot download validation errors for offline fixing
14. **No dashboard widgets**: No "due this week" or "pending review count" summary

---

## Unexpected Behaviors

1. **Contact reuse ignores email**: Different emails for same name → reuses old contact
2. **Auto-queue + scheduler create idempotent skips**: Confusing overlap
3. **Stage 7 duration**: 7-day window means invoice sits in same stage for a week
4. **Approved items sit forever**: No downstream send process (Phase 4 blocked)
5. **Partial import is silent**: Valid rows commit, invalid rows skipped without prominent alert
6. **Large amounts not prioritized**: No amount-based priority calculation
7. **Scheduler run frequency unclear**: No guidance on how often to run

---

## Real User Confusion Scenarios

### "Why didn't the scheduler do anything?"
- Import CSV → run scheduler immediately
- Scheduler skips all (idempotent conflict)
- User thinks scheduler is broken
- Reality: Auto-queue already created stage-0 items

### "Where did my email go?"
- Import "John Smith <john@newcompany.com>"
- System reuses "John Smith <john@oldcompany.com>"
- User expects email to newcompany.com
- Reality: Email goes to oldcompany.com

### "I approved it, why wasn't it sent?"
- User approves queue item
- Status changes to `approved`
- User expects email sent
- Reality: No send action exists (Phase 4 blocked)

### "Why is this $100k invoice not at the top?"
- Import high-value overdue invoice
- System creates queue item with priority = 'medium'
- User expects amount-based prioritization
- Reality: No priority logic implemented

### "How do I know if the scheduler ran today?"
- User opens dashboard
- No scheduler status indicator
- User doesn't know if they should run it again
- Reality: No UI visibility into scheduler execution

---

## What Would Confuse a Real User

### Immediate Confusion (First 5 Minutes)
1. Technical jargon everywhere ("idempotent_conflict", "pending_review")
2. No progress feedback during import
3. Approved items don't send (Phase 4 blocked)

### Short-Term Confusion (First Day)
4. Scheduler skips everything after CSV import (auto-queue overlap)
5. Contact email mismatch (name-only matching)
6. No scheduler status (when to run? did it run?)

### Medium-Term Confusion (First Week)
7. No bulk actions (tedious one-by-one approval)
8. No priority logic (high-value invoices buried)
9. No undo (cannot revert mistakes)

### Long-Term Confusion (First Month)
10. Audit log pollution (idempotent skip noise)
11. Stage 7 wide range (no urgency differentiation)
12. No contact management (cannot merge duplicates)

---

## System Behavior Under Variation

### Partial Payments
**Status**: Not implemented  
**Expected confusion**: User marks invoice as partially paid, scheduler still triggers reminders for full amount

### Promise Scenarios
**Status**: Scheduler skips invoices with active promises  
**Friction**: User cannot see promise status from invoice list

### Dispute Scenarios
**Status**: Scheduler skips invoices with dispute queue items  
**Friction**: Dispute detection relies on fragile payload inspection

---

## Validation Conclusion

**System is functionally correct** but has **significant UX friction**:

1. ✓ Data integrity is solid (primary contact guarantee, idempotency)
2. ✓ State machine is correct (no invalid transitions)
3. ✓ Audit logging is comprehensive
4. ✗ Technical language confuses users
5. ✗ No visibility into system state
6. ✗ Silent failures (queue auto-gen)
7. ✗ Confusing overlaps (auto-queue + scheduler)
8. ✗ Missing bulk operations
9. ✗ No undo/rollback
10. ✗ Contact matching fragility

**Recommendation**: Next pass should focus on **visibility and clarity** (dashboards, plain language, status indicators) rather than new features.

---

## Files Created

1. `test-data/01-basic-invoices.csv` - 5 invoices, mixed due dates
2. `test-data/02-due-today.csv` - 3 invoices due today (stage 0)
3. `test-data/03-overdue-3-7-14-days.csv` - 4 invoices at different overdue stages
4. `test-data/04-validation-edge-cases.csv` - 7 rows with validation errors
5. `test-data/05-duplicate-contacts.csv` - 5 invoices, 2 duplicate contacts
6. `test-data/06-large-amounts-overdue.csv` - 4 high-value overdue invoices
7. `scripts/validate-real-usage.ts` - Automated validation script (requires Supabase credentials)
8. `docs/REAL_USAGE_VALIDATION_REPORT.md` - Full detailed report

---

## Next Steps (Not Implemented)

If addressing UX friction:
1. Add scheduler status dashboard (last run, next recommended run)
2. Change contact matching to email-first (not name-first)
3. Add plain-language labels ("Already processed" not "idempotent_conflict")
4. Add progress indicators for import and scheduler
5. Add bulk approve/skip actions
6. Add prominent warning for partial import
7. Add stage visibility badge on invoice list
8. Add priority auto-calculation (amount + overdue days)
