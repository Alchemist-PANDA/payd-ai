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
   */
  static async generateDraftAndQueue(
    accountId: UUID,
    invoice: Invoice,
    contact: Contact,
    context: string
  ) {
    const draft = await DraftGeneratorService.generate(invoice, contact, context);

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
          context
        },
        ai_confidence: draft.confidence,
        requires_human_review: true
      })
      .select()
      .single();

    if (error) throw error;

    await InvoicesService.createAuditLog(
      accountId,
      'queue_item.created',
      'action_queue',
      data.id,
      { action_type: 'send_email', invoice_number: invoice.invoice_number }
    );

    return data;
  }
}
