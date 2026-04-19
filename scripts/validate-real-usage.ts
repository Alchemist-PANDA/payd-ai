/**
 * Real Usage Validation Script
 *
 * Simulates real user workflows:
 * 1. CSV import with various datasets
 * 2. Scheduler execution
 * 3. Queue observation
 * 4. State verification
 *
 * Run: npm run validate:usage
 */

import { supabase } from '../src/lib/supabase/client';
import { CsvIngestionService } from '../src/services/ingestion/CsvIngestionService';
import { ReminderSchedulerService } from '../src/services/scheduler/ReminderSchedulerService';
import * as fs from 'fs';
import * as path from 'path';

interface ValidationResult {
  scenario: string;
  success: boolean;
  observations: string[];
  friction_points: string[];
  unexpected_behaviors: string[];
}

const results: ValidationResult[] = [];

async function getTestAccount(): Promise<string> {
  const { data: accounts } = await supabase.from('accounts').select('id').limit(1);
  if (!accounts || accounts.length === 0) {
    throw new Error('No test account found. Please seed database first.');
  }
  return accounts[0].id;
}

async function loadCsvFile(filename: string): Promise<File> {
  const filePath = path.join(process.cwd(), 'test-data', filename);
  const content = fs.readFileSync(filePath, 'utf-8');
  const blob = new Blob([content], { type: 'text/csv' });
  return new File([blob], filename, { type: 'text/csv' });
}

async function scenario1_BasicImport(accountId: string) {
  console.log('\n=== SCENARIO 1: Basic CSV Import ===');
  const result: ValidationResult = {
    scenario: 'Basic CSV Import (5 invoices, mixed due dates)',
    success: false,
    observations: [],
    friction_points: [],
    unexpected_behaviors: []
  };

  try {
    const file = await loadCsvFile('01-basic-invoices.csv');
    const rows = await CsvIngestionService.parseFile(file);
    result.observations.push(`Parsed ${rows.length} rows from CSV`);

    const preview = await CsvIngestionService.validateImport(rows, accountId);
    const validCount = preview.filter(r => r.is_valid).length;
    const invalidCount = preview.filter(r => !r.is_valid).length;
    result.observations.push(`Validation: ${validCount} valid, ${invalidCount} invalid`);

    if (invalidCount > 0) {
      result.friction_points.push('Validation errors present in basic dataset');
      preview.filter(r => !r.is_valid).forEach(row => {
        result.observations.push(`Row ${row.row_index} errors: ${row.errors.join(', ')}`);
      });
    }

    const commitResult = await CsvIngestionService.commitImport(preview, accountId);
    result.observations.push(`Committed ${commitResult.count} invoices`);
    result.observations.push(`Auto-generated ${commitResult.queue_items_created} queue items`);

    if (commitResult.queue_items_created !== commitResult.count) {
      result.friction_points.push(`Queue auto-generation mismatch: ${commitResult.count} invoices but ${commitResult.queue_items_created} queue items`);
    }

    // Verify invoices created
    const { data: invoices } = await supabase
      .from('invoices')
      .select('id, invoice_number, status')
      .eq('account_id', accountId)
      .in('invoice_number', ['INV-1001', 'INV-1002', 'INV-1003', 'INV-1004', 'INV-1005']);

    result.observations.push(`Verified ${invoices?.length || 0} invoices in database`);

    // Verify queue items
    const { data: queueItems } = await supabase
      .from('action_queue')
      .select('id, status, action_type')
      .eq('account_id', accountId);

    result.observations.push(`Found ${queueItems?.length || 0} queue items`);

    const pendingReview = queueItems?.filter(q => q.status === 'pending_review').length || 0;
    result.observations.push(`${pendingReview} items in pending_review status`);

    if (pendingReview !== commitResult.queue_items_created) {
      result.unexpected_behaviors.push(`Expected ${commitResult.queue_items_created} pending_review items, found ${pendingReview}`);
    }

    result.success = true;
  } catch (err: any) {
    result.observations.push(`ERROR: ${err.message}`);
    result.friction_points.push(`Import failed with error: ${err.message}`);
  }

  results.push(result);
}

