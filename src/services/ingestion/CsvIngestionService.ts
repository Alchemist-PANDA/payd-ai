import Papa from 'papaparse';
import { supabase } from '../../lib/supabase/client';
import { InvoiceImportSchema, type InvoiceImport, type UUID } from '../../../packages/shared/src/types/contracts';
import { InvoicesService } from '../invoices/InvoicesService';
import { QueueIngestionService } from '../queue/QueueIngestionService';

/**
 * CSV INGESTION PIPELINE (Hardened Phase 2)
 * End-to-end: Upload -> Parse -> Validate -> Commit.
 */

export interface ImportPreviewRow {
  row_index: number;
  data: Partial<InvoiceImport>;
  errors: string[];
  is_valid: boolean;
  is_duplicate: boolean;
}

export class CsvIngestionService {
  /**
   * 1. PARSE: CSV File -> Raw Rows
   */
  static async parseFile(file: File): Promise<any[]> {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        complete: (results) => resolve(results.data),
        error: (error) => reject(error),
      });
    });
  }

  /**
   * 2. VALIDATE: Raw Rows -> Validated Preview
   */
  static async validateImport(rows: any[], accountId: UUID): Promise<ImportPreviewRow[]> {
    // 1. Fetch existing invoices for duplicate detection
    const { data: existingInvoices } = await supabase
      .from('invoices')
      .select('invoice_number')
      .eq('account_id', accountId);

    const existingNumbers = new Set(existingInvoices?.map(i => i.invoice_number) || []);

    return rows.map((row, index) => {
      const result = InvoiceImportSchema.safeParse(row);
      const errors = result.success ? [] : result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`);
      const invoiceNumber = row.invoice_number?.toString();
      const isDuplicate = existingNumbers.has(invoiceNumber);

      if (isDuplicate) errors.push(`Duplicate: Invoice ${invoiceNumber} already exists.`);

      return {
        row_index: index,
        data: row,
        errors,
        is_valid: result.success && !isDuplicate,
        is_duplicate: isDuplicate
      };
    });
  }

  /**
   * 3. COMMIT: Preview Rows -> Database Persistence
   * - Creates/updates contacts.
   * - Inserts invoices.
   * - Links contacts.
   * - Logs audit events.
   */
  static async commitImport(rows: ImportPreviewRow[], accountId: UUID) {
    const validRows = rows.filter(r => r.is_valid);
    console.log(`[Ingestion] Committing ${validRows.length} rows for account ${accountId}`);

    let queueItemsCreated = 0;

    for (const row of validRows) {
      const data = row.data as InvoiceImport;
      const amountCents = Math.round(data.amount * 100);

      // 1. Get/Create Contact
      let contactId: UUID;
      let contactRecord: any;
      const { data: existingContact } = await supabase
        .from('contacts')
        .select('id, account_id, name, email, phone')
        .eq('account_id', accountId)
        .eq('name', data.contact_name)
        .single();

      if (existingContact) {
        contactId = existingContact.id;
        contactRecord = existingContact;
      } else {
        const { data: newContact, error: cErr } = await supabase
          .from('contacts')
          .insert({
            account_id: accountId,
            name: data.contact_name,
            email: data.contact_email || null
          })
          .select('id, account_id, name, email, phone')
          .single();
        if (cErr) throw cErr;
        contactId = newContact.id;
        contactRecord = newContact;
      }

      // 2. Insert Invoice
      const { data: newInvoice, error: iErr } = await supabase
        .from('invoices')
        .insert({
          account_id: accountId,
          invoice_number: data.invoice_number,
          amount_cents: amountCents,
          currency: data.currency || 'USD',
          due_date: data.due_date,
          issued_date: data.issued_date,
          status: 'pending'
        })
        .select('id, account_id, invoice_number, amount_cents, currency, status, due_date, issued_date')
        .single();
      if (iErr) throw iErr;

      // 3. Link Contact (primary integrity enforcement point)
      const { error: linkErr } = await supabase.from('invoice_contact_links').insert({
        account_id: accountId,
        invoice_id: newInvoice.id,
        contact_id: contactId,
        contact_type: 'primary'
      });

      if (linkErr) {
        await InvoicesService.createAuditLog(accountId, 'invoice.import.failed', 'invoice', newInvoice.id, {
          reason: 'missing_or_invalid_contact_link',
          invoice_number: data.invoice_number,
          error: linkErr.message
        });
        throw linkErr;
      }

      // 4. Audit Log
      await InvoicesService.createAuditLog(accountId, 'invoice.import', 'invoice', newInvoice.id, {
        import_row: row.row_index,
        invoice_number: data.invoice_number
      });

      // 5. AUTO-TRIGGER Queue generation (review-first)
      try {
        await QueueIngestionService.generateDraftAndQueue(
          accountId,
          newInvoice as any,
          contactRecord as any,
          'Auto-generated from CSV import'
        );

        await InvoicesService.createAuditLog(accountId, 'queue.auto_generated', 'invoice', newInvoice.id, {
          source: 'csv_import',
          action_type: 'send_email'
        });

        queueItemsCreated += 1;
      } catch (queueErr: any) {
        await InvoicesService.createAuditLog(accountId, 'queue.auto_generation_failed', 'invoice', newInvoice.id, {
          source: 'csv_import',
          error: queueErr?.message || 'Unknown queue generation error'
        });
      }
    }

    return { success: true, count: validRows.length, queue_items_created: queueItemsCreated };
  }
}
