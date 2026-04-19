# Controlled Beta Checklist

## Target Users
- Non-technical early customers (SMB owners, office managers).
- **Cohort A**: 1 selected beta participant only. Deep observation of behavior before expansion.
- Must have a Supabase account and existing invoice data in CSV format.

## Allowed Operations
- **CSV Ingestion**: Upload and commit invoice data.
- **Queue Review**: View "Needs Review" items, edit drafts, and approve.
- **Manual Send**: Explicitly trigger "Mark as Sent (Simulation)" for approved items.
- **Scheduler**: Automated scanning for reminder stages (0, 3, 7, 14 days).
- **Audit History**: View recent activity timeline.

## Known Limitations
- **No AI Autonomy**: Every reminder requires manual approval and manual send action.
- **No Multi-Account**: Users are constrained to exactly one membership/account.
- **Static Templates**: AI drafting uses a fallback deterministic template (Phase 4 Blocked).
- **No Real Email Sending**: The "Send" action updates DB status only (Simulation Mode).
- **No Payment Sync**: Ledger must be updated manually via CSV; no live bank feeds.

---

# Beta Operations Readiness

## Operator Guide
1. **Provisioning**: Manually insert rows into `accounts` and `memberships` tables for new users.
2. **Monitoring**: Run `SELECT * FROM audit_log ORDER BY created_at DESC` daily to track usage.
3. **Triggering**: Manually run `npm run scheduler:run` once per day to populate queues.
4. **Data Fixes**: Use Supabase Dashboard for direct invoice/contact edits if ingestion errors occur.

## Known Issues
- `useEffect` missing dependency warning in Action Queue UI (non-blocking).
- Contact matching by name only (risk of mismatch if emails change - mitigation in place via manual review).
- No "Undo" button for status transitions.

## Rollback & Support Checklist
- **Data Deletion**: `DELETE FROM invoices WHERE account_id = '...'` to reset a customer's environment.
- **System Off**: Disable the scheduler cron to pause all automated reminders.
- **Emergency**: Revoke Supabase roles to block all access.

---

# Early-User Feedback Capture

## Feedback to Collect
- Clarity of the "Needs Review" vs "Approved" distinction.
- Usefulness of the deterministic "Reminder Template" drafts.
- Ease of CSV upload and column mapping.
- Any technical jargon encountered (e.g. "uuid", "metadata").

## Success Metrics
- User completes a full cycle (Import -> Approve -> Send) within 15 minutes.
- User identifies and fixes at least one draft before approval.
- Zero "Fatal Error" screens encountered during simulation.

## Critical Failure Conditions
The beta **must pause immediately** if any of the following occur:
- **Data Mismatch**: Invoices linked to wrong accounts or incorrect amounts.
- **Duplicate Reminders**: System generates multiple actions for the same reminder stage.
- **Wrong Contact Targeting**: Reminders generated for wrong contact persons.
- **System Crashes**: Any unhandled exception resulting in a broken UI or service.

## Problem Classification
- **Critical**: Data loss, wrong recipient mapping, RLS bypass, login failure.
- **Non-Critical**: Typos, styling issues, missing "Undo" button, slow loading states.
