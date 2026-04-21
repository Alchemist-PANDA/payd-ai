# Cohort A Observation Guide
**Phase 4: Real User Workflow Validation**

## 🛑 Ground Rules
1. **Deterministic Mode Only:** Ensure `.env.local` lacks `AI_PROVIDER=gemini` (defaults to `mock`). We are testing the workflow and UX, not AI hallucinations.
2. **Silence is Golden:** Do not explain the UI. Watch them figure it out. If they ask a question, reply: "What do you think it means?" before answering.
3. **Capture the "Why":** A clicked button is data; a confused facial expression is an insight.

---

## 📋 Preparation
- [ ] Find 1 real agency owner, freelancer, or ops manager.
- [ ] Ensure they have a real CSV of outstanding invoices ready (or provide a sanitized template).
- [ ] Clear test data for their session (`DELETE FROM accounts WHERE ...`).
- [ ] Confirm environment is strictly deterministic (`AI_PROVIDER=mock`).

---

## 🎬 The Observation Script

### Step 1: Onboarding & Resolution
* **Action:** User logs in and creates an account.
* **Watch For:** Do they understand what the tool does immediately? Do they hesitate on any naming conventions?
* **Questions to Ask (if stuck):** "What are you expecting to happen next?"

### Step 2: CSV Import
* **Action:** User uploads their invoice CSV.
* **Watch For:** 
  * Do they understand the required headers?
  * If columns mismatch, do they know how to fix it?
  * Do they trust the system with their real client data?
* **Capture:** Time taken to successfully map and import the CSV.

### Step 3: Action Queue Review
* **Action:** User navigates to the Action Queue to see the deterministic drafts generated from their CSV.
* **Watch For:** 
  * Do they understand why an email is "Pending Review"?
  * Do the deterministic fallback drafts feel safe/appropriate to them?
  * Do they notice the "Auto-generated (no AI)" tag? Does it cause trust or confusion?
* **Questions to Ask:** "How do you feel about this draft being sent to your client?"

### Step 4: Approve / Edit / Skip
* **Action:** User takes action on 3-5 pending items.
* **Watch For:** 
  * Do they use the "Edit" function? If so, what do they change? (Tone? Facts?)
  * Do they understand what "Approve" actually does (queues it for the scheduler vs sending instantly)?
  * If they click "Skip", what was their reasoning?

### Step 5: Scheduler Trigger (Simulated or Real-Time)
* **Action:** The cron scheduler triggers, or the user manually runs the scheduler script.
* **Watch For:** 
  * Do they understand that approved items will go out based on the schedule?
  * Do they check the "Sent" or "History" tab to verify?

---

## 📊 Data to Capture
Keep a notepad open and record:
- **Timestamps** of major friction points.
- **Quotes** of confusion ("Wait, does this send right now?").
- **Clicks** on the wrong buttons or dead ends.
- **Trust Signals** (e.g., "I wouldn't want to send this without my partner checking it").

---

## 📥 How to Export the Session's Audit Log
After the session concludes, you need the hard data to compare against your notes. Run this SQL query in the Supabase SQL Editor:

```sql
-- Replace 'ACCOUNT_ID' with the actual account_id used during the session
SELECT 
    created_at,
    action,
    entity_type,
    metadata
FROM audit_log
WHERE account_id = 'ACCOUNT_ID'
ORDER BY created_at ASC;
```

Export this to a CSV and attach it to your `USER_FRICTION_REPORT.md` along with your qualitative notes.
