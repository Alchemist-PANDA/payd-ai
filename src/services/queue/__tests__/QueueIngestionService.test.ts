import { describe, it, expect, beforeEach, vi } from 'vitest';
import { QueueIngestionService } from '../QueueIngestionService';
import { supabase } from '../../../lib/supabase/client';
import { InvoicesService } from '../../invoices/InvoicesService';

// Mock Supabase client
vi.mock('../../../lib/supabase/client', () => ({
  supabase: {
    from: vi.fn()
  }
}));

// Mock InvoicesService
vi.mock('../../invoices/InvoicesService', () => ({
  InvoicesService: {
    createAuditLog: vi.fn()
  }
}));

// Mock AI services
vi.mock('../../../lib/ai/ReplyClassifier', () => ({
  ReplyClassifierService: {
    classify: vi.fn()
  }
}));

vi.mock('../../../lib/ai/DraftGenerator', () => ({
  DraftGeneratorService: {
    generate: vi.fn()
  }
}));

import { ReplyClassifierService } from '../../../lib/ai/ReplyClassifier';
import { DraftGeneratorService } from '../../../lib/ai/DraftGenerator';

describe('QueueIngestionService Integration Tests', () => {
  const accountId = '00000000-0000-0000-0000-000000000001';
  const invoiceId = '00000000-0000-0000-0000-000000000002';
  const contactId = '00000000-0000-0000-0000-000000000003';
  const queueItemId = '00000000-0000-0000-0000-000000000999';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('classifyAndQueue', () => {
    it('should create action_queue row with pending_review status', async () => {
      const mockClassification = {
        category: 'explicit_promise' as const,
        confidence: 0.88,
        requires_human_review: true,
        extracted_data: {}
      };

      vi.mocked(ReplyClassifierService.classify).mockResolvedValue(mockClassification);

      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              id: queueItemId,
              account_id: accountId,
              invoice_id: invoiceId,
              action_type: 'classify_reply',
              status: 'pending_review',
              priority: 5,
              ai_confidence: 0.88,
              requires_human_review: true
            },
            error: null
          })
        })
      });

      vi.mocked(supabase.from).mockReturnValue({
        insert: mockInsert
      } as any);

      const result = await QueueIngestionService.classifyAndQueue(
        accountId,
        invoiceId,
        'We will pay on next Friday.',
        { from: 'test@example.com' }
      );

      // Verify insert was called with correct data
      expect(mockInsert).toHaveBeenCalledWith({
        account_id: accountId,
        invoice_id: invoiceId,
        action_type: 'classify_reply',
        status: 'pending_review',
        priority: 5,
        payload: {
          classification: mockClassification,
          email_body: 'We will pay on next Friday.',
          email_metadata: { from: 'test@example.com' }
        },
        ai_confidence: 0.88,
        requires_human_review: true
      });

      // Verify status is pending_review
      expect(result.status).toBe('pending_review');

      // Verify ai_confidence and requires_human_review stored correctly
      expect(result.ai_confidence).toBe(0.88);
      expect(result.requires_human_review).toBe(true);
    });

    it('should elevate priority for dispute category', async () => {
      const mockClassification = {
        category: 'dispute' as const,
        confidence: 0.95,
        requires_human_review: true,
        extracted_data: {}
      };

      vi.mocked(ReplyClassifierService.classify).mockResolvedValue(mockClassification);

      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              id: queueItemId,
              priority: 10,
              status: 'pending_review'
            },
            error: null
          })
        })
      });

      vi.mocked(supabase.from).mockReturnValue({
        insert: mockInsert
      } as any);

      await QueueIngestionService.classifyAndQueue(
        accountId,
        invoiceId,
        'This invoice is wrong and we are not paying.',
        {}
      );

      // Verify priority is elevated to 10 for disputes
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          priority: 10
        })
      );
    });

    it('should fire queue_item.created audit log event', async () => {
      const mockClassification = {
        category: 'paid_claim' as const,
        confidence: 0.92,
        requires_human_review: true,
        extracted_data: {}
      };

      vi.mocked(ReplyClassifierService.classify).mockResolvedValue(mockClassification);

      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: queueItemId },
            error: null
          })
        })
      });

      vi.mocked(supabase.from).mockReturnValue({
        insert: mockInsert
      } as any);

      await QueueIngestionService.classifyAndQueue(
        accountId,
        invoiceId,
        'We already paid this yesterday.',
        {}
      );

      // Verify audit log was created
      expect(InvoicesService.createAuditLog).toHaveBeenCalledWith(
        accountId,
        'queue_item.created',
        'action_queue',
        queueItemId,
        { action_type: 'classify_reply', category: 'paid_claim' }
      );
    });
  });

  describe('generateDraftAndQueue', () => {
    it('should create action_queue row with pending_review status', async () => {
      const mockDraft = {
        subject: 'Follow-up on Invoice INV-001',
        body_text: 'Hi John,\n\nJust following up...',
        confidence: 0.95,
        rationale: 'Generated standard professional reminder template.'
      };

      vi.mocked(DraftGeneratorService.generate).mockResolvedValue(mockDraft);

      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              id: queueItemId,
              account_id: accountId,
              invoice_id: invoiceId,
              contact_id: contactId,
              action_type: 'send_email',
              status: 'pending_review',
              priority: 5,
              ai_confidence: 0.95,
              requires_human_review: true
            },
            error: null
          })
        })
      });

      vi.mocked(supabase.from).mockReturnValue({
        insert: mockInsert
      } as any);

      const invoice = {
        id: invoiceId,
        invoice_number: 'INV-001',
        amount_cents: 100000,
        currency: 'USD'
      } as any;

      const contact = {
        id: contactId,
        name: 'John Doe'
      } as any;

      const result = await QueueIngestionService.generateDraftAndQueue(
        accountId,
        invoice,
        contact,
        'First reminder'
      );

      // Verify insert was called with correct data
      expect(mockInsert).toHaveBeenCalledWith({
        account_id: accountId,
        invoice_id: invoiceId,
        contact_id: contactId,
        action_type: 'send_email',
        status: 'pending_review',
        priority: 5,
        payload: {
          draft: mockDraft,
          context: 'First reminder'
        },
        ai_confidence: 0.95,
        requires_human_review: true
      });

      // Verify status is pending_review
      expect(result.status).toBe('pending_review');

      // Verify requires_human_review is always true for drafts
      expect(result.requires_human_review).toBe(true);
    });

    it('should fire queue_item.created audit log event with invoice metadata', async () => {
      const mockDraft = {
        subject: 'Follow-up on Invoice INV-001',
        body_text: 'Hi John,\n\nJust following up...',
        confidence: 0.95,
        rationale: 'Generated standard professional reminder template.'
      };

      vi.mocked(DraftGeneratorService.generate).mockResolvedValue(mockDraft);

      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: queueItemId },
            error: null
          })
        })
      });

      vi.mocked(supabase.from).mockReturnValue({
        insert: mockInsert
      } as any);

      const invoice = {
        id: invoiceId,
        invoice_number: 'INV-001',
        amount_cents: 100000,
        currency: 'USD'
      } as any;

      const contact = {
        id: contactId,
        name: 'John Doe'
      } as any;

      await QueueIngestionService.generateDraftAndQueue(
        accountId,
        invoice,
        contact,
        'First reminder'
      );

      // Verify audit log includes invoice_number
      expect(InvoicesService.createAuditLog).toHaveBeenCalledWith(
        accountId,
        'queue_item.created',
        'action_queue',
        queueItemId,
        { action_type: 'send_email', invoice_number: 'INV-001' }
      );
    });
  });
});
