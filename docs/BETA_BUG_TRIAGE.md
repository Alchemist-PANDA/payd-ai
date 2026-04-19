# Beta Bug Triage Checklist

## Severity Levels

### Level 1: Critical (STOP SESSION)
- **RLS Bypass**: User can see or edit invoices/contacts belonging to a different account.
- **Data Corruption**: Invoices linked to the wrong contact or amounts incorrectly stored.
- **Login Failure**: Users cannot access the platform at all.
- **State Leak**: Action Queue shows items from other accounts.

### Level 2: High (PAUSE & INVESTIGATE)
- **Import Failure**: Valid CSV data fails to parse or commit repeatedly.
- **Queue Mismatch**: System generates duplicate actions for the same reminder stage.
- **UI Hang**: Page becomes unresponsive during standard workflows (Import, Review, Save).

### Level 3: Low (CONTINUE & LOG)
- **Cosmetic Issues**: Typos, misaligned buttons, or styling inconsistencies.
- **UX Friction**: Confusing terminology or lack of "Undo" capability.
- **Performance**: Slow transitions that eventually complete.

## Evidence to Capture
- **Console Logs**: Right-click -> Inspect -> Console. Copy all red errors.
- **Network Trace**: Inspect -> Network. Identify the failing Supabase or API call.
- **Screenshot**: Capture the full window showing the error message and the URL.
- **Action Details**: ID of the Invoice or Action Queue item being processed at the time of failure.

## decision Matrix
- **STOP**: If Level 1 is encountered. Revoke session and lock the environment.
- **CONTINUE**: If only Level 3 issues are found. Document in `docs/FIRST_USER_FEEDBACK.md`.
- **OPERATOR CHOICE**: For Level 2, the operator may attempt a manual reset (page refresh/DB cleanup) or choose to pause if the issue is systemic.

## Traceability
1. **Retrieve Session ID**: Always capture the `session_id` from the browser (see Runbook) before triage.
2. **Event Log Audit**: Use the `session_id` to filter the `audit_log` (entity_type='ui_session') and reconstruct the exact steps leading to the failure.
3. **Compare Behavior**: Verify if the system's recorded event matches the user's reported action (e.g., did they really click "Confirm" or just "Preview"?).
