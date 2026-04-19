PAYD.AI
Claude Code Execution Masterplan
Agents · Subagents · Skills · Hooks · 12-Week Build

Document Classification

01 · Product Context & Mission
Payd.ai is not another reminder tool. It is an AI-powered accounts receivable collection engine built specifically for agencies and service businesses. Its core innovations are:

Promise Tracker:
Client Reliability Score (CRS):
Intent Parser:
Action Queue:
Multi-Stage Reminder Engine:

02 · Claude Code Execution Architecture
Claude Code executes this build using a four-layer architecture. Each layer has a specific responsibility and clear handoff protocols.

Root Orchestrator Agent
The Orchestrator is the master agent. It reads MASTERPLAN.md, tracks phase completion, enforces quality gates, and delegates tasks to Division Agents. It never writes code directly — it reasons, delegates, and verifies.

03 · Division Agents (L2 — Persistent Agents)
Five specialist agents own their respective domains for the full 12-week build. Each agent has a dedicated SKILL.md file, a context window seeded with the relevant masterplan section, and clear output contracts.

Agent A · Frontend (UI/UX)

Owns: Next.js app, TailwindCSS, shadcn/ui components, Action Queue interface, CRS dashboard, Onboarding wizard, Settings screens
Must achieve: Time-to-value under 5 minutes (user sees first AI draft within 3 min of signup). Mobile-responsive. WCAG 2.1 AA compliant.
Output contract: components/ directory, pages/ directory, Storybook stories for all core components, visual regression snapshots

Agent B · Backend API

Owns: Next.js API routes / Express server, Supabase PostgreSQL schema, Row Level Security (RLS), invoice ingestion pipeline, multi-stage reminder scheduler (cron), multi-contact logic
Must achieve: All API routes behind auth. CSV import under 3 seconds for 500 invoices. Scheduler idempotent (safe to run twice). Full audit log on every invoice state change.
Critical constraint: Each customer account uses a dedicated sending subdomain. Never pool sending IP addresses. Hard rate limit: max 3 emails/day/invoice recipient per account.

Agent C · AI / ML Engine

Owns: Intent Parser (5-class classifier), Email Drafter (stage + CRS-aware tone), Promise Extractor, CRS calculator, confidence gating at 0.72 threshold, human escalation queue
Must achieve: Intent classifier ≥88% accuracy on labelled test set of 200+ real reply emails before any production use. Monthly accuracy audit against labelled set. "Report misclassification" feedback loop.
Critical constraint: NEVER auto-action a reply below 0.72 confidence. NEVER classify as Dispute or Promise without surfacing to owner for first 3 months of a customer account.

Agent D · Infrastructure & DevOps

Owns: Vercel deployment pipeline, Resend.com (or AWS SES) email infrastructure, dedicated subdomain provisioning per customer, bounce/complaint rate monitoring, Sentry error tracking, environment management
Must achieve: Auto-suspend any account exceeding 0.5% complaint rate. Real-time bounce monitoring per account. IMAP as primary reply-reading mechanism (Gmail API as upgrade path, not requirement). Apply for Gmail API production access on Day 1.

Agent E · GTM & Compliance

Owns: GDPR legal review brief, Xero App Marketplace application (submit Week 1), QuickBooks OAuth production application, ToS and privacy policy drafts, LinkedIn content calendar, beta user recruitment workflow
Week 1 mandate: GDPR legal review brief must be complete. Xero marketplace application submitted. Gmail API production access application submitted. First 3 beta user outreach sent.

04 · Subagents (L3 — Task Executors)
Subagents are single-purpose, short-lived agents spawned by Division Agents. They receive a precise task, execute it, write output to a file or API, and terminate. They do not persist context between runs.

05 · Skills (Reusable SKILL.md Files)
Skills are SKILL.md files that encode best practices, patterns, and constraints. Every Subagent reads its relevant Skills before writing a single line of code. Skills are the institutional memory of the project.

Skill File Structure (Template)
Every SKILL.md follows this structure so any Subagent can parse it without context:

