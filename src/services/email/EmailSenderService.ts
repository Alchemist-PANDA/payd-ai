import { supabase } from '../../lib/supabase/client';
import { UUID, Invoice, Contact } from '../../../packages/shared/src/types/contracts';
import { InvoicesService } from '../invoices/InvoicesService';

/**
 * EMAIL SENDER SERVICE
 * Phase 3 Safety Guard: Verifies account is not suspended before sending
 */

export class EmailSenderService {
  static async sendEmail(
    accountId: UUID,
    to: string[],
    subject: string,
    bodyHtml: string,
    bodyText: string,
    invoiceId?: UUID,
    contactId?: UUID,
    metadata?: Record<string, any>
  ): Promise<boolean> {
    // CRITICAL SAFETY GUARD: Check if account is suspended due to complaints
    const { data: account } = await supabase
      .from('accounts')
      .select('id, metadata')
      .eq('id', accountId)
      .single();

    if (account?.metadata?.sending_suspended === true) {
      const reason = account.metadata.suspension_reason || 'high complaint rate';
      console.error(`[EmailSender] BLOCKED: Account ${accountId} is suspended. Reason: ${reason}`);

      // Log the blocked attempt
      await InvoicesService.createAuditLog(
        accountId,
        'email.blocked.suspended',
        'account',
        accountId,
        {
          to,
          subject,
          reason,
          invoice_id: invoiceId
        }
      );

      throw new Error(`Sending blocked: Account is suspended (${reason})`);
    }

    console.log(`[EmailSender] Sending email to ${to.join(', ')} for account ${accountId}`);
    // Simulate email sending via Resend or other provider here
    // ...

    // Record the sent email event for complaint monitoring
    const { error } = await supabase
      .from('email_events')
      .insert({
        account_id: accountId,
        invoice_id: invoiceId || null,
        contact_id: contactId || null,
        direction: 'outbound',
        subject,
        body_html: bodyHtml,
        body_text: bodyText,
        delivery_status: 'sent',
        sent_at: new Date().toISOString(),
        metadata: metadata || {}
      });

    if (error) {
      console.error(`[EmailSender] Failed to log email event: ${error.message}`);
    }

    return true;
  }
}
