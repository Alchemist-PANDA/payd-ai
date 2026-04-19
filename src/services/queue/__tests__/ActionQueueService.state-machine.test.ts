import { describe, it, expect, vi } from 'vitest';
import { ActionQueueService } from '../ActionQueueService';

vi.mock('../../../lib/supabase/client', () => ({
  supabase: {
    from: vi.fn()
  }
}));

describe('ActionQueueService State Machine - Transition Validation', () => {
  const accountId = '00000000-0000-0000-0000-000000000001';
  const itemId = '00000000-0000-0000-0000-000000000999';

  describe('Valid Transitions', () => {
    it('allows pending_review → approved', () => {
      const allowed = (ActionQueueService as any).VALID_TRANSITIONS['pending_review'];
      expect(allowed).toContain('approved');
    });

    it('allows pending_review → edited', () => {
      const allowed = (ActionQueueService as any).VALID_TRANSITIONS['pending_review'];
      expect(allowed).toContain('edited');
    });

    it('allows pending_review → skipped', () => {
      const allowed = (ActionQueueService as any).VALID_TRANSITIONS['pending_review'];
      expect(allowed).toContain('skipped');
    });

    it('allows approved → sent', () => {
      const allowed = (ActionQueueService as any).VALID_TRANSITIONS['approved'];
      expect(allowed).toContain('sent');
    });

    it('allows edited → approved', () => {
      const allowed = (ActionQueueService as any).VALID_TRANSITIONS['edited'];
      expect(allowed).toContain('approved');
    });

    it('allows failed → pending_review (retry)', () => {
      const allowed = (ActionQueueService as any).VALID_TRANSITIONS['failed'];
      expect(allowed).toContain('pending_review');
    });
  });

  describe('Invalid Transitions - Review-First Policy Enforcement', () => {
    it('blocks pending_review → sent (must go through approved)', () => {
      const allowed = (ActionQueueService as any).VALID_TRANSITIONS['pending_review'];
      expect(allowed).not.toContain('sent');
    });

    it('blocks pending_review → failed (no direct failure from review)', () => {
      const allowed = (ActionQueueService as any).VALID_TRANSITIONS['pending_review'];
      expect(allowed).not.toContain('failed');
    });

    it('blocks sent → approved (cannot un-send)', () => {
      const allowed = (ActionQueueService as any).VALID_TRANSITIONS['sent'];
      expect(allowed).not.toContain('approved');
    });

    it('blocks sent → pending_review (cannot un-send)', () => {
      const allowed = (ActionQueueService as any).VALID_TRANSITIONS['sent'];
      expect(allowed).not.toContain('pending_review');
    });

    it('blocks archived → any state (terminal state)', () => {
      const allowed = (ActionQueueService as any).VALID_TRANSITIONS['archived'];
      expect(allowed).toEqual([]);
    });
  });

  describe('Critical Path: pending_review → approved → sent', () => {
    it('enforces the review-first workflow', () => {
      const fromPendingReview = (ActionQueueService as any).VALID_TRANSITIONS['pending_review'];
      const fromApproved = (ActionQueueService as any).VALID_TRANSITIONS['approved'];

      // Step 1: pending_review can go to approved
      expect(fromPendingReview).toContain('approved');

      // Step 2: pending_review CANNOT go directly to sent
      expect(fromPendingReview).not.toContain('sent');

      // Step 3: approved can go to sent
      expect(fromApproved).toContain('sent');
    });
  });

  describe('Edit Workflow: pending_review → edited → approved → sent', () => {
    it('allows editing before approval', () => {
      const fromPendingReview = (ActionQueueService as any).VALID_TRANSITIONS['pending_review'];
      const fromEdited = (ActionQueueService as any).VALID_TRANSITIONS['edited'];
      const fromApproved = (ActionQueueService as any).VALID_TRANSITIONS['approved'];

      // Step 1: pending_review can go to edited
      expect(fromPendingReview).toContain('edited');

      // Step 2: edited can go to approved
      expect(fromEdited).toContain('approved');

      // Step 3: approved can go to sent
      expect(fromApproved).toContain('sent');
    });
  });

  describe('Failure Recovery: approved → failed → pending_review', () => {
    it('allows retry after send failure', () => {
      const fromApproved = (ActionQueueService as any).VALID_TRANSITIONS['approved'];
      const fromFailed = (ActionQueueService as any).VALID_TRANSITIONS['failed'];

      // Step 1: approved can go to failed (send attempt failed)
      expect(fromApproved).toContain('failed');

      // Step 2: failed can go back to pending_review (retry)
      expect(fromFailed).toContain('pending_review');
    });
  });
});