06 · Hooks (Lifecycle Triggers)
Hooks are automated actions triggered by Claude Code lifecycle events. They enforce quality, prevent regressions, and provide real-time feedback without requiring manual intervention.

Pre-Commit Hooks

Pre-Deploy Hooks

Post-Deploy Hooks

07 · 12-Week Build Phases
The build is divided into four phases. Each phase has a Quality Gate that the Orchestrator must verify before authorising the next phase. No exceptions.

08 · Core Database Schema
Managed by: Agent B · Enforced by: HC-03 (schema validation hook)

09 · Technical Stack Decisions

10 · Pricing Architecture & Risk Register
Pricing Tiers
Critical rule: Do NOT implement a $49 tier. The Starter tier floor is $99/mo. Agent E owns Stripe configuration.

Critical Risk Register

11 · Orchestrator Quality Gate Checklist
The Orchestrator must verify every item below before marking each phase complete. Write results to PROGRESS.md.

Phase 1 Gate (End of Week 3)
LEGAL:
MARKETPLACE:
MARKETPLACE:
BETA:
SCHEMA:
INFRA:
HOOKS:

Phase 2 Gate (End of Week 7)
CLASSIFIER:
ONBOARDING:
ENGINE:
THREADING:
BETA:
HOOKS:

Phase 3 Gate (End of Week 10)
CRS:
ALERTS:
MONITORING:
HOOKS:
BUGS:
LEGAL:

Launch Gate (End of Week 12)
LEGAL:
CLASSIFIER:
BILLING:
BETA:
LANDING:
MONITORING:
MARKETPLACE:
ALL HOOKS:

12 · PROGRESS.md — Live Tracking Protocol
The Orchestrator maintains PROGRESS.md in the project root. Every agent writes completion events. Every hook writes pass/fail events. The Orchestrator reads this file at the start of every session to restore context.

13 · Anti-Patterns (Never Do)
These are the failure modes the masterplan explicitly identified. Claude Code agents must refuse tasks that violate these rules.

14 · Final Verdict & Launch Conditions

For Claude Code, this means: Execute in strict phase order. Never skip a gate. The biggest technical risk is the intent classifier — if it cannot reach 88% accuracy on real email data, block the launch and escalate to the founder. An 82% classifier is not a beta problem — it is a liability.

The 5 Conditions That Must Be True Before Launch
LEGAL:
ACCURACY:
BETA:
SAFETY:
ECONOMICS:

— END OF MASTERPLAN —
Payd.ai · Claude Code Execution Plan · v2.0 · 12-Week Build

Field | Value
Product | Payd.ai — AI-powered AR Collection SaaS
Audience | Claude Code — Automated Build Executor
Version | v2.0 — Pressure-Tested Masterplan
Timeline | 12 Weeks to Launch
Target ARR | $1,000,000 by Month 20
Primary ICP | Digital & Creative Agencies, 8–30 staff
Differentiator | Promise Tracker + Client Reliability Score (CRS)
Price Floor | $99/mo (Starter) · $249/mo (Growth) · $549/mo (Agency Pro)

⚡  HOW TO READ THIS DOCUMENT This is a machine-executable build plan for Claude Code. Every section maps directly to a Claude Code concept: Agents (orchestrators with long-running goals), Subagents (single-task specialists spawned by agents), Skills (reusable SKILL.md prompt files), and Hooks (pre/post lifecycle triggers). Follow the phase order. Do not skip gates.

🎯  COMMERCIAL TARGET Fewer than 400 customers at $249/mo average = $1M ARR. The economics are exceptional because switching cost compounds with every month of CRS data. Agency owners cannot export their client reliability history to a competitor.

Layer | Claude Code Concept | Payd.ai Role | Count
L1 — Orchestrator | Root Agent | Reads masterplan, assigns phases, enforces gates | 1
L2 — Division Agents | Persistent Agents | Own a domain (Frontend, Backend, AI, Infra, GTM) | 5
L3 — Task Executors | Subagents | Spawned per task, write code, run tests, terminate | 20+
L4 — Lifecycle Triggers | Hooks | Pre/post actions on file save, commit, deploy, test | 12

