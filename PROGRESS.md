# PROGRESS.md — Live Build Tracker

## Current Status
**Phase:** 1 (Foundation & Legal)
**Gate Status:** PENDING

## Activity Log
- [2026-04-18] Project initialized.
- [2026-04-18] Repository structure scaffolded.
- [2026-04-18] Governing documents established in `/docs`.
- [2026-04-18] Core Supabase schema v1 defined with multi-tenant RLS.
- [2026-04-18] Shared TypeScript contracts initialized in `/packages/shared`.
- [2026-04-18] Backend hardened: payment ledgering, memberships, and multi-contact threading.
- [2026-04-18] Frontend scaffolded: Next.js App Router, layout system, and tenant-aware lib scaffold.
- [2026-04-18] Phase 2: Core Workflows (Ingestion) foundation.
- [2026-04-18] CSV ingestion service implemented: parsing, validation, and multi-tenant commit logic.
- [2026-04-18] Route protection enforced via temporary dev-session guard.
- [2026-04-18] Unit tests for ingestion validation and normalization implemented.
- [2026-04-18] Phase 3 Intelligence Foundation: Anthropic client and AI adapter established.
- [2026-04-18] Intelligence contracts (Promise, Draft, Classification) defined.
- [2026-04-18] PromiseExtractor and DraftGenerator services with "review-first" guardrails.
- [2026-04-18] Action Queue review workflow implemented: states, review UI, and editing logic.
- [2026-04-18] Action Queue state machine unit tests for valid transitions and tenancy safety.
- [2026-04-18] Phase 3 Intelligence Foundation: GATED PASS.
- [2026-04-18] Golden Set evaluation dataset (fixtures) established in `/docs/evals`.
- [2026-04-18] Evaluation harness script (`run-eval.ts`) implemented for automated accuracy measurement.
- [2026-04-18] Overall accuracy reached 90% (Gated Target) through terse signal refinement.
- [2026-04-18] Golden Set expanded to 200 diverse fixtures.
- [2026-04-18] Phase 4 Optimization: IN PROGRESS (200/200 fixtures, clean run attempted).
- [2026-04-18] 200-fixture evaluation run result: INVALID (successful_calls=0, failed_calls=200, failure_rate=100%; fallback classifications=200; API 429 failures=195; malformed response shape errors=5). Phase 5 remains blocked.
- [2026-04-18] Evaluation reliability hardened: throttling, retries with exponential backoff, per-call logging, and robust response parsing for Anthropic + OpenAI-compatible proxy shapes.
- [2026-04-18] Full 200-fixture rerun became VALID at infrastructure level (successful_calls=200, failed_calls=0, failure_rate=0), but quality collapsed (accuracy 33.5%, dispute recall 26.7%, paid_claim recall 20%, review routing safety 41%).
- [2026-04-18] Diagnostic audit completed: dominant collapse into `other` (149/200 predictions), with most missed disputes routed to `other` (22/30 missed). Controlled 20-fixture subset reproduced low-quality behavior under the same runtime config. Phase 5 remains blocked pending model/config diagnosis and targeted fix.
- [2026-04-19] Pivot: OpenRouter free-tier dynamic routing (`openrouter/free`) tested. Run structurally invalid (20% failure rate) and quality on successful calls collapsed (~12.5% accuracy). Free-tier routing is not suitable for evaluation or review-first mode. Phase 5 remains blocked.
- [2026-04-19] Direction Shift: Suspended live AI model evaluation due to lack of paid API access. Phase 4 remains strictly blocked. All AI autonomous decisions disabled.
- [2026-04-19] Shifting focus to non-model-critical foundations: Action Queue UI, schema, CRS, CSV ingestion, reminder scheduler, and a mock AI provider for local development. Eval harness structure is complete but execution deferred until funding is available (target: Anthropic with ≥88% accuracy).
- [2026-04-19] Mock AI Provider established: strict deterministic outputs replacing live LLM calls.
- [2026-04-19] Clean AiProvider interface extracted. Live Anthropic integration wrapped as a blocked adapter.
- [2026-04-19] Queue Ingestion Service created to connect AI outputs (mock/live) to the Action Queue human-review workflow.
- [2026-04-19] Integration tests for Queue Pipeline: QueueIngestionService and ActionQueueService state machine (19 tests, all passing).
- [2026-04-19] Prompt files preserved under src/lib/ai/prompts/ (intent-classifier.v1.txt, promise-extractor.v1.txt, email-drafter.v1.txt).
- [2026-04-19] Action Queue UI built: queue list with filtering, detail panel with full context, approve/edit/skip actions, and audit log visibility.
- [2026-04-19] Authentication and Account Resolution implemented: hardcoded Acme account removed, dynamic session-based account resolution via memberships table.
- [2026-04-19] End-to-end workflow verification completed: traced full flow from auth → CSV import → queue creation → Action Queue UI. System is tenant-safe for single-account flow.
- [2026-04-19] CSV import now auto-generates Action Queue items per imported invoice (review-first), with queue generation audit events.
- [2026-04-19] Temporary single-membership rule enforced: users with multiple memberships receive a clear error until account switching is implemented.
- [2026-04-19] Minimal auth UI added: login page, logout action in AppShell, root session check routing, and session-expiry redirect to login.
- [2026-04-19] Scheduler/Reminder Engine implemented: stage-based overdue scanning (0/3/7/14 days), idempotent triggering into Action Queue, safety conflict guards (paid/promise/dispute), and scheduler audit events.
- [2026-04-18] Schema documentation, seed data, and audit logs implemented.
- [2026-04-18] Infra/env foundation set with Zod validation.

## Active Agents
- **Orchestrator:** Setting up foundation.
- **Agent B (Backend):** PENDING.
- **Agent E (Legal):** PENDING.
