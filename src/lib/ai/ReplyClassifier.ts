import { aiProvider } from './index';
import { type ReplyClassification } from '../../../packages/shared/src/types/contracts';

/**
 * REPLY CLASSIFIER (Phase 3/4)
 * Categorizes inbound replies and extracts intent.
 * Uses the active AI provider (Mock in dev, Anthropic when unblocked).
 */

export class ReplyClassifierService {
  static async classify(emailBody: string): Promise<ReplyClassification> {
    return aiProvider.classifyReply(emailBody);
  }
}
