# Scheduler / Reminder Engine v1

## Scope
Scheduler v1 generates staged reminder draft actions into the Action Queue only (review-first).

- No direct send path
- No real AI integration
- No Anthropic integration
- Phase 4 remains blocked

## Scheduling Model

### Stages
- Stage **0**: due today / 0+ days overdue
- Stage **3**: 3+ days overdue
- Stage **7**: 7+ days overdue
- Stage **14**: 14+ days overdue

### Stage resolution
`getCurrentStage(overdueDays)`:
- `< 0` → null (skip)
- `0..2` → 0
- `3..6` → 3
- `7..13` → 7
- `>=14` → 14

## Trigger Conditions
For each invoice in statuses `pending | partial | overdue`:
1. Resolve overdue stage
2. Skip if invoice is paid/void
3. Skip if active promise exists
4. Skip if dispute exists
5. Skip if same stage already triggered (idempotency)
6. Require linked contact
7. Trigger queue draft action via `QueueIngestionService.generateDraftAndQueue(...)`

## Missing-contact policy
Current behavior: **scheduler-time error** (`scheduler.invoice.error`) if no linked contact exists.

### Long-term recommended policy
- Treat as **invalid data** earlier in ingestion (primary policy)
- Keep scheduler-time error as defense-in-depth fallback
- Optional future: generate a queue warning item for ops remediation

## Idempotency (v1)
Current idempotency is **audit-log-based v1**:
- Before triggering, scheduler queries `audit_log` for `scheduler.stage.triggered` with same invoice + same stage.
- If found, it skips as `skipped_idempotent`.

### Limitations
- Audit-log check is not a DB uniqueness constraint.
- Concurrent scheduler runs can race (both check before either writes) and could create duplicates.

### Recommendation for v2
Introduce a dedicated `scheduler_state` table with a unique key like:
`(account_id, invoice_id, stage)`
and upsert/lock semantics to make idempotency concurrency-safe.

## Explicit behavior examples

1. **overdue 0 days** -> stage 0
2. **overdue 3 days** -> stage 3
3. **overdue 7 days** -> stage 7
4. **overdue 14+ days** -> stage 14
5. **paid invoice** -> skipped (`skipped_paid`)
6. **active promise** -> skipped (`skipped_promise` + `scheduler.invoice.skipped` reason=`active_promise`)
7. **dispute** -> skipped (`skipped_dispute` + `scheduler.invoice.skipped` reason=`dispute_exists`)
8. **same stage already triggered** -> skipped (`skipped_idempotent`)
9. **no linked contact** -> error (`scheduler.invoice.error`)

## Queue output guarantees
For each successful trigger:
- Exactly one call to `QueueIngestionService.generateDraftAndQueue(...)` is made by scheduler.
- That service creates one `action_queue` row per call.
- Created item status is always `pending_review`.
- No scheduler code path sends emails directly.

## Sample audit events

### scheduler.run.started
```json
{
  "action": "scheduler.run.started",
  "entity_type": "scheduler",
  "metadata": {
    "stages": [0, 3, 7, 14],
    "stage_labels": ["due_today", "overdue_3d", "overdue_7d", "overdue_14d"]
  }
}
```

### scheduler.stage.triggered
```json
{
  "action": "scheduler.stage.triggered",
  "entity_type": "invoice",
  "metadata": {
    "stage": 7,
    "stage_label": "overdue_7d",
    "overdue_days": 9,
    "action_type": "send_email"
  }
}
```

### scheduler.invoice.skipped
```json
{
  "action": "scheduler.invoice.skipped",
  "entity_type": "invoice",
  "metadata": {
    "reason": "active_promise",
    "stage": 3,
    "overdue_days": 4
  }
}
```

### scheduler.invoice.error
```json
{
  "action": "scheduler.invoice.error",
  "entity_type": "invoice",
  "metadata": {
    "error": "No linked contact found",
    "stage": 0,
    "overdue_days": 1
  }
}
```

## Sample queue payload (scheduler-triggered)
```json
{
  "draft": {
    "subject": "Follow-up on Invoice INV-2001",
    "body_text": "Hi Acme Industries,\\n\\nJust following up on Invoice INV-2001 for 5000.00 USD...",
    "confidence": 0.95,
    "rationale": "Generated standard professional reminder template."
  },
  "context": "Scheduler reminder stage=7 (overdue_7d), overdue_days=9"
}
```

## Current status
Scheduler v1 is functional and review-first, but not concurrency-hardened for idempotency races.
