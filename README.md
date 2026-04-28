# Payd.ai — The AI Collection Engine for Agencies

> AI-powered accounts receivable collection engine that stops agencies from bleeding cash on late payments. It auto-detects payment promises in emails, drafts human‑approved follow‑ups with Claude, and builds a reliability score for every client — so you know who pays before you even send the invoice.

![Next.js](https://img.shields.io/badge/Next.js-black?logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=white)
![Anthropic Claude](https://img.shields.io/badge/Anthropic_Claude-1A1A1A?logo=anthropic&logoColor=white)
![Stripe](https://img.shields.io/badge/Stripe-008CDD?logo=stripe&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-yellow)
![Status](https://img.shields.io/badge/Status-Beta-blue)

```text
CSV Ingestion → Watchdog Scheduler → Claude Drafting → Human Review (Shadow Mode) → OAuth Send → Reply Detection → CRS Scoring
```

---

## 🔴 The Problem This Solves

Agencies bleed cash on late payments because AR collection is manual, inconsistent, and awkward. Account managers waste hours writing "just checking in" emails that get ignored. There's no systematic way to track payment promises or measure client reliability over time. Traditional invoicing tools (QuickBooks, Xero, FreshBooks) don't do intelligent collections — they're just ledgers. 

**Who this is for:** agencies, SaaS companies with B2B invoicing, finance teams, freelancers managing multiple clients.

---

## 🚀 What This Actually Does

You upload a CSV of outstanding invoices. The Watchdog Scheduler analyzes due dates and payment history. For each overdue invoice, Claude (Anthropic Sonnet) drafts a context-aware follow-up email — not a generic template, but one that references the actual invoice, amount, and days overdue. 

This draft lands in the Action Queue, where a human reviews it (Shadow Mode — mandatory during onboarding, configurable after). With one click, the email sends via OAuth — it comes from the account manager's actual email, not a noreply address. 

When the client replies with "I'll pay next Tuesday," the Promise Tracker auto-extracts that date. The CRS engine updates the client's reliability score based on whether they kept their last promise. Over time, the system builds a Compounding Client Reliability Score that tells you who's trustworthy before you even send the next invoice.

---

## 🏛️ Core Pillars

| Pillar | What It Does | Why It Matters |
|--------|-------------|----------------|
| **Promise Tracker** | Auto-extracts payment dates from email replies using Claude | Stops you from manually digging through inboxes for "next Tuesday" |
| **CRS (Compounding Client Reliability Score)** | Builds a trust metric based on promise-to-payment behavior over time | Lets you flag risky clients before they owe you $50K |
| **Action Queue** | Human-in-the-loop email drafting and approval | AI drafts, human decides — no rogue emails ever sent |
| **Shadow Mode** | Mandatory manual approval during onboarding | Builds trust with operators; the AI earns autonomy, not demands it |

---

## 🛠️ Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Frontend** | Next.js (App Router) + TypeScript | SSR, type safety, modern React |
| **UI Design** | Bento Financial UI (dark fintech theme) | Professional, institutional feel |
| **Database** | Supabase (PostgreSQL) | Row-Level Security, multi-tenancy, real-time |
| **AI Engine** | Anthropic Claude (Sonnet) | Context-aware email drafting + reply classification |
| **Email Sending** | Resend + OAuth "Send-as-User" | Emails come from the account manager, not a bot |
| **Auth** | Supabase Auth + OAuth (Google/Microsoft) | Per-account identity, scoped access |
| **Payments** | Stripe | Starter, Growth, Agency Pro tiers |
| **Observability** | Sentry + PostHog | Error tracking + product analytics |
| **Scheduling** | Cron-based Watchdog | Stage calculation → Action Queue |

---

## ⚙️ Architecture

```text
┌──────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  CSV Upload  │────▶│  invoices table  │────▶│  Watchdog Cron  │
└──────────────┘     └──────────────────┘     └────────┬────────┘
                                                       ▼
                                              ┌─────────────────┐
                                              │  Stage Calc +   │
                                              │  Action Queue   │
                                              └────────┬────────┘
                                                       ▼
┌──────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  OAuth Send  │◀────│  Human Review    │◀────│  Claude Draft   │
│  (Resend)    │     │  (Shadow Mode)   │     │  (Sonnet)       │
└──────┬───────┘     └──────────────────┘     └─────────────────┘
       ▼
┌──────────────┐     ┌──────────────────┐
│  Reply       │────▶│  CRS Score       │
│  Detection   │     │  Update          │
└──────────────┘     └──────────────────┘
```

---

## ⚡ Getting Started

1. Clone the repo: `git clone https://github.com/Alchemist-PANDA/payd-ai.git`
2. Install dependencies: `npm install`
3. Set environment variables: copy `.env.example` → fill in Supabase, Anthropic, Resend, and OAuth keys
4. Run: `npm run dev`
5. Open `http://localhost:3000`

---

## 🗂️ Project Structure

```text
payd-ai/
├── app/                    # Next.js App Router
│   ├── (dashboard)/        # Main dashboard routes
│   ├── api/                # API routes (ingestion, scheduler, send)
│   ├── login/              # Auth pages
│   └── page.tsx            # Home / CSV upload
├── components/             # React components (Bento UI)
├── src/                    # Core logic
├── scripts/                # CLI tools (real-validation.js)
├── supabase/               # Database migrations + RLS policies
├── packages/shared/        # Shared TypeScript types
├── .env.example            # Environment template
├── SYSTEM_ARCHITECTURE.md  # Deep architecture docs
├── READY_TO_RUN.md         # Quick-start checklist
└── README.md
```

---

## 🏗️ Engineering Decisions Worth Noting

- **Why Supabase over Firebase?** — PostgreSQL with Row-Level Security gives true multi-tenancy. Every query scoped to `account_id`. No leak risk.
- **Why Anthropic Claude over GPT-4?** — Claude excels at nuanced email tone. Collection emails must be firm but polite. Claude's context window handles full invoice histories.
- **Why OAuth "Send-as-User"?** — Emails from a noreply address get ignored. Emails from the account manager's actual address get paid. Trust depends on sender identity.
- **Why Shadow Mode?** — In fintech, AI autonomy is earned. Shadow Mode builds operator trust with zero risk. The AI proves itself before it gets autonomy.
- **Why Bento Financial UI?** — Dark-themed, data-dense dashboards that look like Bloomberg Terminal. Signals "serious financial tool," not "side project."
- **Why CRS over simple aging reports?** — Aging reports show who's late NOW. CRS predicts who'll be late NEXT TIME. It's forward-looking, not backward.

---

## 🛡️ What Makes This Production-Ready

- Row-Level Security on ALL database tables (true multi-tenancy)
- Graceful AI degradation: system never fails due to missing API keys; deterministic fallback drafts
- Lighthouse-optimized (performance + accessibility passes)
- Full type safety (TypeScript, `npm run typecheck` passing)
- Stripe integration with three pricing tiers (Starter, Growth, Agency Pro)
- Sentry + PostHog instrumentation
- Controlled Beta Phase with operator runbook and guardrails
- Windows-compatible scripts

---

## 📈 Current Status

- Phase 4: Controlled Beta
- Golden Path Proven (real browser evidence)
- Review-First Mode Active
- See [PROGRESS.md](PROGRESS.md) for full activity log

---

## 🧠 What You'll Learn From This Codebase

- Next.js App Router with multi-tenant architecture
- Supabase RLS for database-level security
- AI email drafting with human-in-the-loop approval
- OAuth integration (Google + Microsoft)
- Stripe subscription management
- Production-grade observability (Sentry + PostHog)
- Fintech UI design patterns

---

<div align="center">
  <p>Built with 🧠 and TypeScript.</p>
  <p>Licensed under MIT.</p>
  <h3>⭐ If you find this project useful, please consider giving it a star! ⭐</h3>
  <p><a href="#">View Live Demo</a></p>
</div>
