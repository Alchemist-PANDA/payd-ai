import { describe, it, expect, vi } from 'vitest';

vi.mock('../../../lib/supabase/client', () => ({
  supabase: {
    from: vi.fn()
  }
}));

vi.mock('../../queue/QueueIngestionService', () => ({
  QueueIngestionService: {
    generateDraftAndQueue: vi.fn()
  }
}));

vi.mock('../../invoices/InvoicesService', () => ({
  InvoicesService: {
    createAuditLog: vi.fn()
  }
}));

import { ReminderSchedulerService } from '../ReminderSchedulerService';

describe('ReminderSchedulerService stage model', () => {
  it('STAGE_TABLE_01: exposes scheduler stages 0/3/7/14', () => {
    const stages = ReminderSchedulerService.getReminderStages();
    expect(stages.map(s => s.stage)).toEqual([0, 3, 7, 14]);
    expect(stages.map(s => s.label)).toEqual(['due_today', 'overdue_3d', 'overdue_7d', 'overdue_14d']);
  });

  it('STAGE_DAYS_01: computes overdue days deterministically', () => {
    const now = new Date('2026-04-19T12:00:00Z');
    expect(ReminderSchedulerService.computeOverdueDays('2026-04-19', now)).toBe(0);
    expect(ReminderSchedulerService.computeOverdueDays('2026-04-16', now)).toBe(3);
    expect(ReminderSchedulerService.computeOverdueDays('2026-04-12', now)).toBe(7);
    expect(ReminderSchedulerService.computeOverdueDays('2026-04-05', now)).toBe(14);
    expect(ReminderSchedulerService.computeOverdueDays('2026-04-20', now)).toBe(-1);
  });

  it('STAGE_MAP_01: maps overdue=0 -> stage 0', () => {
    expect(ReminderSchedulerService.getCurrentStage(0)?.stage).toBe(0);
  });

  it('STAGE_MAP_02: maps overdue=3 -> stage 3', () => {
    expect(ReminderSchedulerService.getCurrentStage(3)?.stage).toBe(3);
  });

  it('STAGE_MAP_03: maps overdue=7 -> stage 7', () => {
    expect(ReminderSchedulerService.getCurrentStage(7)?.stage).toBe(7);
  });

  it('STAGE_MAP_04: maps overdue>=14 -> stage 14', () => {
    expect(ReminderSchedulerService.getCurrentStage(14)?.stage).toBe(14);
    expect(ReminderSchedulerService.getCurrentStage(21)?.stage).toBe(14);
  });

  it('STAGE_MAP_05: maps not-overdue invoices to null stage', () => {
    expect(ReminderSchedulerService.getCurrentStage(-1)).toBeNull();
  });
});
