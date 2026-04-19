# User Friction Report: Real Usage Simulation

**Date**: 2026-04-19  
**Phase**: 2 (Core Workflows) - Real Usage Simulation (Hardened)

---

## 1. Simulation Summary
Simulated 5 core workflows using direct service invocation (headless) to verify data integrity and business rules.

| Scenario | Result | Data Correctness | Audit Consistency |
| :--- | :--- | :--- | :--- |
| **1. CSV Import** | ✓ PASS | Invoices/Contacts created correctly | `invoice.import` logged |
| **2. Scheduler Stages** | ✓ PASS | Stages 0/3 triggered correctly | `scheduler.run.started` logged |
| **3. Promise Blocking** | ✓ PASS | Invoice skipped correctly | `scheduler.invoice.skipped` logged |
| **4. Dispute Blocking** | ✓ PASS | Invoice blocked correctly | `scheduler.invoice.skipped` logged |
| **5. Action Queue** | ✓ PASS | Approved/Dismissed status persists | `queue_item.updated` logged |

---

## 2. Resolved Friction Points (Final Fix Pass)

### ✓ Fixed: Fatal Dependence on AI Keys
**Issue**: Missing API keys previously caused entire workflows to fail.  
**Resolution**: Implemented production-grade graceful degradation in `QueueIngestionService`. If AI generation fails, the system automatically uses a deterministic "Reminder Template" and labels the item as "Auto-generated (no AI)".  
**Result**: Invoices are still processed, and queue items are still created, allowing users to manually edit the draft.

---

## 3. Remaining Friction Points (Non-Technical User Focus)

### A. Terminology: "Idempotent Conflict"
**Issue**: The scheduler logs "idempotent_conflict" when a stage has already been triggered.  
**Friction**: Technical jargon is confusing for early users.  
**Action**: This was identified in simulation and remains a target for the final UI terminology pass.

### B. Bulk Review Workflow
**Issue**: Actions currently require one-by-one review in the detail panel.  
**Friction**: Slow for users with large batches of invoices.  
**Action**: Noted for future UX optimization. Bulk approval is not required by the current plan but would improve "real-world" usability.

### C. "Approved" vs "Sent" Clarity
**Issue**: Approved items remain in the queue with "Approved" status.  
**Friction**: Since Phase 4 is blocked and automated sending is disabled, users may be confused about when the email actually leaves the system.  
**Action**: Clearly communicate "Approved (Pending Send)" in the UI (implemented in clarity pass).

---

## 4. Inconsistencies & Unexpected Outcomes

1. **Schema Resilience**: During simulation, missing columns in some DB environments were detected. The system now includes resilience logic to safely skip metadata insertion if columns are missing, preventing fatal errors.

---

**Simulation Status**: SUCCESS (Core flows are now robust and usable without AI).
