# SYSTEM_ARCHITECTURE.md

## High Level Data Flow
1. **Ingestion:** CSV Upload -> `invoices` table.
2. **Watchdog:** Cron -> Stage Calculation -> `Action Queue`.
3. **Drafting:** Claude (Sonnet) -> `email_events` draft.
4. **Human Review:** Action Queue -> Approve -> OAuth Send.
5. **Detection:** IMAP/OAuth -> `reply_classifications`.
6. **Scoring:** Interaction Event -> `crs_scores` update.

## Identity & Multi-Tenancy
- Primary Key: `account_id` (Sacred).
- RLS enforced on all tables.
- OAuth connections scoped per-account.