async function scenario2_DueTodayScheduler(accountId: string) {
  console.log('\n=== SCENARIO 2: Due Today + Scheduler ===');
  const result: ValidationResult = {
    scenario: 'Import due-today invoices and run scheduler (stage 0)',
    success: false,
    observations: [],
    friction_points: [],
    unexpected_behaviors: []
  };

  try {
    const file = await loadCsvFile('02-due-today.csv');
    const rows = await CsvIngestionService.parseFile(file);
    const preview = await CsvIngestionService.validateImport(rows, accountId);
    const commitResult = await CsvIngestionService.commitImport(preview, accountId);

    result.observations.push(`Imported ${commitResult.count} due-today invoices`);

    // Run scheduler
    const schedulerResult = await ReminderSchedulerService.runForAccount(accountId);
    result.observations.push(`Scheduler scanned ${schedulerResult.scanned_invoices} invoices`);
    result.observations.push(`Eligible: ${schedulerResult.eligible_invoices}`);
    result.observations.push(`Triggered: ${schedulerResult.triggered_actions}`);
    result.observations.push(`Skipped (idempotent): ${schedulerResult.skipped_idempotent}`);

    if (schedulerResult.skipped_idempotent > 0) {
      result.observations.push('Idempotent skips detected (expected if auto-queue already created stage 0)');
    }

    // Check scheduler_state
    const { data: schedulerStates } = await supabase
      .from('scheduler_state')
      .select('id, invoice_id, stage, status, reason')
      .eq('account_id', accountId)
      .eq('stage', 0);

    result.observations.push(`Found ${schedulerStates?.length || 0} stage-0 scheduler_state rows`);

    const triggeredStates = schedulerStates?.filter(s => s.status === 'triggered').length || 0;
    const skippedStates = schedulerStates?.filter(s => s.status === 'skipped').length || 0;

    result.observations.push(`Triggered: ${triggeredStates}, Skipped: ${skippedStates}`);

    if (schedulerResult.errors.length > 0) {
      result.friction_points.push(`Scheduler errors: ${schedulerResult.errors.length}`);
      schedulerResult.errors.forEach(err => {
        result.observations.push(`Error on invoice ${err.invoice_id}: ${err.error}`);
      });
    }

    result.success = true;
  } catch (err: any) {
    result.observations.push(`ERROR: ${err.message}`);
    result.friction_points.push(`Scenario failed: ${err.message}`);
  }

  results.push(result);
}

async function scenario3_OverdueStages(accountId: string) {
  console.log('\n=== SCENARIO 3: Overdue Invoices (3/7/14 day stages) ===');
  const result: ValidationResult = {
    scenario: 'Import overdue invoices and verify scheduler stage mapping',
    success: false,
    observations: [],
    friction_points: [],
    unexpected_behaviors: []
  };

  try {
    const file = await loadCsvFile('03-overdue-3-7-14-days.csv');
    const rows = await CsvIngestionService.parseFile(file);
    const preview = await CsvIngestionService.validateImport(rows, accountId);
    const commitResult = await CsvIngestionService.commitImport(preview, accountId);

    result.observations.push(`Imported ${commitResult.count} overdue invoices`);

    // Run scheduler
    const schedulerResult = await ReminderSchedulerService.runForAccount(accountId);
    result.observations.push(`Scheduler triggered ${schedulerResult.triggered_actions} actions`);

    // Check stage distribution
    const { data: schedulerStates } = await supabase
      .from('scheduler_state')
      .select('stage, status, metadata')
      .eq('account_id', accountId)
      .in('stage', [3, 7, 14]);

    const stageDistribution: Record<number, number> = {};
    schedulerStates?.forEach(s => {
      stageDistribution[s.stage] = (stageDistribution[s.stage] || 0) + 1;
    });

    result.observations.push(`Stage distribution: ${JSON.stringify(stageDistribution)}`);

    // Verify overdue_days calculation
    schedulerStates?.forEach(s => {
      const overdueDays = s.metadata?.overdue_days;
      const stage = s.stage;
      result.observations.push(`Stage ${stage}: overdue_days=${overdueDays}`);

      if (stage === 3 && (overdueDays < 3 || overdueDays >= 7)) {
        result.unexpected_behaviors.push(`Stage 3 has overdue_days=${overdueDays} (expected 3-6)`);
      }
      if (stage === 7 && (overdueDays < 7 || overdueDays >= 14)) {
        result.unexpected_behaviors.push(`Stage 7 has overdue_days=${overdueDays} (expected 7-13)`);
      }
      if (stage === 14 && overdueDays < 14) {
        result.unexpected_behaviors.push(`Stage 14 has overdue_days=${overdueDays} (expected >=14)`);
      }
    });

    result.success = true;
  } catch (err: any) {
    result.observations.push(`ERROR: ${err.message}`);
    result.friction_points.push(`Scenario failed: ${err.message}`);
  }

  results.push(result);
}

