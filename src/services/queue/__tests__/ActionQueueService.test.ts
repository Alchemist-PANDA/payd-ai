import { describe, it, expect, vi } from 'vitest';
import { ActionQueueService } from '../ActionQueueService';

// Mock Supabase client
vi.mock('../../../lib/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => ({
            data: { status: 'pending_review', account_id: '00000000-0000-0000-0000-000000000001' },
            error: null
          }))
        }))
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          error: null
        }))
      }))
    }))
  }
}));

// Mock InvoicesService for Audit Log
vi.mock('../../invoices/InvoicesService', () => ({
  InvoicesService: {
    createAuditLog: vi.fn()
  }
}));

describe('ActionQueueService State Machine', () => {
  const accountId = '00000000-0000-0000-0000-000000000001';
  const itemId = '00000000-0000-0000-0000-000000000999';

  it('allows valid transition from pending_review to approved', async () => {
    await expect(
      ActionQueueService.updateStatus(itemId, accountId, 'approved')
    ).resolves.not.toThrow();
  });

  it('rejects invalid transition from pending_review to sent', async () => {
    await expect(
      ActionQueueService.updateStatus(itemId, accountId, 'sent')
    ).rejects.toThrow('Invalid transition: pending_review -> sent');
  });

  it('rejects unauthorized update if accountId does not match', async () => {
    const wrongAccountId = 'ffffffff-ffff-ffff-ffff-ffffffffffff';
    await expect(
      ActionQueueService.updateStatus(itemId, wrongAccountId, 'approved')
    ).rejects.toThrow('Unauthorized');
  });
});
