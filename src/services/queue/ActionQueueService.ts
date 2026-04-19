import { supabase } from '../../lib/supabase/client';
import {
  type UUID,
  type ActionQueue,
  type ActionQueueStatus,
  type ActionQueueItem
} from '../../../packages/shared/src/types/contracts';
import { InvoicesService } from '../invoices/InvoicesService';

/**
 * ACTION QUEUE SERVICE (Phase 3 Hardened)
 * Logic for queue item lifecycle and human-review state machine.
 */

export class ActionQueueService {
  /**
   * VALID TRANSITIONS
   */
  private static readonly VALID_TRANSITIONS: Record<ActionQueueStatus, ActionQueueStatus[]> = {
    'pending_review': ['approved', 'edited', 'skipped', 'archived'],
    'edited': ['approved', 'skipped', 'archived'],
    'approved': ['sent', 'failed', 'archived'],
    'sent': ['archived'],
    'failed': ['pending_review', 'archived'],
    'skipped': ['archived'],
    'archived': []
  };

  static async getQueue(accountId: UUID): Promise<ActionQueueItem[]> {
    const { data, error } = await supabase
      .from('action_queue')
      .select(`
        *,
        invoice:invoices(*),
        contact:contacts(*)
      `)
      .eq('account_id', accountId)
      .neq('status', 'archived')
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as ActionQueueItem[];
  }

  static async updateStatus(
    itemId: UUID,
    accountId: UUID,
    newStatus: ActionQueueStatus,
    metadata: Record<string, any> = {}
  ) {
    // 1. Fetch current status
    const { data: item, error: fetchError } = await supabase
      .from('action_queue')
      .select('status, account_id')
      .eq('id', itemId)
      .single();

    if (fetchError || !item) throw new Error('Queue item not found');
    if (item.account_id !== accountId) throw new Error('Unauthorized');

    // 2. Validate transition
    const allowed = this.VALID_TRANSITIONS[item.status as ActionQueueStatus];
    if (!allowed.includes(newStatus)) {
      throw new Error(`Invalid transition: ${item.status} -> ${newStatus}`);
    }

    // 3. Update
    const { error: updateError } = await supabase
      .from('action_queue')
      .update({
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', itemId);

    if (updateError) throw updateError;

    // 4. Audit
    await InvoicesService.createAuditLog(
      accountId,
      'queue_item.status_updated',
      'action_queue',
      itemId,
      { from: item.status, to: newStatus, ...metadata }
    );
  }

  static async updatePayload(
    itemId: UUID,
    accountId: UUID,
    newPayload: Record<string, any>
  ) {
    const { error } = await supabase
      .from('action_queue')
      .update({
        payload: newPayload,
        status: 'edited',
        updated_at: new Date().toISOString()
      })
      .eq('id', itemId)
      .eq('account_id', accountId);

    if (error) throw error;

    await InvoicesService.createAuditLog(
      accountId,
      'queue_item.edited',
      'action_queue',
      itemId,
      { new_payload_summary: 'Manual user edit' }
    );
  }
}