async function scenario4_ValidationEdgeCases(accountId: string) {
  console.log('\n=== SCENARIO 4: Validation Edge Cases ===');
  const result: ValidationResult = {
    scenario: 'Import CSV with validation errors and observe error clarity',
    success: false,
    observations: [],
    friction_points: [],
    unexpected_behaviors: []
  };

  try {
    const file = await loadCsvFile('04-validation-edge-cases.csv');
    const rows = await CsvIngestionService.parseFile(file);
    result.observations.push(`Parsed ${rows.length} rows`);

    const preview = await CsvIngestionService.validateImport(rows, accountId);
    const validCount = preview.filter(r => r.is_valid).length;
    const invalidCount = preview.filter(r => !r.is_valid).length;

    result.observations.push(`Valid: ${validCount}, Invalid: ${invalidCount}`);

    preview.filter(r => !r.is_valid).forEach(row => {
      result.observations.push(`Row ${row.row_index} (${row.data.invoice_number || 'NO_NUMBER'}): ${row.errors.join('; ')}`);

      // Check error clarity
      if (row.errors.length === 0) {
        result.friction_points.push(`Row ${row.row_index} marked invalid but has no error messages`);
      }

      row.errors.forEach(err => {
        if (err.includes('undefined') || err.includes('null')) {
          result.friction_points.push(`Unclear error message: "${err}"`);
        }
      });
    });

    // Attempt commit (should only commit valid rows)
    const commitResult = await CsvIngestionService.commitImport(preview, accountId);
    result.observations.push(`Committed ${commitResult.count} valid invoices (${invalidCount} skipped)`);

    if (commitResult.count !== validCount) {
      result.unexpected_behaviors.push(`Expected to commit ${validCount} rows, actually committed ${commitResult.count}`);
    }

    result.success = true;
  } catch (err: any) {
    result.observations.push(`ERROR: ${err.message}`);
    result.friction_points.push(`Scenario failed: ${err.message}`);
  }

  results.push(result);
}

