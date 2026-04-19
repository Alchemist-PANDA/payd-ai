import { aiProvider } from './index';
import { type EmailDraft, type Invoice, type Contact } from '../../../packages/shared/src/types/contracts';

/**
 * DRAFT GENERATOR (Phase 3 Intelligence)
 * Human-in-the-loop email drafting.
 * Uses the active AI provider (Mock in dev, Anthropic when unblocked).
 */

export class DraftGeneratorService {
  static async generate(invoice: Invoice, contact: Contact, context: string): Promise<EmailDraft> {
    return aiProvider.generateDraft(invoice, contact, context);
  }
}
