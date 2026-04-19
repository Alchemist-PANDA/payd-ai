# Early-User Onboarding Guide

Welcome to the **Payd AI** pre-launch beta! This guide will walk you through your first successful collection run using our **Review-First** workflow.

## The Review-First Workflow
To ensure accuracy and safety, Payd AI currently operates in a **Review-First Mode**. This means:
1. The system detects overdue invoices and drafts reminders for you.
2. **Nothing is sent to your customers automatically.**
3. You review, edit (if needed), and approve every single message.
4. You explicitly click "Send" to deliver the final email.

---

## Your First-Run Path

### Step 1: Upload Your Invoices
1. Navigate to the **Invoices** page.
2. Click **Import CSV**.
3. Upload your spreadsheet (see `docs/REAL_USAGE_VALIDATION_SUMMARY.md` for the required format).
4. Review the preview for any errors.
5. Click **Confirm Import**.
   - *Tip: The system will automatically create your first batch of "Needs Review" items in the queue.*

### Step 2: Review the Action Queue
1. Go to the **Action Queue**.
2. You will see a list of actions labeled **Needs Review**.
3. Click on an item to see the details:
   - **Invoice Context**: Which invoice is this for?
   - **Contact Context**: Who are we contacting?
   - **AI Draft**: What is the system proposing to say?

### Step 3: Approve or Edit
1. **To approve as-is**: Click the green **Approve (No Changes)** button.
2. **To make changes**: Edit the Subject or Body in the detail panel, then click **Save Edits & Mark as Edited**.
3. **To ignore**: If you don't want to take action right now, click **Dismiss This Action**.
   - *Note: Once approved, the item will move to the "Approved" status and stay in the queue.*

### Step 4: Manual Send
1. Filter your queue to show only **Approved** items.
2. Select an item you've recently approved.
3. Click the purple **Send Email Now** button.
4. Once sent, the item will move to **Completed** status.
   - *Success! You've successfully managed your first collection action.*

---

## Important Safety Rules

- **Active Promises**: If a customer has an active promise to pay, the system will automatically skip triggering new reminders.
- **Disputes**: If you mark an item as a "Dispute Review," the scheduler will block further reminders for that invoice until the dispute is resolved.
- **Already Processed**: If you run the scheduler multiple times, don't worry—it won't create duplicate actions for the same reminder stage.

---

**Support**: If you encounter any confusing messages or technical jargon, please report it via the feedback channel!