async function scenario5_DuplicateContacts(accountId: string) {
  console.log('\n=== SCENARIO 5: Duplicate Contact Handling ===');
  const result: ValidationResult = {
    scenario: 'Import invoices with duplicate contact names/emails',
    success: false,
    observations: [],
    friction_points: [],
    unexpected_behaviors: []
  };

  try {
    const file = await loadCsvFile('05-duplicate-contacts.csv');
    const rows = await CsvIngestionService.parseFile(file);
    const preview = await CsvIngestionService.validateImport(rows, accountId);
    const commitResult = await CsvIngestionService.commitImport(preview, accountId);

    result.observations.push(`Imported ${commitResult.count} invoices`);

    // Check contact deduplication
    const { data: contacts } = await supabase
      .from('contacts')
      .select('id, name, email')
      .eq('account_id', accountId)
      .in('name', ['John Smith', 'Jane Doe']);

    result.observations.push(`Found ${contacts?.length || 0} unique contacts for duplicate names`);

    const johnSmithContacts = contacts?.filter(c => c.name === 'John Smith').length || 0;
    const janeDoeContacts = contacts?.filter(c => c.name === 'Jane Doe').length || 0;

    result.observations.push(`John Smith: ${johnSmithContacts} contact(s)`);
    result.observations.push(`Jane Doe: ${janeDoeContacts} contact(s)`);

    if (johnSmithContacts > 1) {
      result.friction_points.push(`Contact deduplication may not be working: ${johnSmithContacts} "John Smith" contacts exist`);
    }

    if (janeDoeContacts > 1) {
      result.friction_points.push(`Contact deduplication may not be working: ${janeDoeContacts} "Jane Doe" contacts exist`);
    }

    // Verify all invoices have primary contact links
    const { data: invoices } = await supabase
      .from('invoices')
      .select(`
        id,
        invoice_number,
        links:invoice_contact_links!inner(contact_type)
      `)
      .eq('account_id', accountId)
      .in('invoice_number', ['INV-5001', 'INV-5002', 'INV-5003', 'INV-5004', 'INV-5005']);

    const invoicesWithPrimary = invoices?.filter(inv =>
      (inv as any).links?.some((l: any) => l.contact_type === 'primary')
    ).length || 0;

    result.observations.push(`${invoicesWithPrimary}/${invoices?.length || 0} invoices have primary contact link`);

    if (invoicesWithPrimary !== invoices?.length) {
      result.friction_points.push(`Some invoices missing primary contact link`);
    }

    result.success = true;
  } catch (err: any) {
    result.observations.push(`ERROR: ${err.message}`);
    result.friction_points.push(`Scenario failed: ${err.message}`);
  }

  results.push(result);
}

async function scenario6_LargeAmountsOverdue(accountId: string) {
  console.log('\n=== SCENARIO 6: Large Amounts + Overdue Priority ===');
  const result: ValidationResult = {
    scenario: 'Import high-value overdue invoices and observe queue priority',
    success: false,
    observations: [],
    friction_points: [],
    unexpected_behaviors: []
  };

  try {
    const file = await loadCsvFile('06-large-amounts-overdue.csv');
    const rows = await CsvIngestionService.parseFile(file);
    const preview = await CsvIngestionService.validateImport(rows, accountId);
    const commitResult = await CsvIngestionService.commitImport(preview, accountId);

    result.observations.push(`Imported ${commitResult.count} high-value invoices`);

    // Run scheduler
    const schedulerResult = await ReminderSchedulerService.runForAccount(accountId);
    result.observations.push(`Scheduler triggered ${schedulerResult.triggered_actions} actions`);

    // Check queue priority distribution
    const { data: queueItems } = await supabase
      .from('action_queue')
      .select('id, priority, payload')
      .eq('account_id', accountId)
      .order('created_at', { ascending: false })
      .limit(10);

    const priorityDistribution: Record<string, number> = {};
    queueItems?.forEach(q => {
      priorityDistribution[q.priority] = (priorityDistribution[q.priority] || 0) + 1;
    });

    result.observations.push(`Priority distribution: ${JSON.stringify(priorityDistribution)}`);

    // Check if high-value invoices get higher priority
    const highValueQueueItems = queueItems?.filter(q => {
      const amount = q.payload?.invoice?.amount_cents;
      return amount && amount > 1000000; // > $10,000
    });

    result.observations.push(`${highValueQueueItems?.length || 0} queue items for high-value invoices`);

    const highPriorityCount = highValueQueueItems?.filter(q => q.priority === 'high').length || 0;
    result.observations.push(`${highPriorityCount} marked as high priority`);

    if (highPriorityCount === 0 && (highValueQueueItems?.length || 0) > 0) {
      result.friction_points.push('High-value invoices not automatically prioritized (may be expected behavior)');
    }

    result.success = true;
  } catch (err: any) {
    result.observations.push(`ERROR: ${err.message}`);
    result.friction_points.push(`Scenario failed: ${err.message}`);
  }

  results.push(result);
}

