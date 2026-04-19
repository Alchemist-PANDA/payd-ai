/**
 * Headless Real Usage Simulation
 *
 * Executes service logic directly without browser APIs.
 */

import { supabase } from '../src/lib/supabase/client';
import { CsvIngestionService, ImportPreviewRow } from '../src/services/ingestion/CsvIngestionService';
import { ReminderSchedulerService } from '../src/services/scheduler/ReminderSchedulerService';
import { ActionQueueService } from '../src/services/queue/ActionQueueService';
import { UUID } from '../packages/shared/src/types/contracts';

async function runSimulation() {
  console.log('Starting Headless Real Usage Simulation...\n');

  // 1. Resolve Account
  const { data: account } = await supabase.from('accounts').insert({ name: 'Simulation Account' }).select('id').single();
  const accountId = account!.id as UUID;
  console.log(`Created simulation account: ${accountId}`);

  // 2. Scenario 1: Basic CSV Import (Mocked Rows)
  console.log('\n--- SCENARIO 1: Basic CSV Import ---');
  const mockRows: ImportPreviewRow[] = [
    {
      row_index: 0,
      is_valid: true,
      is_duplicate: false,
      errors: [],
      data: {
        invoice_number: 'SIM-1001',
        amount: 1500.00,
        currency: 'USD',
        due_date: '2026-04-19',
        issued_date: '2026-04-01',
        contact_name: 'John Sim',
        contact_email: 'john@sim.com'
      }
    },
    {
      row_index: 1,
      is_valid: true,
      is_duplicate: false,
      errors: [],
      data: {
        invoice_number: 'SIM-1002',
        amount: 2500.00,
        currency: 'USD',
        due_date: '2026-04-16',
        issued_date: '2026-04-01',
        contact_name: 'Jane Sim',
        contact_email: 'jane@sim.com'
      }
    }
  ];

  const importResult = await CsvIngestionService.commitImport(mockRows, accountId);
  console.log(`Import Result: ${JSON.stringify(importResult)}`);

  // 3. Scenario 2: Scheduler Run (Stage 0 and Stage 3)
  console.log('\n--- SCENARIO 2: Scheduler Run ---');
  // We need to wait a moment for the DB to stabilize
  await new Promise(r => setTimeout(r, 1000));

  const schedulerResult = await ReminderSchedulerService.runForAccount(accountId);
  console.log(`Scheduler Result: ${JSON.stringify(schedulerResult)}`);

  // 4. Scenario 3: Promise Blocking
  console.log('\n--- SCENARIO 3: Promise Blocking ---');
  const promiseInvNo = 'SIM-PROMISE-1';
  const { data: promiseInv } = await supabase.from('invoices').insert({
    account_id: accountId,
    invoice_number: promiseInvNo,
    amount_cents: 100000,
    currency: 'USD',
    due_date: '2026-04-10',
    issued_date: '2026-03-25',
    status: 'overdue'
  }).select('id').single();

  const { data: contact } = await supabase.from('contacts').select('id').eq('account_id', accountId).limit(1).single();
  await supabase.from('invoice_contact_links').insert({
    account_id: accountId,
    invoice_id: promiseInv!.id,
    contact_id: contact!.id,
    contact_type: 'primary'
  });

  await supabase.from('promises').insert({
    account_id: accountId,
    invoice_id: promiseInv!.id,
    contact_id: contact!.id,
    promised_date: '2026-05-01',
    status: 'active'
  });

  const promiseRun = await ReminderSchedulerService.runForAccount(accountId);
  console.log(`Promise Run Result: skipped_promise=${promiseRun.skipped_promise}`);

  // 5. Scenario 4: Dispute Blocking
  console.log('\n--- SCENARIO 4: Dispute Blocking ---');
  const disputeInvNo = 'SIM-DISPUTE-1';
  const { data: disputeInv } = await supabase.from('invoices').insert({
    account_id: accountId,
    invoice_number: disputeInvNo,
    amount_cents: 100000,
    currency: 'USD',
    due_date: '2026-04-10',
    issued_date: '2026-03-25',
    status: 'overdue'
  }).select('id').single();

  await supabase.from('invoice_contact_links').insert({
    account_id: accountId,
    invoice_id: disputeInv!.id,
    contact_id: contact!.id,
    contact_type: 'primary'
  });

  await supabase.from('action_queue').insert({
    account_id: accountId,
    invoice_id: disputeInv!.id,
    contact_id: contact!.id,
    action_type: 'dispute_review',
    status: 'pending_review',
    payload: { classification: { category: 'dispute' } }
  });

  const disputeRun = await ReminderSchedulerService.runForAccount(accountId);
  console.log(`Dispute Run Result: skipped_dispute=${disputeRun.skipped_dispute}`);

  // 6. Scenario 5: Action Queue Interaction
  console.log('\n--- SCENARIO 5: Action Queue Interaction ---');
  const { data: queueItems } = await supabase.from('action_queue').select('id, status').eq('account_id', accountId).eq('status', 'pending_review').limit(1);
  if (queueItems && queueItems.length > 0) {
    const item = queueItems[0];
    console.log(`Reviewing item: ${item.id}`);

    await ActionQueueService.updateStatus(item.id, accountId, 'approved');
    const { data: approvedItem } = await supabase.from('action_queue').select('status').eq('id', item.id).single();
    console.log(`Approved status: ${approvedItem?.status}`);

    // Test Dismiss (Skip)
    const { data: moreItems } = await supabase.from('action_queue').select('id').eq('account_id', accountId).eq('status', 'pending_review').limit(1);
    if (moreItems && moreItems.length > 0) {
        await ActionQueueService.updateStatus(moreItems[0].id, accountId, 'skipped');
        const { data: skippedItem } = await supabase.from('action_queue').select('status').eq('id', moreItems[0].id).single();
        console.log(`Dismissed status: ${skippedItem?.status}`);
    }
  }

  console.log('\nSimulation Complete.');
}

runSimulation().catch(console.error);
