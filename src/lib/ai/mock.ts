import { AiProvider } from './types';
import { ReplyClassification, PromiseExtraction, EmailDraft, Invoice, Contact } from '../../../packages/shared/src/types/contracts';

export class MockAiProvider implements AiProvider {
  async classifyReply(emailBody: string): Promise<ReplyClassification> {
    console.log('[AI Mock] Classifying reply...');
    const lowerBody = emailBody.toLowerCase();

    // Deterministic routing based on keywords
    if (lowerBody.includes('dispute') || lowerBody.includes('wrong') || lowerBody.includes('not paying')) {
      return {
        category: 'dispute',
        confidence: 0.95,
        requires_human_review: true,
      };
    }

    if (lowerBody.includes('already paid') || lowerBody.includes('sent yesterday')) {
      return {
        category: 'paid_claim',
        confidence: 0.92,
        requires_human_review: true, // Phase 4 Blocked: Review-first policy enforced
      };
    }

    if (lowerBody.includes('will pay on') || lowerBody.includes('next friday')) {
      return {
        category: 'explicit_promise',
        confidence: 0.88,
        requires_human_review: true, // Phase 4 Blocked: Review-first policy enforced
      };
    }

    if (lowerBody.includes('processing') || lowerBody.includes('will try')) {
      return {
        category: 'weak_payment_signal',
        confidence: 0.85,
        requires_human_review: true,
      };
    }

    if (lowerBody.includes('out of office')) {
      return {
        category: 'out_of_office',
        confidence: 0.99,
        requires_human_review: false,
      };
    }

    return {
      category: 'other',
      confidence: 0.5,
      requires_human_review: true,
    };
  }

  async extractPromise(emailBody: string, referenceDate: string): Promise<PromiseExtraction> {
    console.log(`[AI Mock] Extracting promise... Ref Date: ${referenceDate}`);
    const lowerBody = emailBody.toLowerCase();

    if (lowerBody.includes('will pay on') || lowerBody.includes('next friday')) {
      return {
        promised_date: '2026-04-24', // Static mock date
        amount_cents: 50000, // Static mock amount
        confidence: 0.9,
        rationale: 'Extracted explicit date and amount from text.',
        requires_human_review: true, // Phase 4 Blocked: Review-first policy enforced
      };
    }

    return {
      promised_date: null,
      amount_cents: null,
      confidence: 0.4,
      rationale: 'No clear commitment found.',
      requires_human_review: true,
    };
  }

  async generateDraft(invoice: Invoice, contact: Contact, context: string): Promise<EmailDraft> {
    console.log(`[AI Mock] Generating draft for Invoice: ${invoice.invoice_number}`);

    return {
      subject: `Follow-up on Invoice ${invoice.invoice_number}`,
      body_text: `Hi ${contact.name},\n\nJust following up on Invoice ${invoice.invoice_number} for ${(invoice.amount_cents / 100).toFixed(2)} ${invoice.currency}.\n\nContext: ${context}\n\nPlease let us know when we can expect payment.\n\nBest,\nPayd AI`,
      confidence: 0.95,
      rationale: 'Generated standard professional reminder template.',
    };
  }
}