async function scenario7_ActionQueueInteraction(accountId: string) {
  console.log('\n=== SCENARIO 7: Action Queue State Transitions ===');
  const result: ValidationResult = {
    scenario: 'Simulate user interactions with Action Queue',
    success: false,
    observations: [],
    friction_points: [],
    unexpected_behaviors: []
  };

  try {
    // Get pending_review items
    const { data: pendingItems } = await supabase
      .from('action_queue')
      .select('id, status, action_type')
      .eq('account_id', accountId)
      .eq('status', 'pending_review')
      .limit(3);

    result.observations.push(`Found ${pendingItems?.length || 0} pending_review items`);

    if (!pendingItems || pendingItems.length === 0) {
      result.friction_points.push('No pending_review items available for interaction testing');
      result.success = true;
      results.push(result);
      return;
    }

    // Test approve transition
    if (pendingItems[0]) {
      const { error: approveError } = await supabase
        .from('action_queue')
        .update({ status: 'approved' })
        .eq('id', pendingItems[0].id);

      if (approveError) {
        result.friction_points.push(`Approve transition failed: ${approveError.message}`);
      } else {
        result.observations.push('Approve transition: SUCCESS');
      }
    }

    // Test skip transition
    if (pendingItems[1]) {
      const { error: skipError } = await supabase
        .from('action_queue')
        .update({ status: 'skipped' })
        .eq('id', pendingItems[1].id);

      if (skipError) {
        result.friction_points.push(`Skip transition failed: ${skipError.message}`);
      } else {
        result.observations.push('Skip transition: SUCCESS');
      }
    }

    // Test edit transition (update payload)
    if (pendingItems[2]) {
      const { data: originalItem } = await supabase
        .from('action_queue')
        .select('payload')
        .eq('id', pendingItems[2].id)
        .single();

      const updatedPayload = {
        ...originalItem?.payload,
        draft: {
          ...originalItem?.payload?.draft,
          subject: 'EDITED: ' + (originalItem?.payload?.draft?.subject || 'Subject')
        }
      };

      const { error: editError } = await supabase
        .from('action_queue')
        .update({
          status: 'edited',
          payload: updatedPayload
        })
        .eq('id', pendingItems[2].id);

      if (editError) {
        result.friction_points.push(`Edit transition failed: ${editError.message}`);
      } else {
        result.observations.push('Edit transition: SUCCESS');
      }
    }

    // Verify final states
    const { data: updatedItems } = await supabase
      .from('action_queue')
      .select('id, status')
      .in('id', pendingItems.map(i => i.id));

    result.observations.push(`Final states: ${updatedItems?.map(i => i.status).join(', ')}`);

    result.success = true;
  } catch (err: any) {
    result.observations.push(`ERROR: ${err.message}`);
    result.friction_points.push(`Scenario failed: ${err.message}`);
  }

  results.push(result);
}

async function scenario8_SchedulerIdempotency(accountId: string) {
  console.log('\n=== SCENARIO 8: Scheduler Idempotency (Double Run) ===');
  const result: ValidationResult = {
    scenario: 'Run scheduler twice and verify no duplicate queue items',
    success: false,
    observations: [],
    friction_points: [],
    unexpected_behaviors: []
  };

  try {
    // First run
    const run1 = await ReminderSchedulerService.runForAccount(accountId);
    result.observations.push(`Run 1: triggered=${run1.triggered_actions}, skipped_idempotent=${run1.skipped_idempotent}`);

    // Second run (immediate)
    const run2 = await ReminderSchedulerService.runForAccount(accountId);
    result.observations.push(`Run 2: triggered=${run2.triggered_actions}, skipped_idempotent=${run2.skipped_idempotent}`);

    if (run2.triggered_actions > 0) {
      result.unexpected_behaviors.push(`Second scheduler run triggered ${run2.triggered_actions} actions (expected 0 due to idempotency)`);
    }

    if (run2.skipped_idempotent === 0 && run1.triggered_actions > 0) {
      result.friction_points.push('Idempotent skips not being recorded properly');
    }

    // Check for duplicate queue items
    const { data: queueItems } = await supabase
      .from('action_queue')
      .select('invoice_id, action_type, created_at')
      .eq('account_id', accountId)
      .order('created_at', { ascending: false });

    const duplicates = new Map<string, number>();
    queueItems?.forEach(item => {
      const key = `${item.invoice_id}-${item.action_type}`;
      duplicates.set(key, (duplicates.get(key) || 0) + 1);
    });

    const duplicateCount = Array.from(duplicates.values()).filter(count => count > 1).length;
    result.observations.push(`Found ${duplicateCount} invoice+action_type combinations with multiple queue items`);

    if (duplicateCount > 0) {
      result.friction_points.push(`Potential duplicate queue items detected (may be legitimate if from different stages)`);
    }

    result.success = true;
  } catch (err: any) {
    result.observations.push(`ERROR: ${err.message}`);
    result.friction_points.push(`Scenario failed: ${err.message}`);
  }

  results.push(result);
}

