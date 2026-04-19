import { supabase } from '../../lib/supabase/client';
import { type UUID, type Invoice } from '../../../packages/shared/src/types/contracts';

/**
 * INVOICES SERVICE (Hardened Phase 2)
 * Data access and business logic for invoices.
 */

export class InvoicesService {
  static async getByAccount(accountId: UUID) {
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        contacts:invoice_contact_links(
          contact:contacts(*)
        )
      `)
      .eq('account_id', accountId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  static async getSummary(accountId: UUID) {
    const { data: invoices, error } = await supabase
      .from('invoices')
      .select('amount_cents, status')
      .eq('account_id', accountId);

    if (error) throw error;

    const total = invoices.reduce((acc, inv) => acc + Number(inv.amount_cents), 0);
    const overdue = invoices
      .filter(inv => inv.status === 'overdue')
      .reduce((acc, inv) => acc + Number(inv.amount_cents), 0);

    return {
      total_cents: total,
      overdue_cents: overdue,
      count: invoices.length
    };
  }

  static async createAuditLog(accountId: UUID, action: string, entityType: string, entityId: UUID, metadata = {}) {
    const { error } = await supabase
      .from('audit_log')
      .insert({
        account_id: accountId,
        action,
        entity_type: entityType,
        entity_id: entityId,
        metadata
      });

    if (error) console.error('[Audit] Failed to log:', error);
  }
}
