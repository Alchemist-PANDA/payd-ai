
import fs from 'fs';
import path from 'path';
import { ReplyClassifierService } from '../src/lib/ai/ReplyClassifier';
import { PromiseExtractorService } from '../src/lib/ai/PromiseExtractor';

/**
 * PHASE 4 EVALUATION HARNESS (Hardened Foundation)
 * Runs AI services over Golden Set and generates accuracy reports.
 */

interface EvalFixture {
  id: string;
  raw_email_text: string;
  expected_classification: string;
  expected_promised_date: string | null;
  expected_requires_human_review: boolean;
  notes: string;
}

interface EvalResult {
  fixture_id: string;
  classification_match: boolean;
  date_match: boolean;
  review_flag_match: boolean;
  actual_classification: string;
  actual_promised_date: string | null;
  actual_confidence: number;
  actual_requires_review: boolean;
  error?: string;
  error_type?: 'rate_limit' | 'parsing' | 'network' | 'auth' | 'other';
  is_fallback: boolean;
  retry_count: number;
  model_prediction: boolean;
  skipped: boolean;
}

const BASE_DELAY_MS = Number(process.env.EVAL_BASE_DELAY_MS || 900);
const MAX_RETRIES = Number(process.env.EVAL_MAX_RETRIES || 4);
const SUBSET_LIMIT = process.env.EVAL_SUBSET_LIMIT ? Number(process.env.EVAL_SUBSET_LIMIT) : null;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function classifyErrorType(errorMessage?: string): 'rate_limit' | 'parsing' | 'network' | 'auth' | 'other' {
  const msg = (errorMessage || '').toLowerCase();
  if (msg.includes('429') || msg.includes('rate limit') || msg.includes('capacity')) return 'rate_limit';
  if (msg.includes('malformed response') || msg.includes('parse') || msg.includes('json')) return 'parsing';
  if (msg.includes('connection error') || msg.includes('network')) return 'network';
  if (msg.includes('401') || msg.includes('invalid api key') || msg.includes('unauthorized')) return 'auth';
  return 'other';
}

function isRetryableError(errorMessage?: string): boolean {
  const type = classifyErrorType(errorMessage);
  return type === 'rate_limit' || type === 'network';
}

function computeBackoffMs(attempt: number): number {
  const jitter = Math.floor(Math.random() * 200);
  return BASE_DELAY_MS * Math.pow(2, attempt - 1) + jitter;
}

async function classifyWithRetry(emailBody: string, fixtureId: string): Promise<{ classification: Awaited<ReturnType<typeof ReplyClassifierService.classify>>; retry_count: number }> {
  let attempt = 0;

  while (attempt <= MAX_RETRIES) {
    attempt += 1;
    const startedAt = new Date().toISOString();
    console.log(`[Eval][${fixtureId}] classify start attempt=${attempt} at=${startedAt}`);

    const classification = await ReplyClassifierService.classify(emailBody);

    if (!classification.error) {
      console.log(`[Eval][${fixtureId}] classify success attempt=${attempt}`);
      return { classification, retry_count: attempt - 1 };
    }

    const errorType = classifyErrorType(classification.error);
    console.log(`[Eval][${fixtureId}] classify failure attempt=${attempt} error_type=${errorType} error=${classification.error}`);

    if (attempt > MAX_RETRIES) {
      return { classification, retry_count: attempt - 1 };
    }

    if (!isRetryableError(classification.error) && classifyErrorType(classification.error) !== 'parsing') {
      return { classification, retry_count: attempt - 1 };
    }

    const backoffMs = computeBackoffMs(attempt);
    console.log(`[Eval][${fixtureId}] retrying after ${backoffMs}ms`);
    await sleep(backoffMs);
  }

  return {
    classification: {
      category: 'other',
      confidence: 0,
      requires_human_review: true,
      error: 'Retry loop exhausted unexpectedly'
    },
    retry_count: MAX_RETRIES
  };
}

function computePrecision(results: EvalResult[], fixtures: EvalFixture[], category: string): number {
  const predicted = results.filter(r => !r.is_fallback && r.actual_classification === category);
  if (predicted.length === 0) return 0;

  const truePositive = predicted.filter(r => {
    const fixture = fixtures.find(f => f.id === r.fixture_id);
    return fixture?.expected_classification === category;
  }).length;

  return truePositive / predicted.length;
}