async function printResults() {
  console.log('\n\n' + '='.repeat(80));
  console.log('REAL USAGE VALIDATION RESULTS');
  console.log('='.repeat(80));

  results.forEach((result, index) => {
    console.log(`\n[${index + 1}] ${result.scenario}`);
    console.log(`Status: ${result.success ? '✓ SUCCESS' : '✗ FAILED'}`);

    if (result.observations.length > 0) {
      console.log('\nObservations:');
      result.observations.forEach(obs => console.log(`  - ${obs}`));
    }

    if (result.friction_points.length > 0) {
      console.log('\n⚠ Friction Points:');
      result.friction_points.forEach(fp => console.log(`  ! ${fp}`));
    }

    if (result.unexpected_behaviors.length > 0) {
      console.log('\n⚡ Unexpected Behaviors:');
      result.unexpected_behaviors.forEach(ub => console.log(`  ⚡ ${ub}`));
    }

    console.log('-'.repeat(80));
  });

  // Summary
  const successCount = results.filter(r => r.success).length;
  const totalFriction = results.reduce((sum, r) => sum + r.friction_points.length, 0);
  const totalUnexpected = results.reduce((sum, r) => sum + r.unexpected_behaviors.length, 0);

  console.log('\n' + '='.repeat(80));
  console.log('SUMMARY');
  console.log('='.repeat(80));
  console.log(`Scenarios: ${successCount}/${results.length} successful`);
  console.log(`Total Friction Points: ${totalFriction}`);
  console.log(`Total Unexpected Behaviors: ${totalUnexpected}`);
  console.log('='.repeat(80));
}

async function scenario9_PromiseBlocking(accountId: string) {
  console.log('\n=== SCENARIO 9: Promise Blocking ===');
  const result: ValidationResult = {
    scenario: 'Create active promise and ensure scheduler skips invoice',
    success: false,
    observations: [],
    friction_points: [],
    unexpected_behaviors: []
  };

  try {
    // 1. Create test invoice
    const invNo = `INV-PROMISE-${Date.now()}`;
    const { data: inv, error: invErr } = await supabase
      .from('invoices')
      .insert({
        account_id: accountId,
        invoice_number: invNo,
        amount_cents: 100000,
        currency: 'USD',
        due_date: '2026-04-01',
        issued_date: '2026-03-20',
        status: 'overdue'
      })
      .select('id')
      .single();

    if (invErr) throw invErr;
    result.observations.push(`Created overdue invoice ${invNo}`);

    // 2. Create contact link (enforced)
    const { data: contact } = await supabase.from('contacts').select('id').eq('account_id', accountId).limit(1).single();
    await supabase.from('invoice_contact_links').insert({
      account_id: accountId,
      invoice_id: inv.id,
      contact_id: contact.id,
      contact_type: 'primary'
    });

    // 3. Create active promise
    await supabase.from('promises').insert({
      account_id: accountId,
      invoice_id: inv.id,
      contact_id: contact.id,
      promised_date: '2026-05-01',
      status: 'active'
    });
    result.observations.push('Created active promise for invoice');

    // 4. Run scheduler
    const schedulerResult = await ReminderSchedulerService.runForAccount(accountId);
    result.observations.push(`Scheduler result: skipped_promise=${schedulerResult.skipped_promise}`);

    // 5. Verify scheduler_state
    const { data: state } = await supabase
      .from('scheduler_state')
      .select('status, reason')
      .eq('invoice_id', inv.id)
      .single();

    result.observations.push(`Scheduler state: status=${state?.status}, reason=${state?.reason}`);

    if (state?.status !== 'skipped' || state?.reason !== 'active_promise') {
      result.unexpected_behaviors.push(`Expected skipped/active_promise, got ${state?.status}/${state?.reason}`);
    } else {
      result.success = true;
    }
  } catch (err: any) {
    result.observations.push(`ERROR: ${err.message}`);
    result.friction_points.push(`Scenario failed: ${err.message}`);
  }

  results.push(result);
}

