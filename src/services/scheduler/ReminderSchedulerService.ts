import { supabase } from '../../lib/supabase/client';
import { QueueIngestionService } from '../queue/QueueIngestionService';
import { InvoicesService } from '../invoices/InvoicesService';
import { type UUID, type Invoice, type Contact } from '../../../packages/shared/src/types/contracts';

export interface ReminderStage {
  stage: 0 | 3 | 7 | 14;
  overdueDays: number;
  label: string;
}

export interface SchedulerRunResult {
  account_id: UUID;
  scanned_invoices: number;
  eligible_invoices: number;
  triggered_actions: number;
  skipped_paid: number;
  skipped_promise: number;
  skipped_dispute: number;
  skipped_idempotent: number;
  errors: Array<{ invoice_id: UUID; error: string }>;
}

interface SchedulerStateRow {
  id: UUID;
  account_id: UUID;
  invoice_id: UUID;
  stage: number;
  status: 'pending' | 'triggered' | 'skipped' | 'failed';
  triggered_at: string | null;
  queue_item_id: UUID | null;
  reason: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

const REMINDER_STAGES: ReminderStage[] = [
  { stage: 0, overdueDays: 0, label: 'due_today' },
  { stage: 3, overdueDays: 3, label: 'overdue_3d' },
  { stage: 7, overdueDays: 7, label: 'overdue_7d' },
  { stage: 14, overdueDays: 14, label: 'overdue_14d' }
];

export class ReminderSchedulerService {
  static getReminderStages(): ReminderStage[] {
    return REMINDER_STAGES;
  }

  private static async insertSchedulerStateIfAbsent(
    accountId: UUID,
    invoiceId: UUID,
    stage: number,
    status: 'pending' | 'skipped' | 'failed',
    reason: string | null,
    metadata: Record<string, any>
  ): Promise<SchedulerStateRow | null> {
    const insertResult = await supabase
      .from('scheduler_state')
      .insert({
        account_id: accountId,
        invoice_id: invoiceId,
        stage,
        status,
        reason,
        metadata
      })
      .select('id, account_id, invoice_id, stage, status, triggered_at, queue_item_id, reason, metadata, created_at, updated_at')
      .single();

    if (insertResult.error) {
      const message = insertResult.error.message || '';
      const isUniqueConflict = insertResult.error.code === '23505' || message.toLowerCase().includes('duplicate');
      if (isUniqueConflict) return null;
      throw insertResult.error;
    }

    return insertResult.data as unknown as SchedulerStateRow;
  }

  static computeOverdueDays(dueDate: string, now = new Date()): number {
    const due = new Date(`${dueDate}T00:00:00Z`);
    const current = new Date(now.toISOString().slice(0, 10) + 'T00:00:00Z');
    const diffMs = current.getTime() - due.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  }

  static getCurrentStage(overdueDays: number): ReminderStage | null {
    if (overdueDays < 0) return null;
    if (overdueDays >= 14) return REMINDER_STAGES[3];
    if (overdueDays >= 7) return REMINDER_STAGES[2];
    if (overdueDays >= 3) return REMINDER_STAGES[1];
    return REMINDER_STAGES[0];
  }