ORCHESTRATOR SYSTEM PROMPT (core directives) You are the Payd.ai build orchestrator. Your job is to execute the 12-week masterplan by delegating tasks to specialist agents, verifying gate conditions before advancing phases, and maintaining a live PROGRESS.md file. You escalate blockers immediately. You never skip a quality gate. You prioritise in this order: (1) Data integrity, (2) Email deliverability safety, (3) AI classifier accuracy, (4) Feature completeness.

🎨  Agent A — Frontend  —  Owns all React/Next.js UI surfaces Skills: frontend-design.md, component-library.md, tailwind-tokens.md Activates on: Any task tagged [UI], design review gates, Figma handoff events

⚙️  Agent B — Backend  —  Owns API layer, database, business logic Skills: nodejs-api.md, supabase-schema.md, auth-patterns.md, rls-policies.md Activates on: Any task tagged [API], schema migration events, integration approval events

🧠  Agent C — AI Engine  —  Owns all LLM calls, classifiers, CRS computation Skills: intent-classifier.md, email-drafter.md, crs-engine.md, confidence-gating.md Activates on: Any task tagged [AI], accuracy audit events, classifier test suite runs

⚠️  LAUNCH BLOCKER If the intent classifier cannot reach 88% accuracy on the labelled test set, Agent C must block the launch gate and report to the Orchestrator. An 82% classifier that misclassifies a legal dispute as a payment promise is a litigation risk.

🏗️  Agent D — Infrastructure  —  Owns deployment, email infrastructure, monitoring Skills: vercel-deploy.md, resend-email.md, supabase-prod.md, sentry-setup.md Activates on: Any task tagged [INFRA], deployment events, bounce rate alerts, complaint rate alerts

📣  Agent E — GTM & Compliance  —  Owns pre-launch legal, marketplace applications, content Skills: gdpr-checklist.md, xero-marketplace.md, qb-marketplace.md, content-calendar.md Activates on: Any task tagged [GTM] or [LEGAL], Week 1 kickoff, marketplace approval events

🔴  CRITICAL LEGAL GATE Agent E must complete GDPR data processing review BEFORE Agent C processes a single real email in production. Reading email replies of invoice recipients = processing 3rd-party personal data. Legal basis: legitimate interest under GDPR Article 6(1)(f). Must be documented. This is non-negotiable.

Subagent ID | Spawned By | Task | Output Contract
SA-01 · CSV Parser | Agent B | Parse uploaded CSV, validate columns, map to invoice schema | Validated invoice[] JSON, error report
SA-02 · Schema Migrator | Agent B | Generate and run Supabase migration SQL for schema changes | Migration file, rollback script
SA-03 · Sequence Scheduler | Agent B | Generate cron job logic for 6-stage reminder timing | Scheduler service with idempotency guards
SA-04 · Subdomain Provisioner | Agent D | Provision dedicated sending subdomain per new customer account | DNS records, DKIM/SPF config, Resend sender
SA-05 · Intent Classifier | Agent C | Classify a single reply email into 5 intent categories | Classification result + confidence score
SA-06 · Email Drafter | Agent C | Draft stage-appropriate email using CRS context | Email subject + body (HTML + plain text)
SA-07 · Promise Extractor | Agent C | Extract payment date promise from reply body | Promise date or null + extraction rationale
SA-08 · CRS Calculator | Agent C | Recompute Client Reliability Score from event log | Updated CRS 0–100, grade A–F, delta
SA-09 · Thread Matcher | Agent C | Match inbound reply to outbound invoice email thread | Invoice ID match or FLAG_HUMAN_REVIEW
SA-10 · Onboarding Wizard | Agent A | Build step-by-step onboarding flow with CSV upload + email preview | Onboarding React component, <3 min UX target
SA-11 · Action Queue UI | Agent A | Build daily driver Action Queue screen (Approve/Edit/Skip) | ActionQueue component, one-click Send All
SA-12 · CRS Dashboard | Agent A | Build client reliability dashboard with score visualisation | Dashboard page, client profile component
SA-13 · Complaint Monitor | Agent D | Monitor bounce/complaint rates per account in real time | Alert webhook, auto-suspend trigger at 0.5%
SA-14 · GDPR Auditor | Agent E | Generate GDPR data flow map and data processing record | DPA documentation, ToS clauses
SA-15 · Beta Recruiter | Agent E | Draft outreach for first 3 beta users (agency owners) | Outreach emails, tracking sheet
SA-16 · Xero OAuth | Agent B | Implement Xero OAuth flow and invoice sync (Week 10+) | Xero integration service, sync scheduler
SA-17 · Test Suite Runner | Agent C | Run intent classifier against 200-email labelled test set | Accuracy report, confusion matrix, gate pass/fail
SA-18 · Partial Payment Handler | Agent B | Handle partial payments: update outstanding balance, adjust sequence | Payment allocation logic, balance tracker
SA-19 · Broken Promise Alert | Agent C | Detect broken promises, generate escalation alert with CRS delta | Alert notification, recommended action
SA-20 · Analytics Tracker | Agent B | Track key SaaS metrics: activation rate, DSO, email open rates | Analytics event schema, Posthog integration

