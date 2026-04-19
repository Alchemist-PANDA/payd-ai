import { describe, it, expect, vi } from 'vitest';
import { CsvIngestionService } from '../CsvIngestionService';

// Mock Supabase
vi.mock('../../../lib/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          data: [],
          error: null
        }))
      }))
    }))
  }
}));

describe('CsvIngestionService', () => {
  const accountId = '00000000-0000-0000-0000-000000000001';

  it('validates a correct CSV row', async () => {
    const rawRows = [{
      invoice_number: 'INV-001',
      contact_name: 'Stark Ind.',
      contact_email: 'tony@stark.com',
      amount: 1000.50,
      currency: 'USD',
      due_date: '2026-05-20',
      issued_date: '2026-04-20'
    }];

    const preview = await CsvIngestionService.validateImport(rawRows, accountId);

    expect(preview[0].is_valid).toBe(true);
    expect(preview[0].errors).toHaveLength(0);
  });

  it('rejects an invalid amount', async () => {
    const rawRows = [{
      invoice_number: 'INV-002',
      contact_name: 'Wayne Ent.',
      amount: -500,
      due_date: '2026-05-25',
      issued_date: '2026-04-25'
    }];

    const preview = await CsvIngestionService.validateImport(rawRows, accountId);

    expect(preview[0].is_valid).toBe(false);
    expect(preview[0].errors[0]).toContain('amount');
  });

  it('flags missing required fields', async () => {
    const rawRows = [{
      invoice_number: 'INV-003',
      // contact_name missing
      amount: 100,
      due_date: '2026-05-25',
      issued_date: '2026-04-25'
    }];

    const preview = await CsvIngestionService.validateImport(rawRows, accountId);

    expect(preview[0].is_valid).toBe(false);
    expect(preview[0].errors[0]).toContain('contact_name');
  });
});
