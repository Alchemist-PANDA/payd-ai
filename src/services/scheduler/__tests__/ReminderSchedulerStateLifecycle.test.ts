import { describe, it, expect, vi, beforeEach } from 'vitest';

// NOTE: scheduler_state is now source-of-truth for idempotency and status lifecycle.
// This suite verifies conflict skips and triggered-state recording without downgrades.

const mocks = vi.hoisted(() => ({
  mockFrom: vi.fn(),
  mockCreateAuditLog: vi.fn(),
  mockGenerateDraftAndQueue: vi.fn()
}));

vi.mock('../../../lib/supabase/client', () => ({
  supabase: {
    from: mocks.mockFrom
  }
}));

vi.mock('../../invoices/InvoicesService', () => ({
  InvoicesService: {
    createAuditLog: mocks.mockCreateAuditLog
  }
}));

vi.mock('../../queue/QueueIngestionService', () => ({
  QueueIngestionService: {
    generateDraftAndQueue: mocks.mockGenerateDraftAndQueue
  }
}));

import { ReminderSchedulerService } from '../ReminderSchedulerService';

describe('ReminderSchedulerService scheduler_state lifecycle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockFrom = mocks.mockFrom;
  const mockCreateAuditLog = mocks.mockCreateAuditLog;
  const mockGenerateDraftAndQueue = mocks.mockGenerateDraftAndQueue;

  it('STATE_01: marks stage as triggered and records queue_item_id on success', async () => {
    const accountId = 'acc-1';
    const invoiceId = 'inv-1';

    // invoices query
    const invoicesQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockResolvedValue({
        data: [{
          id: invoiceId,
          account_id: accountId,
          invoice_number: 'INV-1',
          amount_cents: 10000,
          currency: 'USD',
          status: 'overdue',
          due_date: '2026-04-10',
          issued_date: '2026-04-01',
          links: [{ contact: { id: 'contact-1', account_id: accountId, name: 'John', email: 'john@test.com', phone: null } }]
        }],
        error: null
      })
    };

    // promises query
    const promisesQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: [], error: null })
    };

    // disputes query
    const disputesQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      or: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: [], error: null })
    };

    // scheduler_state insert
    const schedulerStateInsertQuery = {
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: {
          id: 'state-1',
          account_id: accountId,
          invoice_id: invoiceId,
          stage: 7,
          status: 'pending',
          triggered_at: null,
          queue_item_id: null,
          reason: null,
          metadata: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        error: null
      })
    };

    // scheduler_state update
    const schedulerStateUpdateQuery = {
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ data: null, error: null })
    };

    // dispatch table mocks in call order
    mockFrom
      .mockImplementationOnce(() => invoicesQuery)      // invoices
      .mockImplementationOnce(() => promisesQuery)      // promises
      .mockImplementationOnce(() => disputesQuery)      // action_queue
      .mockImplementationOnce(() => schedulerStateInsertQuery) // scheduler_state insert
      .mockImplementationOnce(() => schedulerStateUpdateQuery); // scheduler_state update

    mockGenerateDraftAndQueue.mockResolvedValue({ id: 'queue-1' });

    const result = await ReminderSchedulerService.runForAccount(accountId as any);

    expect(result.triggered_actions).toBe(1);
    expect(result.skipped_idempotent).toBe(0);
    expect(mockGenerateDraftAndQueue).toHaveBeenCalledTimes(1);

    expect(schedulerStateUpdateQuery.update).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'triggered',
        queue_item_id: 'queue-1'
      })
    );
  });

  it('STATE_02: unique conflict is treated as skipped_idempotent', async () => {
    const accountId = 'acc-1';
    const invoiceId = 'inv-1';

    const invoicesQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockResolvedValue({
        data: [{
          id: invoiceId,
          account_id: accountId,
          invoice_number: 'INV-1',
          amount_cents: 10000,
          currency: 'USD',
          status: 'overdue',
          due_date: '2026-04-10',
          issued_date: '2026-04-01',
          links: [{ contact: { id: 'contact-1', account_id: accountId, name: 'John', email: 'john@test.com', phone: null } }]
        }],
        error: null
      })
    };

    const promisesQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: [], error: null })
    };

    const disputesQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      or: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: [], error: null })
    };

    const schedulerStateInsertQuery = {
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: null,
        error: { code: '23505', message: 'duplicate key value violates unique constraint' }
      })
    };

    mockFrom
      .mockImplementationOnce(() => invoicesQuery)
      .mockImplementationOnce(() => promisesQuery)
      .mockImplementationOnce(() => disputesQuery)
      .mockImplementationOnce(() => schedulerStateInsertQuery);

    const result = await ReminderSchedulerService.runForAccount(accountId as any);

    expect(result.triggered_actions).toBe(0);
    expect(result.skipped_idempotent).toBe(1);
    expect(mockGenerateDraftAndQueue).not.toHaveBeenCalled();
    expect(mockCreateAuditLog).toHaveBeenCalledWith(
      accountId,
      'scheduler.invoice.skipped',
      'invoice',
      invoiceId,
      expect.objectContaining({ skip_reason: 'idempotent_conflict' })
    );
  });
});
