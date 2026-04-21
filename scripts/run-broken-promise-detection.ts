import { supabase } from '../src/lib/supabase/client';
import { InvoicesService } from '../src/services/invoices/InvoicesService';
import { QueueIngestionService } from '../src/services/queue/QueueIngestionService';
import { CRSCalculatorService } from '../src/services/crs/CRSCalculatorService';
import { trackEvent } from '../src/lib/telemetry';

/**
 * BROKEN PROMISE DETECTION CRON
 * Daily check: Detects promises where promised_date has passed without payment
 */

async function main() {
  console.log('[Broken Promise Detection] Starting daily check...');

  try {
    // Get all accounts
    const { data: accounts } = await supabase
      .from('accounts')
      .select('id');

    if (!accounts || accounts.length === 0) {
      console.log('[Broken Promise Detection] No accounts found');
      return;
    }

    let totalChecked = 0;
    let totalBroken = 0;

    for (const account of accounts) {
      const accountId = account.id;

      // Find active promises where promised_date < now
      const now = new Date();
      const { data: activePromises } = await supabase
        .from('promises')
        .select('id, invoice_id, contact_id, promised_date, amount_cents')
        .eq('account_id', accountId)
        .eq('status', 'active')
        .lt('promised_date', now.toISOString().split('T')[0]); // Date comparison

      totalChecked += activePromises?.length || 0;

      for (const promise of activePromises || []) {
        // Check if invoice has been paid after the promised date
        const { data: payments } = await supabase
          .from('invoice_payments')
          .select('payment_date, amount_cents')
          .eq('invoice_id', promise.invoice_id)
          .gte('payment_date', promise.promised_date);

        const totalPaid = payments?.reduce((sum, p) => sum + p.amount_cents, 0) || 0;
        const targetAmount = promise.amount_cents || 1; // Require at least 1 cent if no specific amount was promised

        // If no payment or insufficient payment, mark promise as broken
        if (totalPaid < targetAmount) {
          console.log(`[Broken Promise Detection] Promise ${promise.id} broken for invoice ${promise.invoice_id}`);

          // Mark promise as broken
          await supabase
            .from('promises')
            .update({ status: 'broken' })
            .eq('id', promise.id);

          // Get invoice and contact details
          const { data: invoice } = await supabase
            .from('invoices')
            .select('invoice_number, amount_cents')
            .eq('id', promise.invoice_id)
            .single();

          const { data: contact } = await supabase
            .from('contacts')
            .select('name, email')
            .eq('id', promise.contact_id)
            .single();

          // Recalculate CRS (this will trigger CRS delta)
          const { data: crsRecord } = await supabase
            .from('crs_scores')
            .select('score')
            .eq('contact_id', promise.contact_id)
            .single();

          const previousScore = crsRecord?.score || 75;
          const newScore = await CRSCalculatorService.recomputeScore(accountId, promise.contact_id);
          const crsDelta = newScore - previousScore;

          // Create broken promise alert in action_queue
          await supabase
            .from('action_queue')
            .insert({
              account_id: accountId,
              invoice_id: promise.invoice_id,
              contact_id: promise.contact_id,
              action_type: 'broken_promise_alert',
              status: 'pending_review',
              priority: 'high',
              payload: {
                promise_id: promise.id,
                promised_date: promise.promised_date,
                broken_date: now.toISOString(),
                invoice_number: invoice?.invoice_number,
                invoice_amount_cents: invoice?.amount_cents,
                contact_name: contact?.name,
                previous_crs_score: previousScore,
                new_crs_score: newScore,
                crs_delta: crsDelta
              },
              requires_human_review: true
            });

          // Audit log
          await InvoicesService.createAuditLog(
            accountId,
            'promise.broken',
            'promise',
            promise.id,
            {
              invoice_id: promise.invoice_id,
              contact_id: promise.contact_id,
              promised_date: promise.promised_date,
              crs_delta: crsDelta
            }
          );

          // Telemetry
          trackEvent.brokenPromiseDetected(promise.contact_id, invoice?.amount_cents || 0);

          totalBroken++;
        } else {
          console.log(`[Broken Promise Detection] Promise ${promise.id} kept for invoice ${promise.invoice_id}`);

          // Mark promise as kept (fulfilled)
          await supabase
            .from('promises')
            .update({ status: 'fulfilled' })
            .eq('id', promise.id);

          // Recalculate CRS
          await CRSCalculatorService.recomputeScore(accountId, promise.contact_id);

          // Audit log
          await InvoicesService.createAuditLog(
            accountId,
            'promise.kept',
            'promise',
            promise.id,
            {
              invoice_id: promise.invoice_id,
              contact_id: promise.contact_id,
              promised_date: promise.promised_date,
              amount_paid: totalPaid
            }
          );
        }
      }
    }

    console.log(`[Broken Promise Detection] Complete. Checked: ${totalChecked}, Broken: ${totalBroken}`);
  } catch (error: any) {
    console.error('[Broken Promise Detection] Fatal error:', error.message);
    process.exit(1);
  }
}

main();
