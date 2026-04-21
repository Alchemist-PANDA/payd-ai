# PROGRESS.md — Live Build Tracker

## Current Status
**Phase:** 4 (First Real Users - Controlled Beta)
**Gate Status:** READY (Behaviorally Verified - Phase 4 Logic Blocked)
**Review-First Mode:** ACTIVE (AI Autonomy strictly disabled)

## Activity Log
- [2026-04-18] Project initialized and structure scaffolded.
- [2026-04-19] Direction Shift: Suspended live AI model evaluation due to lack of paid API access. Phase 4 strictly blocked.
- [2026-04-19] Mock AI Provider and AiProvider interface established.
- [2026-04-19] Queue Ingestion Service and human-review workflow integration.
- [2026-04-19] Action Queue UI built with user-friendly terminology ("Needs Review", "Already Processed").
- [2026-04-19] Auth and Account Resolution: Dynamic session-based resolution via memberships table.
- [2026-04-19] Scheduler Hardening: Broken promise handling, payload-aware dispute detection, and consistency audits.
- [2026-04-19] Dataset Validation: Scalability tested up to 1000 rows.
- [2026-04-19] Graceful AI Degradation: System hardened to never fail due to missing AI keys; deterministic fallback drafts implemented.
- [2026-04-19] Schema Hardening: Enforced mandatory presence of `ai_confidence` and `requires_human_review` columns.
- [2026-04-19] Manual Send Workflow: Explicit "Send Email Now" path implemented for approved queue items; "sent" status correctly tracked with manual method audit.
- [2026-04-19] Pre-Launch UX Clarity: Improved empty states, next-step guidance, and review-first mode communication across the UI.
- [2026-04-19] Golden Path Rehearsal: PASS (Scheduler CLI execution verified).
- [2026-04-19] Controlled Beta Plan: Checklist, operator guide, and failure conditions established in `docs/CONTROLLED_BETA_PLAN.md`.
- [2026-04-19] Observation Framework: `docs/FIRST_USER_FEEDBACK.md` established.
- [2026-04-19] UX Hardening: Fixed login hang, auth guard redirect loop, and CSV selection state persistence.
- [2026-04-20] Structural Readiness: Passed full `npm run typecheck` and verified code-flow for CSV selection visibility.
- [2026-04-20] Browser Behavioral Verification: PASS.
    - Verified: Filename appears immediately upon selection and persists during commit.
    - Verified: Preview panel stays mounted during DB transition.
    - Verified: Action Queue correctly generates new items (INV-4001, 4002, 4003) following successful import.
    - Verified: Same-file reselection works after validation failure without page refresh.
- [2026-04-20] Action Queue Workflow Fix: Resolved data binding mismatch where Subject and Body fields were not prefilling from AI drafts.
- [2026-04-20] Controlled Beta Verification: GOLDEN PATH PROVEN. Real browser evidence confirms selection, preview, commit, and refresh are operational.
- [2026-04-20] Action Queue UX Hardening (Phase 2): Implementing interaction feedback (loading states, success banners, timeline polish).
- [2026-04-20] Action Queue UX Phase 2: COMPLETE. Verified loading states, feedback banners, and timeline polish.
- [2026-04-20] Controlled Beta Operations Pack: COMPLETE. Operator runbook, guardrails, and triage checklist established.
- [2026-04-20] Instrumentation & Evidence Capture: COMPLETE. Session-level tracking implemented and integrated with operator docs.

## Active Tasks
1. [completed] Controlled beta checklist (scope & limitations).
2. [completed] Beta ops readiness (operator guide & known issues).
3. [completed] Early-user feedback capture (success metrics).
4. [completed] First Real User Observation (Golden path verified in browser session).
5. [completed] Action Queue UX Phase 2 Polish (Interaction feedback).
6. [completed] Controlled Beta Operations Pack (Runbook, Guardrails, Triage).
7. [completed] Beta Session Instrumentation & Evidence Capture.

## Gating Status
- CLASSIFIER: BLOCKED (AI/Model Evaluation Gate - Needs funding for Anthropic ≥88% accuracy)
- ONBOARDING: PASS (Auth path validation confirmed)
- ENGINE: PASS (Hardened with safety guards)
- UX CLARITY: PASS (Terminology and guidance pass complete)
- PRE-LAUNCH REHEARSAL: PASS (CLI & Browser Golden Paths verified)
- BETA READINESS: READY (Controlled beta flow verified and operationally ready)
- [2026-04-21] Phase 3: Built CRS Dashboard (SA-12) with mock data and basic UI components.
- [2026-04-21] Phase 3: Built Broken Promise Escalation Alert UI (SA-19) with detection, CRS delta display, and recommended actions.
- [2026-04-21] Phase 3: Built Promise Timeline UI with per-client visual history of promises kept/broken.
- [2026-04-21] Phase 3: Wired multi-contact auto-CC in scheduler — Stage 4+ (14 days overdue) now auto-CCs escalation contacts.
- [2026-04-21] Phase 3: Built Complaint Monitor service (SA-13) with auto-suspend at 0.5% complaint rate.
- [2026-04-21] Phase 3: Added PostHog analytics (SA-20) — activation, approval, CRS events tracked.
- [2026-04-21] Phase 3: Wired PostHog events into CsvIngestionService, ActionQueueService, and CRSCalculatorService.
- [2026-04-21] Phase 4: Configured Stripe billing service for Growth and Agency Pro tiers. No $49 tier.
- [2026-04-21] Phase 4: Built landing page emphasizing "Your clients owe you money. Payd.ai makes sure they pay it."
- [2026-04-21] Phase 4: Finalized and published Terms of Service and Privacy Policy URLs.
- [2026-04-21] CRITICAL FIX: Complaint Monitor now has cron trigger (every 15 min) and send guard in EmailSenderService.
- [2026-04-21] CRITICAL FIX: Stripe webhooks implemented for checkout.session.completed, invoice.payment_failed, customer.subscription.deleted.
- [2026-04-21] CRITICAL FIX: PostHog events wired into CsvIngestionService, ActionQueueService, and CRSCalculatorService.
- [2026-04-21] Phase 4: Gemma 4 31B interim adapter built but explicitly DISABLED for Cohort A. Cohort A mandates deterministic mode.
- [2026-04-21] Phase 4: Built COHORT_A_OBSERVATION_GUIDE.md to run the first real user test.
- [2026-04-21] CRITICAL FIX: CRS Dashboard now uses real DB queries from crs_scores, contacts, invoices, and promises tables.
- [2026-04-21] CRITICAL FIX: Broken Promise Detection implemented with daily cron (9am), real payment check, and action_queue alert creation.