function computeRecall(results: EvalResult[], fixtures: EvalFixture[], category: string): number {
  const actualCategoryFixtures = fixtures.filter(f => f.expected_classification === category);
  if (actualCategoryFixtures.length === 0) return 0;

  const truePositive = results.filter(r => {
    const fixture = fixtures.find(f => f.id === r.fixture_id);
    return !r.is_fallback && fixture?.expected_classification === category && r.actual_classification === category;
  }).length;

  return truePositive / actualCategoryFixtures.length;
}

async function runEvaluation() {
  const fixturesPath = path.resolve(__dirname, '../docs/evals/golden_set/initial_fixtures.json');
  const allFixtures: EvalFixture[] = JSON.parse(fs.readFileSync(fixturesPath, 'utf8'));
  const fixtures = SUBSET_LIMIT ? allFixtures.slice(0, SUBSET_LIMIT) : allFixtures;
  const referenceDate = '2026-04-18';

  const results: EvalResult[] = [];
  let totalRetries = 0;

  console.log(`[Eval] Running harness over ${fixtures.length} fixtures...`);

  for (const fixture of fixtures) {
    const { classification, retry_count } = await classifyWithRetry(fixture.raw_email_text, fixture.id);
    totalRetries += retry_count;

    let extraction: { promised_date: string | null; confidence: number } = { promised_date: null, confidence: 0 };
    if (classification.category === 'explicit_promise' && !classification.error) {
      extraction = await PromiseExtractorService.extract(fixture.raw_email_text, referenceDate);
    }

    const errorType = classifyErrorType(classification.error);

    results.push({
      fixture_id: fixture.id,
      classification_match: !classification.error && classification.category === fixture.expected_classification,
      date_match: !classification.error && extraction.promised_date === fixture.expected_promised_date,
      review_flag_match: !classification.error && classification.requires_human_review === fixture.expected_requires_human_review,
      actual_classification: classification.category,
      actual_promised_date: extraction.promised_date,
      actual_confidence: classification.confidence,
      actual_requires_review: classification.requires_human_review,
      error: classification.error,
      error_type: classification.error ? errorType : undefined,
      is_fallback: !!classification.error,
      retry_count,
      model_prediction: !classification.error,
      skipped: false,
    });

    if (results.length % 10 === 0) {
      console.log(`[Eval] Processed ${results.length}/${fixtures.length}...`);
    }

    await sleep(BASE_DELAY_MS);
  }

  const totalFixtures = fixtures.length;
  const successfulCalls = results.filter(r => r.model_prediction).length;
  const failedCalls = results.filter(r => r.is_fallback).length;
  const failureRate = failedCalls / totalFixtures;
  const isValid = failureRate < 0.05;

  const summary = {
    total: totalFixtures,
    successful_calls: successfulCalls,
    failed_calls: failedCalls,
    failure_rate: failureRate,
    retry_count: totalRetries,
    fallback_count: failedCalls,
    model_prediction_count: successfulCalls,
    skipped_count: results.filter(r => r.skipped).length,
    is_valid_run: isValid,
    classification_accuracy: successfulCalls > 0 ? results.filter(r => r.model_prediction && r.classification_match).length / successfulCalls : 0,
    review_gate_safety: successfulCalls > 0 ? results.filter(r => r.model_prediction && r.review_flag_match).length / successfulCalls : 0,
    explicit_promise_precision: computePrecision(results, fixtures, 'explicit_promise'),
    weak_payment_signal_precision: computePrecision(results, fixtures, 'weak_payment_signal'),
    paid_claim_recall: computeRecall(results, fixtures, 'paid_claim'),
    dispute_recall: computeRecall(results, fixtures, 'dispute'),
    timestamp: new Date().toISOString(),
    run_mode: SUBSET_LIMIT ? `subset_${SUBSET_LIMIT}` : 'full_200',
    throttle_ms_between_calls: BASE_DELAY_MS,
    max_retries_per_call: MAX_RETRIES,
  };

  const reportPath = path.resolve(__dirname, '../docs/evals/latest_report.json');
  fs.writeFileSync(reportPath, JSON.stringify({ summary, results }, null, 2));

  console.log(`[Eval] Report generated: ${reportPath}`);
  console.log('[Eval] Summary:', summary);

  if (!isValid) {
    console.warn('[Eval] WARNING: RUN IS INVALID DUE TO HIGH API FAILURE RATE');
  }
}

runEvaluation();
