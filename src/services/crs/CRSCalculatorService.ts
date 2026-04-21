import { supabase } from '../../lib/supabase/client';
import { UUID } from '../../../packages/shared/src/types/contracts';
import { InvoicesService } from '../invoices/InvoicesService';
import { trackEvent } from '../../lib/telemetry';

/**
 * CRS CALCULATOR SERVICE
 * Phase 3: SA-08 - Recompute Client Reliability Score
 */

export class CRSCalculatorService {
  /**
   * Recalculates CRS for a specific contact and updates the database
   */
  static async recomputeScore(accountId: UUID, contactId: UUID): Promise<number> {
    // 1. Fetch current score to calculate delta
    const { data: currentRecord } = await supabase
      .from('crs_scores')
      .select('score')
      .eq('contact_id', contactId)
      .single();

    const oldScore = currentRecord?.score || 75; // Default to 75 if no existing score

    // 2. Gather data for calculation (Mocked logic for now, should query payments/promises)
    const { data: promises } = await supabase
      .from('promises')
      .select('status')
      .eq('contact_id', contactId);

    const keptPromises = promises?.filter(p => p.status === 'fulfilled').length || 0;
    const brokenPromises = promises?.filter(p => p.status === 'broken').length || 0;

    // Simple calculation logic for illustration
    let newScore = oldScore;
    if (keptPromises > 0) newScore += (keptPromises * 2);
    if (brokenPromises > 0) newScore -= (brokenPromises * 5);

    // Bound score between 0 and 100
    newScore = Math.max(0, Math.min(100, newScore));
    const delta = newScore - oldScore;

    // 3. Update database
    const grade = this.calculateGrade(newScore);
    const { error } = await supabase
      .from('crs_scores')
      .upsert({
        contact_id: contactId,
        account_id: accountId,
        score: newScore,
        last_updated: new Date().toISOString()
      }, { onConflict: 'contact_id' });

    if (error) {
      console.error(`[CRS Calculator] Failed to update score for contact ${contactId}:`, error);
      throw error;
    }

    // 4. Audit & Telemetry
    if (delta !== 0) {
      await InvoicesService.createAuditLog(
        accountId,
        'crs_score.updated',
        'contact',
        contactId,
        { old_score: oldScore, new_score: newScore, delta }
      );

      // PostHog event
      trackEvent.crsUpdated(contactId, oldScore, newScore, delta);
    }

    return newScore;
  }

  private static calculateGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
    if (score >= 90) return 'A';
    if (score >= 75) return 'B';
    if (score >= 60) return 'C';
    if (score >= 40) return 'D';
    return 'F';
  }
}
