import { supabase } from '../../lib/supabase/client';
import { UUID } from '../../../packages/shared/src/types/contracts';
import { COMPLAINT_THRESHOLDS, AccountComplaintStats } from '../../../packages/shared/src/types/complaint-monitor';
import { InvoicesService } from '../invoices/InvoicesService';

/**
 * COMPLAINT MONITOR SERVICE
 * Phase 3: SA-13 - Auto-suspend at 0.5% complaint rate
 *
 * Monitors email complaint rates per account and auto-suspends sending
 * when the threshold is exceeded to protect deliverability.
 */

export class ComplaintMonitorService {
  /**
   * Calculate complaint rate for an account
   */
  static async getAccountComplaintStats(accountId: UUID): Promise<AccountComplaintStats> {
    // Count total sent emails
    const { count: totalSent } = await supabase
      .from('email_events')
      .select('*', { count: 'exact', head: true })
      .eq('account_id', accountId)
      .eq('direction', 'outbound')
      .in('delivery_status', ['sent', 'delivered', 'opened', 'replied']);

    // Count complaints (stored in metadata or separate complaints table)
    const { data: complaints } = await supabase
      .from('email_events')
      .select('id, created_at, metadata')
      .eq('account_id', accountId)
      .eq('direction', 'outbound')
      .or('metadata->>complaint.eq.true,delivery_status.eq.complained');

    const totalComplaints = complaints?.length || 0;
    const complaintRate = totalSent && totalSent > 0 ? (totalComplaints / totalSent) * 100 : 0;

    // Check if account is suspended
    const { data: account } = await supabase
      .from('accounts')
      .select('id, name, metadata')
      .eq('id', accountId)
      .single();

    const isSuspended = account?.metadata?.sending_suspended === true;
    const suspendedAt = account?.metadata?.suspended_at || null;
    const suspensionReason = account?.metadata?.suspension_reason || null;

    return {
      account_id: accountId,
      total_sent: totalSent || 0,
      total_complaints: totalComplaints,
      complaint_rate: complaintRate,
      last_complaint_at: complaints && complaints.length > 0 ? complaints[0].created_at : null,
      is_suspended: isSuspended,
      suspended_at: suspendedAt,
      suspension_reason: suspensionReason
    };
  }

  /**
   * Check and enforce complaint rate threshold
   * Auto-suspends account if rate exceeds 0.5%
   */
  static async checkAndEnforceThreshold(accountId: UUID): Promise<{
    action: 'none' | 'warning' | 'suspended';
    stats: AccountComplaintStats;
  }> {
    const stats = await this.getAccountComplaintStats(accountId);

    // Already suspended - no action needed
    if (stats.is_suspended) {
      return { action: 'none', stats };
    }

    // Critical: Auto-suspend at 0.5%
    if (stats.complaint_rate >= COMPLAINT_THRESHOLDS.suspension_rate) {
      await this.suspendAccount(accountId, stats);

      await InvoicesService.createAuditLog(
        accountId,
        'complaint_monitor.account_suspended',
        'account',
        accountId,
        {
          complaint_rate: stats.complaint_rate,
          total_sent: stats.total_sent,
          total_complaints: stats.total_complaints,
          threshold: COMPLAINT_THRESHOLDS.suspension_rate,
          auto_suspended: true
        }
      );

      return { action: 'suspended', stats: { ...stats, is_suspended: true } };
    }

    // Warning: 0.3% - 0.5%
    if (stats.complaint_rate >= COMPLAINT_THRESHOLDS.warning_rate) {
      await InvoicesService.createAuditLog(
        accountId,
        'complaint_monitor.warning',
        'account',
        accountId,
        {
          complaint_rate: stats.complaint_rate,
          total_sent: stats.total_sent,
          total_complaints: stats.total_complaints,
          threshold: COMPLAINT_THRESHOLDS.warning_rate
        }
      );

      return { action: 'warning', stats };
    }

    return { action: 'none', stats };
  }

  /**
   * Suspend account sending
   */
  static async suspendAccount(accountId: UUID, stats: AccountComplaintStats): Promise<void> {
    const now = new Date().toISOString();

    await supabase
      .from('accounts')
      .update({
        metadata: {
          sending_suspended: true,
          suspended_at: now,
          suspension_reason: `Complaint rate ${stats.complaint_rate.toFixed(2)}% exceeded threshold ${COMPLAINT_THRESHOLDS.suspension_rate}%`,
          complaint_stats: {
            total_sent: stats.total_sent,
            total_complaints: stats.total_complaints,
            complaint_rate: stats.complaint_rate
          }
        },
        updated_at: now
      })
      .eq('id', accountId);
  }

  /**
   * Manually unsuspend account (requires admin action)
   */
  static async unsuspendAccount(accountId: UUID, reason: string): Promise<void> {
    const now = new Date().toISOString();

    await supabase
      .from('accounts')
      .update({
        metadata: {
          sending_suspended: false,
          unsuspended_at: now,
          unsuspension_reason: reason
        },
        updated_at: now
      })
      .eq('id', accountId);

    await InvoicesService.createAuditLog(
      accountId,
      'complaint_monitor.account_unsuspended',
      'account',
      accountId,
      { reason, manual: true }
    );
  }

  /**
   * Record a complaint event
   */
  static async recordComplaint(
    accountId: UUID,
    emailEventId: UUID,
    complaintType: 'spam' | 'abuse' | 'unsubscribe' | 'bounce_hard' | 'bounce_soft',
    source: 'resend' | 'gmail' | 'manual',
    metadata: Record<string, any> = {}
  ): Promise<void> {
    // Update email event with complaint flag
    await supabase
      .from('email_events')
      .update({
        metadata: {
          complaint: true,
          complaint_type: complaintType,
          complaint_source: source,
          complaint_at: new Date().toISOString(),
          ...metadata
        }
      })
      .eq('id', emailEventId);

    // Check threshold after recording complaint
    await this.checkAndEnforceThreshold(accountId);
  }

  /**
   * Run monitoring check for all accounts (cron job)
   */
  static async runMonitoringCheck(): Promise<{
    checked: number;
    warnings: number;
    suspensions: number;
  }> {
    const { data: accounts } = await supabase
      .from('accounts')
      .select('id');

    let warnings = 0;
    let suspensions = 0;

    for (const account of accounts || []) {
      const result = await this.checkAndEnforceThreshold(account.id);
      if (result.action === 'warning') warnings++;
      if (result.action === 'suspended') suspensions++;
    }

    return {
      checked: accounts?.length || 0,
      warnings,
      suspensions
    };
  }
}
