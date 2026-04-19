# AI Review Policy

## Current State: Phase 4 Blocked (Review-First Mode)

During Phase 4 blockage, **ALL** AI-derived outputs that affect workflow must route through human review before execution.

### Review-First Enforcement

| Category | Current Policy | Rationale |
|----------|---------------|-----------|
| `dispute` | **ALWAYS** requires review | Safety-critical: legal/relationship risk |
| `paid_claim` | **ALWAYS** requires review (Phase 4) | Workflow-impacting: affects ledger state |
| `explicit_promise` | **ALWAYS** requires review (Phase 4) | Workflow-impacting: affects follow-up scheduling |
| `weak_payment_signal` | **ALWAYS** requires review | Ambiguous intent |
| `out_of_office` | Review optional | Informational only, no workflow impact |
| `other` | **ALWAYS** requires review | Uncertain classification |

### Queue Item Creation

All AI outputs flow through `QueueIngestionService`:
- **Status**: `pending_review` (never `approved` or `sent` directly)
- **Priority**: Elevated for disputes (10), standard for others (5)
- **Audit**: Every queue item creation fires an `audit_log` event

### Mock Provider Behavior

The `MockAiProvider` enforces review-first policy at the source:
- `classifyReply`: Sets `requires_human_review: true` for all workflow-impacting categories
- `extractPromise`: Sets `requires_human_review: true` for all extractions during Phase 4
- `generateDraft`: Implicitly requires review (all drafts route to `pending_review` status)

## Future State: Post-Phase 4 Validation

After Phase 4 evaluation gate passes (≥90% accuracy, 100% dispute recall), selective auto-approval may be enabled for:

### Candidates for Auto-Approval (Future)

| Category | Conditions | Justification |
|----------|-----------|---------------|
| `out_of_office` | Confidence ≥ 0.95 | Informational, no action required |
| `paid_claim` | Confidence ≥ 0.92 AND ledger verification passes | Reduces manual review burden for confirmed payments |
| `explicit_promise` | Confidence ≥ 0.90 AND date extraction validated | Automates follow-up scheduling for clear commitments |

### Never Auto-Approve

| Category | Policy | Rationale |
|----------|--------|-----------|
| `dispute` | **ALWAYS** human review | Legal/relationship risk, requires judgment |
| `weak_payment_signal` | **ALWAYS** human review | Ambiguous intent, high false-positive risk |
| `other` | **ALWAYS** human review | Uncertain classification |

### Enabling Auto-Approval (Future)

Auto-approval will require:
1. Phase 4 gate passed with documented accuracy metrics
2. Explicit configuration flag: `ENABLE_AUTO_APPROVAL=true`
3. Per-category confidence thresholds validated against Golden Set
4. Audit trail for all auto-approved actions
5. Monitoring dashboard for auto-approval accuracy

## Architecture Guarantees

### Provider Boundary
- Business logic (`ReplyClassifierService`, `PromiseExtractorService`, `DraftGeneratorService`) is provider-agnostic
- No direct coupling to Anthropic SDK or any specific LLM provider
- Mock provider and live provider implement identical `AiProvider` interface

### No Hidden Fallbacks
- `src/lib/ai/index.ts` controls provider selection via environment variables only
- No runtime fallback to live APIs when mock is active
- Production mode with `ENABLE_LIVE_AI !== 'true'` forces mock provider

### Review Enforcement
- `QueueIngestionService` always creates items with `status: 'pending_review'`
- State machine in `ActionQueueService` validates all transitions
- No code path bypasses the `pending_review` → `approved` → `sent` flow

## Testing Requirements

### Mock Provider Tests
- ✅ Deterministic classification across repeated runs
- ✅ Review-first policy enforced for all workflow-impacting categories
- ✅ Confidence scores match expected ranges
- ⚠️ Queue item creation not yet covered (integration test needed)
- ⚠️ Audit log creation not yet covered (integration test needed)

### Integration Tests (Pending)
- Queue item creation from AI outputs
- Audit log events fired correctly
- State machine transitions respect review policy
- No auto-approval during Phase 4 blockage

## Monitoring (Future)

Post-Phase 4, track:
- Auto-approval rate by category
- Human override rate (approved → edited → approved)
- False positive rate (auto-approved but incorrect)
- Review queue depth and latency
