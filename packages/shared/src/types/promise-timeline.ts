import { UUID } from './contracts';

/**
 * Promise Timeline Types
 * Phase 3: Per-client visual history of promises kept/broken
 */

export interface PromiseTimelineEvent {
  id: UUID;
  promise_id: UUID;
  invoice_id: UUID;
  invoice_number: string;
  promised_date: string;
  promised_amount_cents: number | null;
  status: 'kept' | 'broken' | 'pending';
  actual_payment_date: string | null;
  days_late: number | null; // Positive if late, 0 if on time, null if pending
  created_at: string;
}

export interface ClientPromiseTimeline {
  contact_id: UUID;
  contact_name: string;
  contact_email: string | null;
  total_promises: number;
  kept_promises: number;
  broken_promises: number;
  pending_promises: number;
  reliability_percentage: number; // kept / (kept + broken) * 100
  events: PromiseTimelineEvent[];
}

/**
 * Helper: Get status color
 */
export function getPromiseStatusColor(status: PromiseTimelineEvent['status']): string {
  switch (status) {
    case 'kept': return 'bg-green-100 text-green-800 border-green-200';
    case 'broken': return 'bg-red-100 text-red-800 border-red-200';
    case 'pending': return 'bg-blue-100 text-blue-800 border-blue-200';
  }
}

/**
 * Helper: Get status icon
 */
export function getPromiseStatusIcon(status: PromiseTimelineEvent['status']): string {
  switch (status) {
    case 'kept': return '✓';
    case 'broken': return '✗';
    case 'pending': return '⏳';
  }
}