HOW SUBAGENTS ARE SPAWNED Division Agents use the Task tool to spawn Subagents: Task("SA-05 Intent Classifier", context). The Subagent receives: (1) the SKILL.md for its domain, (2) the relevant schema/types, (3) a precise acceptance criteria list. It writes output files and posts a completion report back to the spawning agent. The Orchestrator monitors completion events via PROGRESS.md.

Skill File | Owner | Contents | Used By
intent-classifier.md | Agent C | 5-class taxonomy, confidence gating rules, confidence threshold 0.72, human queue protocol, accuracy audit procedure | SA-05, SA-09, SA-17
email-drafter.md | Agent C | Stage tone matrix (1–6), CRS-aware tone adjustment rules, multi-contact escalation logic, anti-spam best practices | SA-06
crs-engine.md | Agent C | CRS formula (payment history 40% + promise history 40% + DSO trend 20%), grade bands, delta calculation, broken promise weight decay | SA-08, SA-19
confidence-gating.md | Agent C | 0.72 threshold enforcement, human queue schema, first-90-day override rules, misclassification feedback loop schema | SA-05, SA-07, SA-09
supabase-schema.md | Agent B | Full DB schema: accounts, invoices, contacts, email_events, reply_classifications, promises, crs_scores, audit_log. RLS policies. Index strategy. | SA-02, SA-03, SA-18, SA-16
email-infra.md | Agent D | Dedicated subdomain per account, DKIM/SPF setup, 3 email/day/recipient hard limit, complaint rate monitoring, auto-suspend at 0.5% | SA-04, SA-13
csv-invoice-schema.md | Agent B | Required columns, optional columns, validation rules, error messages, mapping to internal schema, partial payment fields | SA-01
thread-matching.md | Agent C | Multi-signal matching: Message-ID, In-Reply-To, fuzzy subject matching. Edge cases. Human review flag protocol. | SA-09
gdpr-data-flow.md | Agent E | Data controller vs processor roles, Article 6(1)(f) legitimate interest documentation, data categories, retention periods, deletion protocol | SA-14
onboarding-ux.md | Agent A | 5-minute time-to-value constraint, CSV upload flow, first AI draft preview within 3 minutes, 48-hour activation follow-up protocol | SA-10
xero-marketplace.md | Agent E | Application checklist, approval timeline (2–3 months), OAuth scopes required, Xero partner requirements, listing copy | SA-16, Agent E
testing-standards.md | All | Unit test coverage ≥80%, integration test per API route, E2E for critical paths (onboarding, send email, classify reply, CRS update) | All subagents

