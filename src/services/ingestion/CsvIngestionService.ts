import Papa from 'papaparse';
import { supabase } from '../../lib/supabase/client';
import { InvoiceImportSchema, type InvoiceImport, type UUID } from '../../../packages/shared/src/types/contracts';
import { InvoicesService } from '../invoices/InvoicesService';
import { QueueIngestionService } from '../queue/QueueIngestionService';
import { normalizeEmail } from '../contacts/ContactUtils';

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

      // 1. Get/Create Contact - Production-grade matching logic with hardening
      let contactId: UUID;
      let contactRecord: any;
      let matchStrategy: 'email' | 'name' | 'created' = 'created';
      let matchReason: string | null = null;

      // Normalize and validate email using shared utility
      const normalizedEmail = normalizeEmail(data.contact_email);

      // STEP 1: Try to match by email (primary identifier)
      // Email is the most reliable identifier for a person
      let matchedContact = null;

      if (normalizedEmail) {
        const { data: emailMatch, error: emailError } = await supabase
          .from('contacts')
          .select('id, account_id, name, email, phone')
          .eq('account_id', accountId)
          .eq('email', normalizedEmail)
          .maybeSingle();

        if (emailError) throw emailError;

        if (emailMatch) {
          // Found exact email match - this is the same person
          matchedContact = emailMatch;
          matchStrategy = 'email';
          console.log(`[Ingestion] Matched contact by email: ${normalizedEmail}`);
        }
      }

      // STEP 2: If no email match, try name matching (secondary, with safety checks)
      if (!matchedContact && data.contact_name) {
        const { data: nameMatches, error: nameError } = await supabase
          .from('contacts')
          .select('id, account_id, name, email, phone')
          .eq('account_id', accountId)
          .eq('name', data.contact_name);

        if (nameError) throw nameError;

        if (nameMatches && nameMatches.length === 1) {
          const singleMatch = nameMatches[0];

          // Additional safety: check email consistency
          if (normalizedEmail && singleMatch.email && normalizedEmail !== singleMatch.email) {
            // Name matches but email is different - this is a different person or email changed
            matchReason = 'email_mismatch';
            console.warn(
              `[Ingestion] Name match found but email differs: ` +
              `"${data.contact_name}" has email ${singleMatch.email} in DB but ${normalizedEmail} in CSV. ` +
              `Creating new contact to avoid wrong email address.`
            );
            // Fall through to create new contact (matchedContact stays null)
          } else {
            // Name matches and email is consistent (or missing) - safe to reuse
            matchedContact = singleMatch;
            matchStrategy = 'name';
            console.log(`[Ingestion] Matched contact by name (single match): ${data.contact_name}`);
          }
        } else if (nameMatches && nameMatches.length > 1) {
          // Multiple contacts with same name - ambiguous, cannot safely reuse
          matchReason = 'ambiguous';
          console.warn(
            `[Ingestion] Ambiguous contact match: ${nameMatches.length} contacts named "${data.contact_name}". ` +
            `Creating new contact to avoid wrong email address.`
          );
          // Fall through to create new contact
        } else {
          // No name matches
          matchReason = 'no_match';
        }
      } else if (!matchedContact && !data.contact_name) {
        matchReason = 'no_match';
      }

      // STEP 3: Use matched contact or create new one
      if (matchedContact) {
        contactId = matchedContact.id;
        contactRecord = matchedContact;
      } else {
        // No match found - create new contact
        // Handle race condition: another process may have created same email contact
        let createAttempts = 0;
        const maxAttempts = 2;

        while (createAttempts < maxAttempts) {
          const { data: newContact, error: cErr } = await supabase
            .from('contacts')
            .insert({
              account_id: accountId,
              name: data.contact_name,
              email: normalizedEmail
            })
            .select('id, account_id, name, email, phone')
            .single();

          if (!cErr) {
            // Success - contact created
            contactId = newContact.id;
            contactRecord = newContact;
            console.log(`[Ingestion] Created new contact: ${data.contact_name} <${normalizedEmail || 'no email'}>`);
            break;
          }

          // Check if error is unique constraint violation on email
          if (cErr.code === '23505' && normalizedEmail && createAttempts === 0) {
            // Race condition: another process created contact with same email
            // Retry by fetching the existing contact
            console.log(`[Ingestion] Race condition detected - contact with email ${normalizedEmail} was created concurrently. Retrying...`);

            const { data: raceContact, error: raceError } = await supabase
              .from('contacts')
              .select('id, account_id, name, email, phone')
              .eq('account_id', accountId)
              .eq('email', normalizedEmail)
              .maybeSingle();

            if (!raceError && raceContact) {
              // Found the contact that was created concurrently
              contactId = raceContact.id;
              contactRecord = raceContact;
              matchStrategy = 'email';
              console.log(`[Ingestion] Resolved race condition - using existing contact: ${normalizedEmail}`);
              break;
            }

            // If we still can't find it, retry insert once more
            createAttempts++;
          } else {
            // Other error - throw
            throw cErr;
          }
        }

        if (!contactId) {
          throw new Error(`Failed to create or find contact after ${maxAttempts} attempts`);
        }
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
        const failureReason = linkErr.code === '23505'
          ? 'duplicate_primary_contact_link'
          : 'contact_link_insert_failed';

        await InvoicesService.createAuditLog(accountId, 'invoice.import.failed', 'invoice', newInvoice.id, {
          reason: failureReason,
          invoice_number: data.invoice_number,
          contact_id: contactId,
          error_code: linkErr.code,
          error_message: linkErr.message
        });
        throw new Error(`Contact link failed for invoice ${data.invoice_number}: ${failureReason} (${linkErr.message})`);
      }

      // 4. Audit Log with matching metadata
      await InvoicesService.createAuditLog(accountId, 'invoice.import', 'invoice', newInvoice.id, {
        import_row: row.row_index,
        invoice_number: data.invoice_number,
        contact_match_strategy: matchStrategy,
        contact_match_reason: matchReason,
        contact_id: contactId,
        contact_email_normalized: normalizedEmail
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
          action_type: 'send_email',
          invoice_number: data.invoice_number
        });

        queueItemsCreated += 1;
      } catch (queueErr: any) {
        const errorMessage = queueErr?.message || 'Unknown queue generation error';
        console.error(`[Ingestion] Queue auto-generation failed for invoice ${data.invoice_number}:`, errorMessage);

        await InvoicesService.createAuditLog(accountId, 'queue.auto_generation_failed', 'invoice', newInvoice.id, {
          source: 'csv_import',
          invoice_number: data.invoice_number,
          error_message: errorMessage,
          error_stack: queueErr?.stack?.substring(0, 500)
        });
      }
    }

    return { success: true, count: validRows.length, queue_items_created: queueItemsCreated };
  }
}
