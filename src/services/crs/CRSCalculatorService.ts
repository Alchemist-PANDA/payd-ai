import { supabase } from '../../lib/supabase/client';
import { UUID } from '../../../packages/shared/src/types/contracts';
import { InvoicesService } from '../invoices/InvoicesService';
import { trackEvent } from '../../lib/telemetry';
import { scoreToGrade } from '../../../packages/shared/src/types/crs';

/**
 * CRS CALCULATOR SERVICE
 * Phase 3: SA-08 - Recompute Client Reliability Score
 */

export class CRSCalculatorService {
  /**
   * Recalculates CRS for a specific contact based on compounding formula.
   * Formula:
   * - Base: 75
   * - On-time payment: +5
   * - Late payment: -2 per day late (capped at -50)
   * - Kept promise: +10
   * - Broken promise: -20
   */
  static async recomputeScore(accountId: UUID, contactId: UUID): Promise<number> {
    // 1. Fetch current score record
    const { data: currentRecord } = await supabase
      .from('crs_scores')
      .select('score, payment_history_score, promise_history_score, dso_trend_score')
      .eq('contact_id', contactId)
      .single();

    const oldScore = currentRecord?.score || 75;

    // 2. Fetch invoices for payment history
    // Only fetch invoices linked to this client
    const { data: invoices } = await supabase
      .from('invoices')
      .select(`
        id,
        status,
        due_date,
        amount_cents,
        payments:invoice_payments(amount_cents, payment_date)
      `)
      .eq('account_id', accountId)
      .filter('client_id', 'eq', contactId);

    // 3. Fetch promises for promise history
    const { data: promises } = await supabase
      .from('promises')
      .select('status')
      .eq('account_id', accountId)
      .eq('contact_id', contactId);

    // 4. Calculate Payment Score Component
    let paymentComponent = 0;
    if (invoices) {
      invoices.forEach((inv: any) => {
        if (inv.status === 'paid') {
          // Check if paid on time
          // We look at the latest payment date
          const latestPayment = inv.payments?.length > 0
            ? Math.max(...inv.payments.map((p: any) => new Date(p.payment_date).getTime()))
            : null;

          const dueDate = new Date(inv.due_date).getTime();

          if (latestPayment && latestPayment <= dueDate) {
            paymentComponent += 5; // On-time bonus
          } else {
            // Late payment - subtract based on days late
            const daysLate = Math.floor((latestPayment - dueDate) / (1000 * 60 * 60 * 24));
            if (daysLate > 0) {
              paymentComponent -= Math.min(20, daysLate * 1); // Capped penalty for historic late payments
            }
          }
        } else if (inv.status === 'overdue' || inv.status === 'partial') {
          const dueDate = new Date(inv.due_date);
          const daysLate = Math.floor((Date.now() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
          if (daysLate > 0) {
            // Severe penalty for active overdue invoices
            paymentComponent -= Math.min(50, daysLate * 2);
          }
        }
      });
    }

    // 5. Calculate Promise Score Component
    let promiseComponent = 0;
    if (promises) {
      promises.forEach(p => {
        if (p.status === 'fulfilled' || p.status === 'kept') {
          promiseComponent += 10;
        } else if (p.status === 'broken') {
          promiseComponent -= 20;
        }
      });
    }

    // 6. Compound Score
    // Base 75 + components
    let newScore = 75 + paymentComponent + promiseComponent;

    // Bound score between 0 and 100
    newScore = Math.max(0, Math.min(100, newScore));
    const delta = newScore - oldScore;
    const grade = scoreToGrade(newScore);

    // 7. Update database
    const { error } = await supabase
      .from('crs_scores')
      .upsert({
        contact_id: contactId,
        account_id: accountId,
        score: newScore,
        grade,
        payment_history_score: paymentComponent,
        promise_history_score: promiseComponent,
        last_updated: new Date().toISOString()
      }, { onConflict: 'contact_id' });

    if (error) {
      console.error(`[CRS Calculator] Failed to update score for contact ${contactId}:`, error);
      throw error;
    }

    // 8. Audit & Telemetry
    if (delta !== 0) {
      await InvoicesService.createAuditLog(
        accountId,
        'crs_score.updated',
        'contact',
        contactId,
        { old_score: oldScore, new_score: newScore, delta, grade }
      );

      trackEvent.crsUpdated(contactId, oldScore, newScore, delta);
    }

    return newScore;
  }
}