# [skill-name].md ## Purpose One sentence on what this skill governs. ## Rules (MUST follow) - Rule 1 (never violate) - Rule 2 ## Patterns (SHOULD follow) - Pattern 1 with code example ## Acceptance Criteria - [ ] Criterion 1 ## Anti-patterns (NEVER do) - Anti-pattern 1 with reason

Hook ID | Trigger | Action | Blocks Commit?
HC-01 · Type Check | Any .ts/.tsx file saved | Run tsc --noEmit. Report type errors inline. | YES
HC-02 · Lint | Any .ts/.tsx file saved | Run ESLint with Next.js config. Auto-fix safe rules. | YES
HC-03 · Schema Validate | Any Supabase migration file changed | Validate SQL syntax, check RLS policies present, verify index on foreign keys | YES
HC-04 · Env Guard | Before any commit | Verify no .env secrets committed. Check for hardcoded API keys in diff. | YES
HC-05 · Test Gate | Before any commit to main | Run unit tests. Block if coverage <80% on changed files. | YES

Hook ID | Trigger | Action | Blocks Deploy?
HD-01 · E2E Smoke Test | Vercel preview deploy | Run Playwright: onboarding flow, CSV upload, email preview, classify reply | YES
HD-02 · Classifier Accuracy Gate | Any change to AI engine | Run SA-17 test suite. Block if accuracy <88% on labelled set. | YES
HD-03 · GDPR Gate | First production deploy | Check GDPR_APPROVED flag in env. Block if not set (Agent E must sign off). | YES
HD-04 · Legal Gate | First production deploy | Check ToS and Privacy Policy published URLs exist and are reachable. | YES

Hook ID | Trigger | Action | Escalates?
HP-01 · Health Check | Every deploy | Ping /api/health, /api/auth/session, /api/invoices. Alert Orchestrator on failure. | YES
HP-02 · Complaint Monitor | Every 15 minutes (cron) | Check complaint rate per sending account. Auto-suspend if >0.5%. Alert Orchestrator. | YES
HP-03 · Accuracy Drift | Weekly (cron) | Re-run classifier on last 200 classified emails. Alert if accuracy drops below 88%. | YES

HOW HOOKS COMMUNICATE WITH AGENTS Hooks write structured JSON events to HOOK_EVENTS.log. The Orchestrator reads this log every cycle. Blocking hooks return exit code 1 which halts the current Claude Code task and surfaces the error. The Orchestrator must resolve the block before delegating further tasks in that domain.

PHASE 1 | Foundation & Legal (Weeks 1–3)  ·  Weeks 1–3 LEGAL GATE (Week 1, Day 1): Agent E completes GDPR data flow map. Legal review brief sent to solicitor. MARKETPLACE GATE (Week 1, Day 2): Xero App Marketplace application submitted. Gmail API production access applied for. BETA GATE (Week 1): First 3 beta user conversations completed. Workflow research documented. Agent B: Supabase schema v1 — accounts, invoices, contacts, email_events, promises, crs_scores, audit_log Agent B: Row Level Security policies on all tables. Every query scoped to account_id. Agent D: Development + staging Vercel environments live. Resend.com configured. Agent D: Dedicated subdomain provisioning tested end-to-end on staging. Agent A: Design tokens, component library foundation, Tailwind config. Agent C: Intent classifier prompt v1 — test against internal email samples. SA-02: Database migration infrastructure and rollback scripts. PHASE 1 GATE: Schema reviewed by Agent B + Orchestrator. GDPR brief submitted. Staging environment healthy.

