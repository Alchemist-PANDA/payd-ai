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

    // Regex for date extraction (e.g., "by 20th", "next Friday", "May 1st")
    // Simplified regex for the mock - in reality this would be more complex
    const dateMatch = emailBody.match(/(?:by|on|before)\s+(\d{1,2}(?:st|nd|rd|th)?|next\s+\w+|[A-Z][a-z]+\s+\d{1,2})/i);
    const amountMatch = emailBody.match(/\$?\d+(?:,\d{3})*(?:\.\d{2})?/);

    if (lowerBody.includes('will pay') || lowerBody.includes('promise') || lowerBody.includes('commitment')) {
      const extractedDate = dateMatch ? `2026-05-${dateMatch[1].replace(/\D/g, '').padStart(2, '0')}` : '2026-05-15';
      const extractedAmount = amountMatch ? parseFloat(amountMatch[0].replace(/[^0-9.]/g, '')) * 100 : 50000;

      return {
        promised_date: extractedDate,
        amount_cents: extractedAmount,
        confidence: 0.9,
        rationale: `Detected payment intent with date context: ${dateMatch?.[0] || 'unknown'}`,
        requires_human_review: true,
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
