import { GeminiProvider } from '../src/lib/ai/gemini';
import { Invoice, Contact } from '../packages/shared/src/types/contracts';

async function main() {
  console.log('='.repeat(80));
  console.log('GEMMA 4 31B SMOKE TEST (10 Fixtures)');
  console.log('='.repeat(80));

  const provider = new GeminiProvider();
  let successCount = 0;
  let failureCount = 0;
  const parsingIssues: string[] = [];

  const fixtures = [
    { type: 'classify', input: "We will pay this next Friday, guaranteed." },
    { type: 'classify', input: "I'm out of the office until Monday." },
    { type: 'classify', input: "This invoice is wrong, the amount should be 500." },
    { type: 'classify', input: "We are processing this internally." },
    { type: 'promise', input: "We will pay this next Friday, guaranteed.", refDate: "2026-04-20" },
    { type: 'promise', input: "I'll try to get to it soon.", refDate: "2026-04-20" },
    { type: 'promise', input: "Payment has already been initiated.", refDate: "2026-04-20" },
    { type: 'draft', invoice: { invoice_number: 'INV-001', amount_cents: 150000, currency: 'USD', status: 'overdue' }, contact: { name: 'Acme Corp' }, context: 'Stage 3 reminder' },
    { type: 'draft', invoice: { invoice_number: 'INV-002', amount_cents: 50000, currency: 'USD', status: 'pending' }, contact: { name: 'Globex' }, context: 'Stage 0 due today' },
    { type: 'classify', input: "Just sent the wire, should clear tomorrow." }
  ];

  for (let i = 0; i < fixtures.length; i++) {
    const fixture = fixtures[i];
    console.log(`\n[Test ${i+1}] Type: ${fixture.type}`);
    try {
      if (fixture.type === 'classify') {
        const res = await provider.classifyReply(fixture.input as string);
        console.log(`  Result: ${res.category} (Conf: ${res.confidence})`);
      } else if (fixture.type === 'promise') {
        const res = await provider.extractPromise(fixture.input as string, fixture.refDate as string);
        console.log(`  Result: ${res.promised_date} (Conf: ${res.confidence})`);
      } else if (fixture.type === 'draft') {
        const res = await provider.generateDraft(fixture.invoice as any, fixture.contact as any, fixture.context as string);
        console.log(`  Result: ${res.subject}`);
      }
      successCount++;
    } catch (err: any) {
      console.error(`  Error: ${err.message}`);
      parsingIssues.push(`[Test ${i+1}] ${err.message}`);
      failureCount++;
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('RESULTS');
  console.log('='.repeat(80));
  console.log(`Model Slug: gemma-4-31b-it`);
  console.log(`Successes: ${successCount}`);
  console.log(`Failures: ${failureCount}`);
  if (parsingIssues.length > 0) {
    console.log(`Parsing Issues:`);
    parsingIssues.forEach(i => console.log(`  - ${i}`));
  }
}

main();