PHASE 2 | Core Engine (Weeks 4–7)  ·  Weeks 4–7 Agent B + SA-01: CSV invoice upload — validate, parse, ingest. Error reporting with row-level detail. Agent B + SA-03: Multi-stage reminder scheduler (6 stages, deterministic timing, idempotency guards). Agent B + SA-18: Partial payment support — outstanding balance, adjusted sequence trigger. Agent C + SA-06: Email Drafter v1 — stage-aware, tone-escalating, personalized to invoice/contact. Agent C + SA-05: Intent Parser v1 — 5-class classification with 0.72 confidence gate. Agent C + SA-07: Promise Extractor — date extraction from reply body, NULL handling. Agent C + SA-09: Thread Matcher — Message-ID + In-Reply-To + fuzzy subject. Human review flag. Agent C + SA-08: CRS Calculator v1 — initial formula with payment history and promise history. Agent D + SA-04: Per-account subdomain provisioning in production flow. Agent A + SA-10: Onboarding wizard — CSV upload, first AI email preview, <3 min target. Agent A + SA-11: Action Queue — daily driver UI, Approve/Edit/Skip, Send All Approved. HC-01 through HC-05: All pre-commit hooks active on main branch. SA-17: First accuracy test run on labelled email set. Must reach 88% before Phase 3. PHASE 2 GATE: Full onboarding flow working end-to-end. Intent classifier at ≥88% on labelled set. 3 beta users using CSV upload on staging.

PHASE 3 | Intelligence Layer & Polish (Weeks 8–10)  ·  Weeks 8–10 Agent C + SA-19: Broken Promise Escalation Alert — detect, alert, CRS delta, recommended action. Agent C: CRS-aware email drafting — Stage 4+ emails read CRS first, adjust tone accordingly. Agent C: Promise Timeline (client view) — visual receipt of all promises made/kept/broken. Agent A + SA-12: CRS Dashboard — client list, scores, grade badges, DSO metrics, trend charts. Agent B + SA-20: Analytics — Posthog events for activation, email approval, reply classified, CRS updated. Agent A: Broken Promise Escalation UI — alert banner, one-click view client history. Agent B: Multi-contact per invoice — Primary, Finance, Escalation contacts. Auto-CC on Stage 4+. Agent D + SA-13: Complaint monitor live on production. Auto-suspend tested. HD-01 through HD-04: All pre-deploy hooks active. HP-01 through HP-03: All post-deploy hooks active. Beta user feedback sprint — 2 structured sessions with each beta user, bugs prioritised. PHASE 3 GATE: CRS compounding for all beta users. Promise Timeline rendering correctly. Complaint monitoring live. Zero P0/P1 bugs from beta feedback.

PHASE 4 | Launch Prep & Integrations (Weeks 11–12)  ·  Weeks 11–12 Agent B + SA-16: Xero OAuth integration (only if Xero approval received — do not block launch on this). Agent E: ToS and Privacy Policy final review. Published to live domain. Agent E: Stripe billing integration — Growth ($249) and Agency Pro ($549) plans. No $49 tier. Agent E: LinkedIn content series — 4 posts pre-scheduled for launch week. Agent E: Apollo.io outreach list — 500 agency owners, 3-email sequence, specific subject line. Agent A: Landing page — "Your clients owe you money. Payd.ai makes sure they pay it." Agent D: Production environment hardened — all secrets in Vercel env vars, Sentry live, alerting configured. HD-01 + HD-02 + HD-03 + HD-04: Full pre-deploy gate suite passing on production. Orchestrator: Final launch checklist verification — all 13 items in masterplan verdict actioned. LAUNCH GATE: Legal signed off. Classifier ≥88%. 3 paying beta converts. Zero P0 bugs. Complaint monitoring live. Xero application submitted (approval not required for launch).

Table | Purpose | Key Columns | RLS Rule
accounts | One row per paying customer | id, owner_email, plan, sending_subdomain, created_at | auth.uid() = owner_id
invoices | Invoice records | id, account_id, invoice_number, client_id, amount, outstanding_balance, status, current_stage, next_send_at | account_id = auth.uid()
contacts | Client contact records | id, account_id, client_id, email, role (primary/finance/escalation), name | account_id = auth.uid()
email_events | Every sent/received email | id, invoice_id, direction, stage, message_id, subject, body_html, sent_at, opened_at, replied_at | via invoice → account_id
reply_classifications | AI classifier output | id, email_event_id, intent (enum), confidence, raw_reply, human_reviewed, corrected_intent | via email_event → account_id
promises | Extracted payment promises | id, invoice_id, promised_date, extracted_at, kept (bool), broken_at, sequence_paused, sequence_resumed_at | via invoice → account_id
crs_scores | Client Reliability Score log | id, account_id, client_id, score (0–100), grade (A–F), payment_history_score, promise_history_score, dso_trend_score, computed_at | account_id = auth.uid()
audit_log | Immutable event log | id, account_id, invoice_id, event_type, actor, payload, created_at | account_id = auth.uid() (read only)

