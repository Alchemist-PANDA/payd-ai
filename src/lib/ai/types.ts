import { ReplyClassification, PromiseExtraction, EmailDraft, Invoice, Contact } from '../../../packages/shared/src/types/contracts';

export interface AiProvider {
  /**
   * Categorizes inbound replies and extracts intent.
   */
  classifyReply(emailBody: string): Promise<ReplyClassification>;

  /**
   * Extracts specific payment promises from email threads.
   */
  extractPromise(emailBody: string, referenceDate: string): Promise<PromiseExtraction>;

  /**
   * Drafts a follow-up reminder email.
   */
  generateDraft(invoice: Invoice, contact: Contact, context: string): Promise<EmailDraft>;
}
