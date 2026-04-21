import { UUID } from './contracts';

/**
 * Complaint Monitor Types
 * Phase 3: SA-13 - Auto-suspend at 0.5% complaint rate
 */

export interface ComplaintEvent {
  id: UUID;
  account_id: UUID;
  email_event_id: UUID;
  contact_id: UUID;
  invoice_id: UUID | null;
  complaint_type: 'spam' | 'abuse' | 'unsubscribe' | 'bounce_hard' | 'bounce_soft';
  reported_at: string;
  source: 'resend' | 'gmail' | 'manual';
  metadata: Record<string, any>;
}

export interface AccountComplaintStats {
  account_id: UUID;
  total_sent: number;
  total_complaints: number;
  complaint_rate: number; // Percentage (0-100)
  last_complaint_at: string | null;
  is_suspended: boolean;
  suspended_at: string | null;
  suspension_reason: string | null;
}

export interface ComplaintThreshold {
  warning_rate: number; // 0.3%
  suspension_rate: number; // 0.5%
  critical_rate: number; // 1.0%
}

export const COMPLAINT_THRESHOLDS: ComplaintThreshold = {
  warning_rate: 0.3,
  suspension_rate: 0.5,
  critical_rate: 1.0
};

/**
 * Helper: Get status color based on complaint rate
 */
export function getComplaintStatusColor(rate: number): string {
  if (rate >= COMPLAINT_THRESHOLDS.critical_rate) {
    return 'bg-red-100 text-red-800 border-red-200';
  }
  if (rate >= COMPLAINT_THRESHOLDS.suspension_rate) {
    return 'bg-orange-100 text-orange-800 border-orange-200';
  }
  if (rate >= COMPLAINT_THRESHOLDS.warning_rate) {
    return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  }
  return 'bg-green-100 text-green-800 border-green-200';
}

/**
 * Helper: Get status label
 */
export function getComplaintStatusLabel(rate: number): string {
  if (rate >= COMPLAINT_THRESHOLDS.critical_rate) return 'Critical';
  if (rate >= COMPLAINT_THRESHOLDS.suspension_rate) return 'Suspended';
  if (rate >= COMPLAINT_THRESHOLDS.warning_rate) return 'Warning';
  return 'Healthy';
}
