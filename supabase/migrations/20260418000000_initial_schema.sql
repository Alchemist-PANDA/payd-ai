-- HARDENED INITIAL SCHEMA v1
-- Multi-tenancy via account_id (Sacred)

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ACCOUNTS (The Tenant)
CREATE TABLE accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. MEMBERSHIPS (App-level User mapping to Accounts)
-- Links Supabase auth.users to our accounts
CREATE TABLE memberships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL, -- References auth.users(id)
    email TEXT NOT NULL,
    full_name TEXT,
    role TEXT DEFAULT 'member', -- admin, member, observer
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(account_id, user_id)
);
CREATE INDEX idx_memberships_user_id ON memberships(user_id);
CREATE INDEX idx_memberships_account_id ON memberships(account_id);

-- 4. CONTACTS (Customers/Debtors)
CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    external_id TEXT,
    email TEXT,
    name TEXT NOT NULL,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_contacts_account_id ON contacts(account_id);

-- 5. INVOICES
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    invoice_number TEXT NOT NULL,
    amount_cents BIGINT NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    status TEXT NOT NULL DEFAULT 'pending', -- pending, partial, paid, overdue, void
    due_date DATE NOT NULL,
    issued_date DATE NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(account_id, invoice_number)
);
CREATE INDEX idx_invoices_account_id ON invoices(account_id);
CREATE INDEX idx_invoices_status ON invoices(status);

-- 6. INVOICE CONTACT LINKS (Multi-contact support)
CREATE TABLE invoice_contact_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    contact_type TEXT NOT NULL DEFAULT 'primary', -- primary, finance, escalation, cc
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(invoice_id, contact_id)
);
CREATE INDEX idx_icl_invoice_id ON invoice_contact_links(invoice_id);

-- 7. INVOICE PAYMENTS (Ledger Model)
CREATE TABLE invoice_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    amount_cents BIGINT NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    payment_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    payment_method TEXT, -- bank_transfer, check, card, credit_note
    external_reference TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_payments_invoice_id ON invoice_payments(invoice_id);
CREATE INDEX idx_payments_account_id ON invoice_payments(account_id);

-- 8. PROMISES
CREATE TABLE promises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    promised_date DATE NOT NULL,
    amount_cents BIGINT,
    status TEXT DEFAULT 'active', -- active, fulfilled, broken, cancelled
    source_email_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_promises_invoice_id ON promises(invoice_id);

-- 9. CRS SCORES
CREATE TABLE crs_scores (
    contact_id UUID PRIMARY KEY REFERENCES contacts(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    score INTEGER DEFAULT 75,
    last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- 10. ACTION QUEUE (Workflow Engine)
CREATE TABLE action_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    action_type TEXT NOT NULL, -- email_draft, sms_draft, manual_call
    priority TEXT DEFAULT 'medium',
    status TEXT DEFAULT 'pending', -- pending, approved, sent, failed, dismissed
    payload JSONB NOT NULL,
    scheduled_for TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. EMAIL EVENTS (Threading & History)
CREATE TABLE email_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
    message_id TEXT UNIQUE,
    thread_id TEXT,
    in_reply_to TEXT,
    direction TEXT NOT NULL, -- inbound, outbound
    subject TEXT,
    body_text TEXT,
    body_html TEXT,
    delivery_status TEXT DEFAULT 'draft', -- draft, pending, sent, delivered, opened, replied
    sent_at TIMESTAMPTZ,
    received_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_emails_thread_id ON email_events(thread_id);

-- 12. AUDIT LOG
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    actor_id UUID, -- References memberships.id or system
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. RLS ENABLEMENT
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_contact_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE promises ENABLE ROW LEVEL SECURITY;
ALTER TABLE crs_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- 14. RLS POLICIES (Development Draft)
-- Note: Scalable JWT custom claims model should replace these subqueries before Production.

CREATE POLICY "Tenant access: accounts" ON accounts FOR ALL USING (id IN (SELECT account_id FROM memberships WHERE memberships.user_id = auth.uid()));
CREATE POLICY "Tenant access: memberships" ON memberships FOR ALL USING (account_id IN (SELECT account_id FROM memberships WHERE memberships.user_id = auth.uid()));
CREATE POLICY "Tenant access: contacts" ON contacts FOR ALL USING (account_id IN (SELECT account_id FROM memberships WHERE memberships.user_id = auth.uid()));
CREATE POLICY "Tenant access: invoices" ON invoices FOR ALL USING (account_id IN (SELECT account_id FROM memberships WHERE memberships.user_id = auth.uid()));
CREATE POLICY "Tenant access: icl" ON invoice_contact_links FOR ALL USING (account_id IN (SELECT account_id FROM memberships WHERE memberships.user_id = auth.uid()));
CREATE POLICY "Tenant access: payments" ON invoice_payments FOR ALL USING (account_id IN (SELECT account_id FROM memberships WHERE memberships.user_id = auth.uid()));
CREATE POLICY "Tenant access: promises" ON promises FOR ALL USING (account_id IN (SELECT account_id FROM memberships WHERE memberships.user_id = auth.uid()));
CREATE POLICY "Tenant access: crs" ON crs_scores FOR ALL USING (account_id IN (SELECT account_id FROM memberships WHERE memberships.user_id = auth.uid()));
CREATE POLICY "Tenant access: queue" ON action_queue FOR ALL USING (account_id IN (SELECT account_id FROM memberships WHERE memberships.user_id = auth.uid()));
CREATE POLICY "Tenant access: emails" ON email_events FOR ALL USING (account_id IN (SELECT account_id FROM memberships WHERE memberships.user_id = auth.uid()));
CREATE POLICY "Tenant access: audit" ON audit_log FOR ALL USING (account_id IN (SELECT account_id FROM memberships WHERE memberships.user_id = auth.uid()));
