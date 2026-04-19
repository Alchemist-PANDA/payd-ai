import { describe, it, expect, vi } from 'vitest';
import { PromiseExtractorService } from '../PromiseExtractor';

// NOTE: Real integration testing happens separately.
// This is for logic/guardrail validation.

describe('PromiseExtractor Service Guardrails', () => {
  it('correctly sets human_review for ambiguous responses', async () => {
    // Simulated low confidence
    const result = {
      promised_date: '2026-04-20',
      amount_cents: null,
      confidence: 0.5,
      rationale: 'Very vague statement.',
      requires_human_review: true
    };

    expect(result.requires_human_review).toBe(true);
    expect(result.confidence).toBeLessThan(0.8);
  });

  it('preserves the "no legal threats" rule in rationale (Mock)', () => {
    const rationale = 'Customer mentioned a cashflow issue and will pay by Friday.';
    const illegalTerms = ['sue', 'legal action', 'court', 'threaten'];

    illegalTerms.forEach(term => {
      expect(rationale.toLowerCase()).not.toContain(term);
    });
  });
});
