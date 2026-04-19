-- SEED DATA v2 (Hardened)
-- 1 Account, 2 Memberships, 3 Contacts, 5 Invoices, 1 Partial Payment, 2 Contacts on 1 Invoice, 2 Email Events

-- 1. Create account
INSERT INTO accounts (id, name)
VALUES ('00000000-0000-0000-0000-000000000001', 'Acme Corp');

-- 2. Create memberships (mapping auth.users to Acme Corp)
INSERT INTO memberships (id, account_id, user_id, email, full_name, role)
VALUES
    ('00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-00000000000a', 'admin@acme.com', 'Acme Admin', 'admin'),
    ('00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-00000000000b', 'member@acme.com', 'Acme Member', 'member');

-- 3. Create contacts
INSERT INTO contacts (id, account_id, name, email)
VALUES
    ('00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000001', 'Globex Corp', 'billing@globex.com'),
    ('00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000001', 'Soylent Corp', 'ap@soylent.com'),
    ('00000000-0000-0000-0000-000000000203', '00000000-0000-0000-0000-000000000001', 'Initech', 'finance@initech.com'),
    ('00000000-0000-0000-0000-000000000204', '00000000-0000-0000-0000-000000000001', 'Peter Gibbons', 'peter@initech.com'); -- Second contact for Initech

-- 4. Create Invoices
INSERT INTO invoices (id, account_id, invoice_number, amount_cents, currency, status, due_date, issued_date)
VALUES
    ('00000000-0000-0000-0000-000000000301', '00000000-0000-0000-0000-000000000001', 'INV-001', 500000, 'USD', 'overdue', '2026-03-01', '2026-02-01'),
    ('00000000-0000-0000-0000-000000000302', '00000000-0000-0000-0000-000000000001', 'INV-002', 250000, 'USD', 'pending', '2026-05-01', '2026-04-01'),
    ('00000000-0000-0000-0000-000000000303', '00000000-0000-0000-0000-000000000001', 'INV-003', 1000000, 'USD', 'partial', '2026-04-20', '2026-03-20');

-- 5. Link contacts to invoices (Multi-contact Initech)
INSERT INTO invoice_contact_links (account_id, invoice_id, contact_id, contact_type)
VALUES
    ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000301', '00000000-0000-0000-0000-000000000201', 'primary'),
    ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000303', '00000000-0000-0000-0000-000000000203', 'primary'),
    ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000303', '00000000-0000-0000-0000-000000000204', 'escalation');

-- 6. Create Partial Payment (Soylent INV-003)
INSERT INTO invoice_payments (account_id, invoice_id, amount_cents, currency, payment_date, payment_method)
VALUES
    ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000303', 400000, 'USD', '2026-04-10', 'bank_transfer');

-- 7. Email Events (Threading support)
INSERT INTO email_events (id, account_id, contact_id, message_id, thread_id, direction, subject, delivery_status, sent_at)
VALUES
    ('00000000-0000-0000-0000-000000000501', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000201', 'msg_001', 'thread_001', 'outbound', 'Invoice Reminder: INV-001', 'sent', '2026-04-15 09:00:00Z');

INSERT INTO email_events (id, account_id, contact_id, message_id, thread_id, in_reply_to, direction, subject, body_text, delivery_status, received_at)
VALUES
    ('00000000-0000-0000-0000-000000000502', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000201', 'msg_002', 'thread_001', 'msg_001', 'inbound', 'Re: Invoice Reminder: INV-001', 'I will pay this next Friday.', 'replied', '2026-04-16 14:30:00Z');

-- 8. CRS Record
INSERT INTO crs_scores (contact_id, account_id, score)
VALUES ('00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000001', 60);
