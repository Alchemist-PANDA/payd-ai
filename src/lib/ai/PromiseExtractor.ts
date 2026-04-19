import { aiProvider } from './index';
import { type PromiseExtraction } from '../../../packages/shared/src/types/contracts';

/**
 * PROMISE EXTRACTOR (Phase 3 Intelligence)
 * Extraction-first, Human-review-always logic.
 * Uses the active AI provider (Mock in dev, Anthropic when unblocked).
 */

export class PromiseExtractorService {
  static async extract(emailBody: string, referenceDate: string): Promise<PromiseExtraction> {
    return aiProvider.extractPromise(emailBody, referenceDate);
  }
}
