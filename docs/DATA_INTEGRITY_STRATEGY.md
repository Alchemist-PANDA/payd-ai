# Data Integrity Strategy

## Primary Contact Guarantee

### Problem
Invoices without a primary contact link cannot be processed by the scheduler or queue generation logic. This creates silent failures and operational confusion.

### Solution (Multi-Layer)

#### Layer 1: DB-Level Enforcement (Strongest)
**Migration**: `20260419093000_primary_contact_guarantee.sql`

- **Unique partial index**: Enforces exactly one `contact_type = 'primary'` per invoice
  ```sql
  CREATE UNIQUE INDEX ux_invoice_contact_links_primary
    ON invoice_contact_links(invoice_id)
    WHERE contact_type = 'primary';
  ```
- **Check constraint**: Validates `contact_type` values
- **Validation function**: `validate_invoice_has_primary_contact()` returns orphan invoices for monitoring

#### Layer 2: Application-Level Enforcement (Import Path)
**File**: `src/services/ingestion/CsvIngestionService.ts`

- Contact link insert is checked immediately after invoice creation
- On failure:
  - Distinguishes between duplicate primary link (`23505`) and other errors
  - Logs `invoice.import.failed` with explicit reason
  - Throws descriptive error with invoice number and failure type
  - Prevents commit from continuing

#### Layer 3: Scheduler Defensive Handling
**File**: `src/services/scheduler/ReminderSchedulerService.ts`

- Scheduler checks for primary contact before queue generation
- Missing contact triggers:
  - `scheduler_state.status = 'failed'` with `reason = 'missing_contact'`
  - `scheduler.invoice.error` audit event with `error_type = 'missing_primary_contact'`
  - Error added to run summary
- Invoice is skipped, not silently processed

### Guarantees

1. **New invoices via CSV import**: Cannot be created without primary contact link (enforced at commit time)
2. **Existing orphan invoices**: Detected by scheduler and marked as failed with explicit reason
3. **Future non-import paths**: DB constraint prevents creation without primary link

### Monitoring

Run periodic integrity check:
```sql
SELECT * FROM validate_invoice_has_primary_contact();
```

Empty result = no orphans exist.

---

## Error Clarity Improvements

### Audit Event Standardization

All scheduler and ingestion audit events now use consistent field naming:

#### Skip Events (`scheduler.invoice.skipped`)
- `skip_reason`: One of `paid_or_void`, `active_promise`, `dispute_exists`, `idempotent_conflict`
- `invoice_number`: For human readability
- `stage`, `stage_label`, `overdue_days`: Context
- Related entity IDs where applicable (`promise_id`, `dispute_queue_item_id`)

#### Error Events (`scheduler.invoice.error`)
- `error_type`: Categorized error (e.g., `missing_primary_contact`, `queue_trigger_failed`, `scheduler_state_insert_failed`)
- `error_message`: Human-readable description
- `error_code`: DB error code if applicable
- `invoice_number`: For human readability
- `stage`, `stage_label`, `overdue_days`: Context
- `error_stack`: Truncated stack trace (500 chars) for debugging

#### Success Events (`scheduler.stage.triggered`)
- `stage`, `stage_label`, `invoice_number`
- `overdue_days`, `action_type`
- `queue_item_id`: Link to generated queue item

#### Import Events
- `invoice.import.failed`: Includes `reason` (e.g., `duplicate_primary_contact_link`, `contact_link_insert_failed`), `error_code`, `error_message`, `contact_id`
- `queue.auto_generation_failed`: Includes `invoice_number`, `error_message`, `error_stack`

### Scheduler State Consistency

`scheduler_state` table remains source of truth:
- `status`: `pending`, `triggered`, `skipped`, `failed`
- `reason`: Explicit skip/failure reason matching audit event `skip_reason`/`error_type`
- `metadata`: Includes `invoice_number`, `stage_label`, `overdue_days`, and error details for failed states

### Console Logging

Ingestion service now logs queue auto-generation failures to console with invoice number for immediate operator visibility.

---

## Remaining Weak Spots

### 1. Non-Import Invoice Creation Paths
**Risk**: Future code paths that insert invoices outside `CsvIngestionService` may bypass contact link logic.

**Mitigation**:
- DB constraint will prevent creation without primary link
- Scheduler will detect and fail with explicit error
- Periodic integrity check will surface any orphans

**Recommendation**: Centralize all invoice creation through a single service layer.

### 2. Audit Log Write Failures
**Risk**: Audit log writes are observability-only and do not hard-fail operations. Silent audit write failures reduce debuggability.

**Current Behavior**: Audit service logs errors but does not throw.

**Mitigation**: Operational logs and `scheduler_state` provide redundant observability.

**Recommendation**: Add optional strict mode for audit writes in critical paths.

### 3. Distributed Scheduler Execution
**Risk**: Multiple scheduler processes running concurrently may create noise (duplicate conflict skips).

**Current Behavior**: Idempotency via `scheduler_state` unique constraint prevents duplicate queue items, but produces `skipped_idempotent` audit events.

**Mitigation**: Idempotency is safe; noise is observable but not harmful.

**Recommendation**: Add distributed lock or single-instance enforcement for production.

### 4. Multi-Account Membership UX
**Risk**: Users with multiple account memberships cannot switch accounts in UI.

**Current Behavior**: Temporary single-membership enforcement throws clear error.

**Mitigation**: Explicit error prevents silent wrong-account operations.

**Recommendation**: Build account switcher UI before removing single-membership constraint.