SCHEMA RULE: account_id IS SACRED Every table that contains customer data MUST have account_id as a foreign key to accounts. Every RLS policy MUST filter on account_id. Agent B must verify this in HC-03 before any migration is committed. A missing account_id filter is a critical data breach risk in a multi-tenant SaaS.

Layer | Technology | Rationale | Agent
Frontend | Next.js 14 (App Router) | SSR for fast initial load, file-based routing, API routes co-located | Agent A
Styling | TailwindCSS + shadcn/ui | Rapid component build, consistent design tokens, accessible by default | Agent A
Backend | Next.js API Routes (or Express) | Unified repo, TypeScript throughout, easy Vercel deployment | Agent B
Database | Supabase (PostgreSQL) | RLS built-in, real-time subscriptions for Action Queue, managed infra | Agent B
Auth | Supabase Auth (Magic Link + Google) | No password to manage, fast onboarding, account isolation via RLS | Agent B
AI / LLM | Anthropic Claude (claude-sonnet-4-5) | Intent classification, email drafting, promise extraction | Agent C
Email Sending | Resend.com | Dedicated domains, DKIM/SPF automation, complaint webhooks | Agent D
Email Reading | IMAP (primary), Gmail API (upgrade) | IMAP unblocks launch; Gmail API approval can take 6–10 weeks | Agent D
Scheduling | Vercel Cron or Supabase pg_cron | Reliable cron for multi-stage reminder timing, idempotent design | Agent B
Billing | Stripe | Subscription management, usage metering for Growth+ plans | Agent E
Monitoring | Sentry + Posthog | Error tracking (Sentry), product analytics and funnel (Posthog) | Agent D + B
Deployment | Vercel | Zero-config Next.js, preview deployments per PR, env var management | Agent D

Tier | Monthly Price | Limits | Target Customer
Starter | $99/mo | 3 active clients, 50 invoices/mo, CSV only, 1 user | Solo freelancer (secondary — watch for churn)
Growth ★ | $249/mo | 25 active clients, 500 invoices/mo, Xero/QB sync, 3 users, CRS dashboard | Digital agency 8–30 staff (PRIMARY ICP)
Agency Pro | $549/mo | Unlimited clients, unlimited invoices, 10 users, white-label reports, API access | Agency groups, accounting resellers

Risk | Level | Claude Code Mitigation
GDPR — Processing 3rd-party email data | CRITICAL | HD-03 blocks all production deploys until GDPR_APPROVED flag set. Agent E owns legal brief. No exceptions.
Email blacklisting — shared sending IP | CRITICAL | SA-04 provisions dedicated subdomain per account. SA-13 auto-suspends at 0.5% complaint rate. 3 email/day/recipient hard cap.
Intent classifier <88% accuracy | CRITICAL | HD-02 blocks deploy if accuracy gate fails. SA-17 runs full test suite on every AI engine change. Launch is blocked until gate passes.
Gmail API approval delay (6–10 weeks) | HIGH | Agent D builds IMAP as primary. Gmail API is upgrade path. Launch date is NOT dependent on Gmail approval.
Activation failure (users upload CSV, do nothing) | HIGH | SA-10 onboarding: first AI draft visible within 3 min. 48hr no-action triggers automated "stuck?" email. 7-day no-activate = manual outreach.
Thread matching failures | MEDIUM | SA-09 uses 3-signal matching. Any no-match → FLAG_HUMAN_REVIEW, not auto-action. Edge case common with non-technical clients.
Xero/QB native feature competition | MEDIUM | CRS is the moat. Move fast to 100 customers with 6+ months of data. Features can be copied; data cannot.