async function scenario10_DisputeBlocking(accountId: string) {
  console.log('\n=== SCENARIO 10: Dispute Blocking ===');
  const result: ValidationResult = {
    scenario: 'Create dispute queue item and ensure scheduler blocks',
    success: false,
    observations: [],
    friction_points: [],
    unexpected_behaviors: []
  };

  try {
    // 1. Create test invoice
    const invNo = `INV-DISPUTE-${Date.now()}`;
    const { data: inv, error: invErr } = await supabase
      .from('invoices')
      .insert({
        account_id: accountId,
        invoice_number: invNo,
        amount_cents: 100000,
        currency: 'USD',
        due_date: '2026-04-01',
        issued_date: '2026-03-20',
        status: 'overdue'
      })
      .select('id')
      .single();

    if (invErr) throw invErr;
    result.observations.push(`Created overdue invoice ${invNo}`);

    // 2. Create contact link (enforced)
    const { data: contact } = await supabase.from('contacts').select('id').eq('account_id', accountId).limit(1).single();
    await supabase.from('invoice_contact_links').insert({
      account_id: accountId,
      invoice_id: inv.id,
      contact_id: contact.id,
      contact_type: 'primary'
    });

    // 3. Create dispute in queue
    await supabase.from('action_queue').insert({
      account_id: accountId,
      invoice_id: inv.id,
      contact_id: contact.id,
      action_type: 'dispute_review',
      status: 'pending_review',
      payload: { classification: { category: 'dispute' } }
    });
    result.observations.push('Created dispute item in Action Queue');

    // 4. Run scheduler
    const schedulerResult = await ReminderSchedulerService.runForAccount(accountId);
    result.observations.push(`Scheduler result: skipped_dispute=${schedulerResult.skipped_dispute}`);

    // 5. Verify scheduler_state
    const { data: state } = await supabase
      .from('scheduler_state')
      .select('status, reason')
      .eq('invoice_id', inv.id)
      .single();

    result.observations.push(`Scheduler state: status=${state?.status}, reason=${state?.reason}`);

    if (state?.status !== 'skipped' || state?.reason !== 'dispute_exists') {
      result.unexpected_behaviors.push(`Expected skipped/dispute_exists, got ${state?.status}/${state?.reason}`);
    } else {
      result.success = true;
    }
  } catch (err: any) {
    result.observations.push(`ERROR: ${err.message}`);
    result.friction_points.push(`Scenario failed: ${err.message}`);
  }

  results.push(result);
}

async function main() {
  console.log('Starting Real Usage Validation...\n');
  console.log('Current time: 2026-04-19T09:41:54.980Z');
  console.log('Today is 2026-04-19 (used for overdue calculations)\n');

  try {
    const accountId = await getTestAccount();
    console.log(`Using test account: ${accountId}\n`);

    await scenario1_BasicImport(accountId);
    await scenario2_DueTodayScheduler(accountId);
    await scenario3_OverdueStages(accountId);
    await scenario4_ValidationEdgeCases(accountId);
    await scenario5_DuplicateContacts(accountId);
    await scenario6_LargeAmountsOverdue(accountId);
    await scenario7_ActionQueueInteraction(accountId);
    await scenario8_SchedulerIdempotency(accountId);
    await scenario9_PromiseBlocking(accountId);
    await scenario10_DisputeBlocking(accountId);

    await printResults();
  } catch (err: any) {
    console.error('\nFATAL ERROR:', err.message);
    console.error(err.stack);
    process.exit(1);
  }
}

main();
