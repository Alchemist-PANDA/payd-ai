import { z } from 'zod';
import { UUID } from './contracts';

/**
 * CRS (Client Reliability Score) Types
 * Phase 3: Intelligence Layer
 */

export type CRSGrade = 'A' | 'B' | 'C' | 'D' | 'F';

export interface CRSScore {
  contact_id: UUID;
  account_id: UUID;
  score: number; // 0-100
  grade: CRSGrade;
  last_updated: string;
}

export interface CRSDetail extends CRSScore {
  contact_name: string;
  contact_email: string | null;
  promises_made: number;
  promises_kept: number;
  promises_broken: number;
  avg_days_late: number;
  total_invoices: number;
  paid_invoices: number;
  overdue_invoices: number;
  total_outstanding_cents: number;
  dso_days: number; // Days Sales Outstanding
}

export interface CRSTrend {
  date: string;
  score: number;
}

export interface CRSHistory {
  contact_id: UUID;
  trends: CRSTrend[];
}

/**
 * CRS Calculation Components
 */
export interface CRSComponents {
  payment_history_score: number; // 0-40 points
  promise_history_score: number; // 0-40 points
  dso_trend_score: number; // 0-20 points
}

/**
 * Helper: Convert score to grade
 */
export function scoreToGrade(score: number): CRSGrade {
  if (score >= 90) return 'A';
  if (score >= 75) return 'B';
  if (score >= 60) return 'C';
  if (score >= 40) return 'D';
  return 'F';
}

/**
 * Helper: Get grade color
 */
export function getGradeColor(grade: CRSGrade): string {
  switch (grade) {
    case 'A': return 'text-green-600 bg-green-50 border-green-200';
    case 'B': return 'text-blue-600 bg-blue-50 border-blue-200';
    case 'C': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'D': return 'text-orange-600 bg-orange-50 border-orange-200';
    case 'F': return 'text-red-600 bg-red-50 border-red-200';
  }
}

/**
 * Validation Schema
 */
export const CRSScoreSchema = z.object({
  contact_id: z.string().uuid(),
  account_id: z.string().uuid(),
  score: z.number().min(0).max(100),
  grade: z.enum(['A', 'B', 'C', 'D', 'F']),
  last_updated: z.string(),
});