THE SINGLE MOST IMPORTANT RULE FOR CLAUDE CODE Never mark a quality gate as "passed" unless every item is explicitly verified and logged in PROGRESS.md. A gate is binary: PASS or BLOCK. There is no "mostly passing" state. The Orchestrator's primary value is gatekeeping — if it rubber-stamps gates, the entire architecture collapses.

# PROGRESS.md — Payd.ai Build Tracker ## Current Phase: [1 | 2 | 3 | 4] ## Phase Gate Status - [ ] Phase 1 Gate: PENDING - [ ] Phase 2 Gate: PENDING - [ ] Phase 3 Gate: PENDING - [ ] Launch Gate: PENDING  ## Active Agents - Agent A (Frontend): [current task] - Agent B (Backend): [current task] - Agent C (AI Engine): [current task] - Agent D (Infrastructure): [current task] - Agent E (GTM/Compliance): [current task]  ## Active Subagents - SA-05 (Intent Classifier): [status]  ## Hook Events (last 10) - 2024-01-15T09:22Z HC-02 PASS — lint clean on pages/dashboard.tsx - 2024-01-15T09:20Z HC-01 FAIL — type error in lib/crs.ts:42 — BLOCKED  ## Blockers - [date] [description] [owner] [ETA]  ## Completed Tasks - [date] SA-02: Schema migration v1 complete. Reviewed by Agent B.

Anti-Pattern | Why It Kills the Product | Enforced By
Auto-action a reply below 0.72 confidence | Misclassifying a legal dispute as a payment promise → litigation risk. An angry client who already called a lawyer receives another chase email. | HC-02 (confidence gate in code review), Skill: confidence-gating.md
Pool sending IP addresses across accounts | One aggressive customer damages deliverability for all accounts. Sender reputation is shared = your best customer gets blacklisted. | SA-04 (per-account subdomain), SA-13 (complaint monitor)
Launch without GDPR sign-off | Processing 3rd-party email data (invoice recipients) without documented legal basis = GDPR violation from first email. Regulatory risk on Day 1. | HD-03 (deploy blocked without GDPR_APPROVED flag)
Implement a $49 pricing tier | Fills customer base with high-churn freelancers. Signals low quality to agency buyers. Support burden identical to Growth customers. Destroys unit economics. | Agent E (Stripe config), Orchestrator review
Build Xero integration before CSV is solid | API approval takes 2–3 months. If the integration fails, you have no product. CSV proves the core value loop independently. | Phase 2 gate: CSV must be complete before integration work begins
Skip the 200-email accuracy test | Shipping a classifier without validation against real reply emails is gambling with customer relationships. You do not know what you do not know. | HD-02 (deploy blocked if SA-17 accuracy <88%)
Make launch date dependent on Gmail API approval | Gmail API production review takes 6–10 weeks with no guarantee. Your launch becomes a hostage to a third-party approval queue. | Agent D (IMAP as primary from Day 1)
8-week timeline | Gmail API + Xero OAuth + classifier validation + beta user feedback cycles cannot physically complete in 8 weeks. The 12-week plan is already tight. | Orchestrator enforces 12-week gate schedule

COMMERCIAL ASSESSMENT The core idea is commercially sound. The pain is real. The market is large. Chaser is bloated, Upflow is enterprise-tilted, Xero native is dumb. There is a genuine gap for a sharp, intelligence-first AR tool for agencies. A narrow, opinionated product with a compounding CRS data moat, priced at $249 for a buyer who recovers $40,000/month by using it. High-margin, low-churn SaaS. $1M ARR with fewer than 400 customers. Exceptional unit economics.

THE UPSIDE A client reliability dataset that compounds with every invoice. After 12 months with 100+ customers, Payd.ai has the most accurate per-agency client risk database in the UK/ANZ market. That dataset is not just defensible — it is the product. Build it right, charge appropriately, and the economics are exceptional.
