import { UUID } from './contracts';

/**
 * Broken Promise Alert Types
 * Phase 3: SA-19 - Detection, Alert UI, CRS Delta, Recommended Action
 */

export interface BrokenPromiseAlert {
  id: UUID;
  account_id: UUID;
  contact_id: UUID;
  invoice_id: UUID;
  promise_id: UUID;
  promised_date: string;
  broken_date: string; // Date when promise was detected as broken
  previous_crs_score: number;
  new_crs_score: number;
  crs_delta: number; // Negative value showing score drop
  recommended_action: 'require_deposit' | 'escalate_contact' | 'pause_work' | 'legal_review';
  status: 'pending' | 'acknowledged' | 'actioned' | 'dismissed';
  created_at: string;
}

export interface BrokenPromiseDetail extends BrokenPromiseAlert {
  contact_name: string;
  contact_email: string | null;
  invoice_number: string;
  invoice_amount_cents: number;
  total_broken_promises: number; // Historical count for this contact
  promise_history_summary: string; // e.g., "2nd broken promise in 3 months"
}

/**
 * Recommended Action Logic
 */
export function calculateRecommendedAction(
  newCrsScore: number,
  totalBrokenPromises: number,
  invoiceAmountCents: number
): BrokenPromiseAlert['recommended_action'] {
  // High-value invoice + multiple broken promises = require deposit
  if (invoiceAmountCents > 1000000 && totalBrokenPromises >= 2) {
    return 'require_deposit';
  }

  // CRS dropped below 40 = escalate to senior contact
  if (newCrsScore < 40) {
    return 'escalate_contact';
  }

  // 3+ broken promises = pause work
  if (totalBrokenPromises >= 3) {
    return 'pause_work';
  }

  // CRS below 30 = legal review
  if (newCrsScore < 30) {
    return 'legal_review';
  }

  // Default: escalate contact
  return 'escalate_contact';
}

/**
 * Action Copy for UI
 */
export function getActionCopy(action: BrokenPromiseAlert['recommended_action']): {
  title: string;
  description: string;
  severity: 'warning' | 'danger' | 'critical';
} {
  switch (action) {
    case 'require_deposit':
      return {
        title: 'Require 50% Deposit',
        description: 'This client has broken multiple payment promises. Require a deposit on the next project.',
        severity: 'danger'
      };
    case 'escalate_contact':
      return {
        title: 'Escalate to Senior Contact',
        description: 'Contact the finance director or managing partner directly.',
        severity: 'warning'
      };
    case 'pause_work':
      return {
        title: 'Pause All Work',
        description: 'This client has broken 3+ promises. Do not start new work until outstanding invoices are paid.',
        severity: 'critical'
      };
    case 'legal_review':
      return {
        title: 'Legal Review Recommended',
        description: 'Client reliability score is critically low. Consider formal collection process.',
        severity: 'critical'
      };
  }
}
