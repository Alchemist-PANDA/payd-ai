import { z } from 'zod';

export type UUID = string;

/**
 * 1. DATABASE TYPES (Reflects supabase/migrations/...)
 */
export interface Account {
  id: UUID;
  name: string;
  created_at: string;
}

export interface Membership {
  id: UUID;
  account_id: UUID;
  user_id: UUID;
  email: string;
  full_name: string | null;
  role: 'admin' | 'member' | 'observer';
}

export interface Invoice {
  id: UUID;
  account_id: UUID;
  invoice_number: string;
  amount_cents: number;
  currency: string;
  status: 'pending' | 'partial' | 'paid' | 'overdue' | 'void';
  due_date: string;
  issued_date: string;
}

export interface InvoicePayment {
  id: UUID;
  account_id: UUID;
  invoice_id: UUID;
  amount_cents: number;
  currency: string;
  payment_date: string;
  payment_method: string | null;
  external_reference: string | null;
}

/**
 * 2. DOMAIN TYPES (Derived/Composite)
 */
export interface InvoiceDetail extends Invoice {
  outstanding_balance_cents: number;
  payments: InvoicePayment[];
  contacts: Contact[];
}

export interface Contact {
  id: UUID;
  account_id: UUID;
  name: string;
  email: string | null;
  phone: string | null;
}

/**
 * 3. ACTION QUEUE & WORKFLOW (Phase 3 Hardened)
 */
export type ActionQueueStatus =
  | 'pending_review'
  | 'approved'
  | 'edited'
  | 'skipped'
  | 'sent'
  | 'failed'
  | 'archived';

export type ActionType = 'email_draft' | 'promise_confirmation' | 'dispute_review' | 'classify_reply' | 'send_email';

export interface ActionQueue {
  id: UUID;
  account_id: UUID;
  invoice_id: UUID | null;
  contact_id: UUID | null;
  action_type: ActionType;
  status: ActionQueueStatus;
  priority: 'low' | 'medium' | 'high' | 'urgent' | number;
  confidence: number;
  ai_confidence?: number;
  payload: {
    subject?: string;
    body_text?: string;
    extracted_date?: string;
    rationale?: string;
    [key: string]: any;
  };
  requires_human_review: boolean;
  scheduled_for: string | null;
  created_at: string;
  updated_at: string;
}

export interface ActionQueueItem extends ActionQueue {
  invoice?: Invoice;
  contact?: Contact;
}

/**
 * 4. VALIDATION SCHEMAS (Zod)
 */
export const InvoiceImportSchema = z.object({
  invoice_number: z.string().min(1),
  contact_name: z.string().min(1),
  contact_email: z.string().email().optional().or(z.literal('')),
  amount: z.number().positive(),
  currency: z.string().length(3).default('USD'),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  issued_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export type InvoiceImport = z.infer<typeof InvoiceImportSchema>;

/**
 * 5. INTELLIGENCE CONTRACTS (Phase 3)
 */

export interface PromiseExtraction {
  promised_date: string | null; // ISO YYYY-MM-DD
  amount_cents: number | null;
  confidence: number; // 0.0 - 1.0
  rationale: string;
  requires_human_review: boolean;
}

export interface ReplyClassification {
  category: 'explicit_promise' | 'weak_payment_signal' | 'paid_claim' | 'dispute' | 'out_of_office' | 'other';
  confidence: number;
  requires_human_review: boolean;
  extracted_data?: Record<string, any>;
  error?: string; // Optional field for infrastructure/API failures
}

export interface EmailDraft {
  subject: string;
  body_text: string;
  body_html?: string;
  confidence: number;
  rationale: string;
}

export interface AiReviewMetadata {
  model: string;
  prompt_version: string;
  latency_ms: number;
}