  static async runForAccount(accountId: UUID): Promise<SchedulerRunResult> {
    const result: SchedulerRunResult = {
      account_id: accountId,
      scanned_invoices: 0,
      eligible_invoices: 0,
      triggered_actions: 0,
      skipped_paid: 0,
      skipped_promise: 0,
      skipped_dispute: 0,
      skipped_idempotent: 0,
      errors: []
    };

    await InvoicesService.createAuditLog(accountId, 'scheduler.run.started', 'scheduler', accountId, {
      stages: REMINDER_STAGES.map(s => s.stage),
      stage_labels: REMINDER_STAGES.map(s => s.label)
    });

    const { data: invoices, error } = await supabase
      .from('invoices')
      .select(`
        id,
        account_id,
        invoice_number,
        amount_cents,
        currency,
        status,
        due_date,
        issued_date,
        links:invoice_contact_links(
          contact:contacts(id, account_id, name, email, phone)
        )
      `)
      .eq('account_id', accountId)
      .in('status', ['pending', 'partial', 'overdue']);

    if (error) {
      await InvoicesService.createAuditLog(accountId, 'scheduler.run.failed', 'scheduler', accountId, {
        error: error.message
      });
      throw error;
    }

    result.scanned_invoices = invoices?.length || 0;

    for (const inv of invoices || []) {
      const invoice = inv as any;
      const overdueDays = this.computeOverdueDays(invoice.due_date);
      const stage = this.getCurrentStage(overdueDays);

      if (!stage) continue;

      // Safety rule #1: Do not trigger if invoice is already paid/void
      if (invoice.status === 'paid' || invoice.status === 'void') {
        result.skipped_paid += 1;
        await this.insertSchedulerStateIfAbsent(
          accountId,
          invoice.id,
          stage.stage,
          'skipped',
          'paid_or_void',
          { stage_label: stage.label, overdue_days: overdueDays }
        );
        await InvoicesService.createAuditLog(accountId, 'scheduler.invoice.skipped', 'invoice', invoice.id, {
          skip_reason: 'paid_or_void',
          invoice_number: invoice.invoice_number,
          invoice_status: invoice.status,
          stage: stage.stage,
          stage_label: stage.label,
          overdue_days: overdueDays
        });
        continue;
      }

      // Safety rule #2: Do not trigger if active promise exists
      // Broken promises do NOT block the scheduler.
      const { data: activePromises } = await supabase
        .from('promises')
        .select('id, status')
        .eq('account_id', accountId)
        .eq('invoice_id', invoice.id)
        .eq('status', 'active')
        .limit(1);

      if (activePromises && activePromises.length > 0) {
        result.skipped_promise += 1;
        await InvoicesService.createAuditLog(accountId, 'scheduler.invoice.skipped', 'invoice', invoice.id, {
          skip_reason: 'active_promise',
          invoice_number: invoice.invoice_number,
          stage: stage.stage,
          stage_label: stage.label,
          overdue_days: overdueDays,
          promise_id: activePromises[0].id
        });
        await this.insertSchedulerStateIfAbsent(
          accountId,
          invoice.id,
          stage.stage,
          'skipped',
          'active_promise',
          { stage_label: stage.label, overdue_days: overdueDays }
        );
        continue;
      }

      // Safety rule #3: Do not trigger if dispute exists
      // Logic: Look for action_queue items with status pending_review/approved/edited
      // and type dispute_review OR classification category 'dispute'.
      const { data: disputes } = await supabase
        .from('action_queue')
        .select('id, action_type, payload')
        .eq('account_id', accountId)
        .eq('invoice_id', invoice.id)
        .in('status', ['pending_review', 'edited', 'approved']);

      // Filter in memory for classification category 'dispute' in payload
      const activeDispute = disputes?.find(d =>
        d.action_type === 'dispute_review' ||
        (d.payload as any)?.classification?.category === 'dispute'
      );

      if (activeDispute) {
        result.skipped_dispute += 1;
        await InvoicesService.createAuditLog(accountId, 'scheduler.invoice.skipped', 'invoice', invoice.id, {
          skip_reason: 'dispute_exists',
          invoice_number: invoice.invoice_number,
          stage: stage.stage,
          stage_label: stage.label,
          overdue_days: overdueDays,
          dispute_queue_item_id: activeDispute.id
        });
        await this.insertSchedulerStateIfAbsent(
          accountId,
          invoice.id,
          stage.stage,
          'skipped',
          'dispute_exists',
          { stage_label: stage.label, overdue_days: overdueDays }
        );
        continue;
      }

      // Idempotency v2: atomic scheduler_state row creation (source of truth)
      const schedulerStateInsert = await supabase
        .from('scheduler_state')
        .insert({
          account_id: accountId,
          invoice_id: invoice.id,
          stage: stage.stage,
          status: 'pending',
          reason: null,
          metadata: { stage_label: stage.label, overdue_days: overdueDays }
        })
        .select('id, account_id, invoice_id, stage, status, triggered_at, queue_item_id, reason, metadata, created_at, updated_at')
        .single();

      let schedulerState: SchedulerStateRow | null = null;

      if (schedulerStateInsert.error) {
        // Unique conflict means this stage already exists for invoice => idempotent skip
        const message = schedulerStateInsert.error.message || '';
        const isUniqueConflict = schedulerStateInsert.error.code === '23505' || message.toLowerCase().includes('duplicate');

        if (isUniqueConflict) {
          result.skipped_idempotent += 1;
          await InvoicesService.createAuditLog(accountId, 'scheduler.invoice.skipped', 'invoice', invoice.id, {
            skip_reason: 'idempotent_conflict',
            invoice_number: invoice.invoice_number,
            stage: stage.stage,
            stage_label: stage.label,
            overdue_days: overdueDays
          });
          continue;
        }

        // Non-unique insert errors are treated as scheduler errors
        result.errors.push({ invoice_id: invoice.id, error: schedulerStateInsert.error.message });
        await InvoicesService.createAuditLog(accountId, 'scheduler.invoice.error', 'invoice', invoice.id, {
          error_type: 'scheduler_state_insert_failed',
          error_message: schedulerStateInsert.error.message,
          error_code: schedulerStateInsert.error.code,
          invoice_number: invoice.invoice_number,
          stage: stage.stage,
          stage_label: stage.label,
          overdue_days: overdueDays
        });
        continue;
      }

      schedulerState = schedulerStateInsert.data as unknown as SchedulerStateRow;

      const primaryContact = (invoice.links || []).find((l: any) => l?.contact)?.contact as Contact | undefined;
      if (!primaryContact) {
        result.errors.push({ invoice_id: invoice.id, error: 'No linked contact found' });
        await InvoicesService.createAuditLog(accountId, 'scheduler.invoice.error', 'invoice', invoice.id, {
          error_type: 'missing_primary_contact',
          error_message: 'No linked contact found',
          invoice_number: invoice.invoice_number,
          stage: stage.stage,
          stage_label: stage.label,
          overdue_days: overdueDays
        });
        await supabase.from('scheduler_state').upsert({
          account_id: accountId,
          invoice_id: invoice.id,
          stage: stage.stage,
          status: 'failed',
          reason: 'missing_contact',
          metadata: { stage_label: stage.label, overdue_days: overdueDays, invoice_number: invoice.invoice_number },
          updated_at: new Date().toISOString()
        }, { onConflict: 'account_id,invoice_id,stage' });
        continue;
      }

      result.eligible_invoices += 1;

      try {
        const context = `Scheduler reminder stage=${stage.stage} (${stage.label}), overdue_days=${overdueDays}`;

        const queueItem = await QueueIngestionService.generateDraftAndQueue(
          accountId,
          {
            id: invoice.id,
            account_id: invoice.account_id,
            invoice_number: invoice.invoice_number,
            amount_cents: invoice.amount_cents,
            currency: invoice.currency,
            status: invoice.status,
            due_date: invoice.due_date,
            issued_date: invoice.issued_date
          } as Invoice,
          primaryContact,
          context
        );

        await supabase
          .from('scheduler_state')
          .update({
            status: 'triggered',
            triggered_at: new Date().toISOString(),
            queue_item_id: queueItem?.id || null,
            reason: null,
            metadata: {
              stage_label: stage.label,
              overdue_days: overdueDays,
              action_type: 'send_email'
            },
            updated_at: new Date().toISOString()
          })
          .eq('id', schedulerState?.id);

        await InvoicesService.createAuditLog(accountId, 'scheduler.stage.triggered', 'invoice', invoice.id, {
          stage: stage.stage,
          stage_label: stage.label,
          invoice_number: invoice.invoice_number,
          overdue_days: overdueDays,
          action_type: 'send_email',
          queue_item_id: queueItem?.id || null
        });

        result.triggered_actions += 1;
      } catch (err: any) {
        const errorMessage = err?.message || 'Unknown scheduler trigger error';
        result.errors.push({ invoice_id: invoice.id, error: errorMessage });

        await supabase
          .from('scheduler_state')
          .update({
            status: 'failed',
            reason: 'queue_trigger_failed',
            metadata: {
              stage_label: stage.label,
              overdue_days: overdueDays,
              invoice_number: invoice.invoice_number,
              error_message: errorMessage,
              error_stack: err?.stack?.substring(0, 500)
            },
            updated_at: new Date().toISOString()
          })
          .eq('id', schedulerState?.id);

        await InvoicesService.createAuditLog(accountId, 'scheduler.invoice.error', 'invoice', invoice.id, {
          error_type: 'queue_trigger_failed',
          error_message: errorMessage,
          invoice_number: invoice.invoice_number,
          stage: stage.stage,
          stage_label: stage.label,
          overdue_days: overdueDays
        });
      }
    }

    await InvoicesService.createAuditLog(accountId, 'scheduler.run.completed', 'scheduler', accountId, {
      scanned_invoices: result.scanned_invoices,
      eligible_invoices: result.eligible_invoices,
      triggered_actions: result.triggered_actions,
      skipped_paid: result.skipped_paid,
      skipped_promise: result.skipped_promise,
      skipped_dispute: result.skipped_dispute,
      skipped_idempotent: result.skipped_idempotent,
      error_count: result.errors.length
    });

    return result;
  }

  static async runForAllAccounts(): Promise<SchedulerRunResult[]> {
    const { data: accounts, error } = await supabase.from('accounts').select('id');
    if (error) throw error;

    const results: SchedulerRunResult[] = [];
    for (const account of accounts || []) {
      const accountId = (account as any).id as UUID;
      const res = await this.runForAccount(accountId);
      results.push(res);
    }

    return results;
  }
}
