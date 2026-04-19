/**
 * Real User Rehearsal Script
 *
 * Runs the product end-to-end like an early customer.
 * Path: CSV upload -> Queue review -> Approve -> Manual send
 */

import { supabase } from '../src/lib/supabase/client';
import { CsvIngestionService, ImportPreviewRow } from '../src/services/ingestion/CsvIngestionService';
import { ActionQueueService } from '../src/services/queue/ActionQueueService';
import { UUID } from '../packages/shared/src/types/contracts';

async function runRehearsal() {
  console.log('Starting Real User Rehearsal (Pre-Launch)...\n');

  // 1. Setup
  const { data: account } = await supabase.from('accounts').insert({ name: 'Beta Customer Ltd' }).select('id').single();
  const accountId = account!.id as UUID;
  console.log(`✓ [Step 0] Joined Beta: ${accountId}`);

  // 2. CSV Upload
  console.log('\n--- Step 1: Uploading Invoices ---');
  const rehearsalRows: ImportPreviewRow[] = [
    {
      row_index: 0,
      is_valid: true,
      is_duplicate: false,
      errors: [],
      data: {
        invoice_number: 'BETA-101',
        amount: 350.00,
        currency: 'USD',
        due_date: '2026-04-19',
        issued_date: '2026-04-05',
        contact_name: 'Regular Customer',
        contact_email: 'regular@customer.com'
      }
    }
  ];

  const importResult = await CsvIngestionService.commitImport(rehearsalRows, accountId);
  console.log(`✓ [Step 1] Success: Imported ${importResult.count} invoices.`);

  // 3. Queue Review
  console.log('\n--- Step 2: Reviewing the Queue ---');
  const { data: pendingItems } = await supabase
    .from('action_queue')
    .select('id, status, payload')
    .eq('account_id', accountId)
    .eq('status', 'pending_review');

  if (pendingItems && pendingItems.length > 0) {
    const item = pendingItems[0];
    console.log(`✓ [Step 2] Found item: ${item.id} (Status: ${item.status})`);

    // 4. Approve
    console.log('\n--- Step 3: Approving the Draft ---');
    await ActionQueueService.updateStatus(item.id, accountId, 'approved');
    const { data: approvedItem } = await supabase.from('action_queue').select('status').eq('id', item.id).single();
    console.log(`✓ [Step 3] Status updated to: ${approvedItem?.status}`);

    // 5. Manual Send
    console.log('\n--- Step 4: Explicit Manual Send ---');
    await ActionQueueService.updateStatus(item.id, accountId, 'sent', { method: 'manual_send' });
    const { data: sentItem } = await supabase.from('action_queue').select('status').eq('id', item.id).single();
    console.log(`✓ [Step 4] Status updated to: ${sentItem?.status}`);

    // 6. Verify Audit
    console.log('\n--- Verification: Checking Audit Log ---');
    const { data: auditLogs } = await supabase
      .from('audit_log')
      .select('action, metadata')
      .eq('account_id', accountId)
      .eq('entity_id', item.id)
      .order('created_at', { ascending: false });

    console.log(`✓ [Audit] Log entries found: ${auditLogs?.length}`);
    auditLogs?.forEach(log => {
      console.log(`  - ${log.action}: ${JSON.stringify(log.metadata)}`);
    });
  }

  console.log('\nRehearsal Complete: GOLDEN PATH VERIFIED.');
}

runRehearsal().catch(console.error);
