# Beta Operator Runbook

## 1. Starting a Session
1. **Provision Account**: Ensure a record exists in `accounts` and the user is linked in `memberships`.
2. **Access URL**: Direct the user to the `/login` page.
3. **Login**: User signs in with their Supabase credentials.
4. **Dashboard**: Verify the user lands on the dashboard with "Phase 1 Scaffold" visible.

## 2. Importing Invoices Safely
1. **Prepare CSV**: Follow the schema in `sample-invoices.csv`. Ensure headers match exactly: `invoice_number`, `contact_name`, `amount`, `due_date`, `issued_date`.
2. **Select File**: Use the "Import CSV" button on the Invoices page.
3. **Verify Preview**: Check for the "Ready" status on rows. Resolve any "Duplicate" or "Invalid" warnings in the source CSV if needed.
4. **Confirm**: Click "Confirm Import". Wait for the success banner before proceeding.

## 3. Reviewing Action Queue
1. **Load Queue**: Navigate to `/action-queue`.
2. **Select Item**: Click on an item in the "Needs Review" status.
3. **Review Context**: Inspect "Invoice Context" and "Contact Context" in the detail panel.
4. **Edit/Approve**:
    - Modify "Subject" or "Body" if the default template needs adjustment.
    - Click "Approve" (for final approval) or "Save Edits" (to keep working).
5. **Mark as Sent**: Click "Mark as Sent (Simulation)" for approved items. This is a simulation; no email will be sent.

## 4. What NOT to Do
- **DO NOT** attempt to import CSVs with non-standard date formats (use YYYY-MM-DD).
- **DO NOT** use multiple accounts; the system only supports one membership per session.
- **DO NOT** expect automated email delivery. All "sent" actions are currently simulated.
- **DO NOT** use the browser's "Back" button during a "Confirm Import" transition.

## 6. Monitoring & Evidence Capture
1. **Identify Session ID**:
   - Ask the user to open the browser console (F12) and type `sessionStorage.getItem('payd_beta_session_id')`.
   - Record this ID in the `docs/BETA_EVIDENCE_TEMPLATE.md`.
2. **Real-time Event Tracking**:
   - Use the Supabase Dashboard SQL Editor to monitor the user's progress:
     ```sql
     SELECT created_at, action, metadata->>'session_id' as session_id, metadata
     FROM audit_log
     WHERE entity_type = 'ui_session'
     ORDER BY created_at DESC;
     ```
3. **Capture Evidence**:
   - After the session, copy the relevant `audit_log` rows into the session evidence document.
   - Cross-reference user friction (hesitation/confusion) with specific `ui_session` events.
