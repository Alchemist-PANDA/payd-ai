import { ReminderSchedulerService } from '../src/services/scheduler/ReminderSchedulerService';

async function main() {
  console.log('[Scheduler] Starting reminder scheduler run...');

  try {
    const results = await ReminderSchedulerService.runForAllAccounts();

    console.log('[Scheduler] Completed. Summary:');
    for (const r of results) {
      console.log(`- account=${r.account_id} scanned=${r.scanned_invoices} eligible=${r.eligible_invoices} triggered=${r.triggered_actions} skipped_paid=${r.skipped_paid} skipped_promise=${r.skipped_promise} skipped_dispute=${r.skipped_dispute} skipped_idempotent=${r.skipped_idempotent} errors=${r.errors.length}`);
    }

    const totalErrors = results.reduce((acc, r) => acc + r.errors.length, 0);
    if (totalErrors > 0) {
      console.error(`[Scheduler] Completed with ${totalErrors} errors across accounts.`);
      process.exitCode = 1;
    }
  } catch (err: any) {
    console.error('[Scheduler] Fatal run failure:', err?.message || err);
    process.exit(1);
  }
}

main();
