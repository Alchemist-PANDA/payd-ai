import { supabase } from '../../lib/supabase/client';
import { ReplyClassifierService } from '../../lib/ai/ReplyClassifier';
import { DraftGeneratorService } from '../../lib/ai/DraftGenerator';
import {
  type UUID,
  type Invoice,
  type Contact
} from '../../../packages/shared/src/types/contracts';
import { InvoicesService } from '../invoices/InvoicesService';

/**
 * QUEUE INGESTION SERVICE
 * Connects AI outputs (classifications, drafts) to the Action Queue.
 * All AI decisions flow through human review before execution.
 */

export class QueueIngestionService {
  /**
   * Classify an inbound reply and create a queue item for review.
   */
  static async classifyAndQueue(
    accountId: UUID,
    invoiceId: UUID,
    emailBody: string,
    emailMetadata: Record<string, any>
  ) {
    const classification = await ReplyClassifierService.classify(emailBody);

    // Insert into action_queue for human review
    const { data, error } = await supabase
      .from('action_queue')
      .insert({
        account_id: accountId,
        invoice_id: invoiceId,
        action_type: 'classify_reply',
        status: 'pending_review',
        priority: classification.category === 'dispute' ? 10 : 5,
        payload: {
          classification,
          email_body: emailBody,
          email_metadata: emailMetadata
        },
        ai_confidence: classification.confidence,
        requires_human_review: classification.requires_human_review
      })
      .select()
      .single();

    if (error) {
      if (error.message.includes('ai_confidence') || error.message.includes('requires_human_review')) {
        throw new Error('Database schema is outdated. Apply migrations (20260419114500_harden_action_queue.sql).');
      }
      throw error;
    }

    if (error) throw error;

    await InvoicesService.createAuditLog(
      accountId,
      'queue_item.created',
      'action_queue',
      data.id,
      { action_type: 'classify_reply', category: classification.category }
    );

    return data;
  }

  /**
   * Generate a draft email and create a queue item for review/editing.
   * IMPLEMENTS GRACEFUL DEGRADATION: Never fails due to missing AI keys.
   */
  static async generateDraftAndQueue(
    accountId: UUID,
    invoice: Invoice,
    contact: Contact,
    context: string
  ) {
    let draft;
    let fallbackUsed = false;

    try {
      draft = await DraftGeneratorService.generate(invoice, contact, context);
    } catch (err: any) {
      console.warn(`[QueueIngestion] AI Draft generation failed, using fallback: ${err.message}`);
      fallbackUsed = true;

      // PRODUCTION-GRADE FALLBACK SYSTEM
      // Never throw due to missing AI keys or provider errors
      draft = {
        subject: `Reminder: Invoice ${invoice.invoice_number} is ${invoice.status}`,
        body_text: `Dear ${contact.name},\n\nThis is a reminder regarding invoice ${invoice.invoice_number} for ${(invoice.amount_cents / 100).toFixed(2)} ${invoice.currency}.\n\nAccording to our records, the status of this invoice is currently: ${invoice.status}.\n\nPlease let us know if you have any questions.\n\nBest regards,\nAccounts Receivable`,
        confidence: 0,
        rationale: 'fallback_no_ai',
        source: 'fallback'
      };
    }

    // Insert into action_queue for human review
    const { data, error } = await supabase
      .from('action_queue')
      .insert({
        account_id: accountId,
        invoice_id: invoice.id,
        contact_id: contact.id,
        action_type: 'send_email',
        status: 'pending_review',
        priority: 5,
        payload: {
          draft,
          context,
          is_fallback: fallbackUsed,
          fallback_label: fallbackUsed ? 'Auto-generated (no AI)' : null
        },
        ai_confidence: draft.confidence,
        requires_human_review: true
      })
      .select()
      .single();

    if (error) {
      if (error.message.includes('ai_confidence') || error.message.includes('requires_human_review')) {
        throw new Error('Database schema is outdated. Apply migrations (20260419114500_harden_action_queue.sql).');
      }
      throw error;
    }

    if (error) throw error;

    // Audit fallback usage for traceability
    if (fallbackUsed) {
      await InvoicesService.createAuditLog(
        accountId,
        'queue.fallback_used',
        'action_queue',
        data.id,
        { action_type: 'send_email', reason: 'ai_provider_error', invoice_number: invoice.invoice_number }
      );
    }

    await InvoicesService.createAuditLog(
      accountId,
      'queue_item.created',
      'action_queue',
      data.id,
      { action_type: 'send_email', invoice_number: invoice.invoice_number, source: fallbackUsed ? 'fallback' : 'ai' }
    );

    return data;
  }
}
