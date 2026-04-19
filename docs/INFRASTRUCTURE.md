# Infrastructure & Environment Configuration

## Provider Stack
- **Database/Auth:** Supabase (PostgreSQL + RLS)
- **AI/NLP:** Anthropic (Claude 3.5 Sonnet)
- **Email Delivery:** Resend
- **Error Tracking:** Sentry (Placeholder)
- **Analytics:** PostHog (Placeholder)
- **Hosting:** Vercel

## Setup Checklist
1. Create Supabase project.
2. Apply migration `supabase/migrations/20260418000000_initial_schema.sql`.
3. (Optional) Run `supabase/seed.sql` for dev data.
4. Configure OAuth in Supabase (Google/Microsoft).
5. Add environment variables to Vercel/Local.

## Environment Variables (.env)
Refer to `.env.example` for the required keys.

- `NEXT_PUBLIC_SUPABASE_URL`: Supabase Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Client-side key for RLS
- `SUPABASE_SERVICE_ROLE_KEY`: Server-side bypass for system tasks
- `ANTHROPIC_API_KEY`: For Claude extraction/drafting
- `RESEND_API_KEY`: For outbound email events
- `SENTRY_DSN`: (Future) Error reporting
- `POSTHOG_KEY`: (Future) Product analytics
