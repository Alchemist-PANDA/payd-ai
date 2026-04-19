import { anthropic, validateAiConfig } from './anthropic';
import { AiProvider } from './types';
import { ReplyClassification, PromiseExtraction, EmailDraft, Invoice, Contact } from '../../../packages/shared/src/types/contracts';

const CLASSIFIER_SYSTEM = `You are an expert accounts receivable classifier.
Use the following frozen taxonomy:
- explicit_promise: Firm commitment + concrete date.
- weak_payment_signal: Intent/Process but no firm date (e.g., "will try", "processing", "sent to bank", "should be soon", "awaiting approval", "checking with finance").
- paid_claim: Assertion of past/initiated payment (e.g., "paid", "sent yesterday", "check in mail", "initiated", "wire sent", "done", "processed", "handled").
- dispute: Challenges, complaints, hardship, or hostility.
- out_of_office: Standard OOO.
- other: Neutral, uninformative, or forwarding ("noted", "okay", "forwarded to Mike").

STRICT DETERMINISTIC RULES:
1. TERSE SIGNALS: "Done", "Sent", "Processed", and "Handled" MUST be classified as paid_claim if payment is the implied context.
2. WEAK SIGNAL BIAS: Phrases containing "try", "hope", "expect", "should", "soon", "processing", "awaiting", "pending", "internal approval", or "AP" MUST be weak_payment_signal.
3. PAID vs PROMISE: "Check is in the mail", "already sent", or "initiated" MUST be paid_claim.
4. DISPUTE OVERRIDE: Any complaint or financial hardship overrides any promise signal.
5. QUOTED THREADS: IGNORE all text below "--- Original Message ---" or "From:". Only classify the NEWEST reply.
6. CONFIDENCE: Set confidence < 0.8 for any signal under 5 words.

Return ONLY JSON.`;

const EXTRACT_PROMISE_SYSTEM = `You are an expert financial debt collection analyst. Your goal is to extract specific payment promises from email threads.

RULES:
- Return ONLY valid JSON.
- If a date is relative (e.g., "next Friday"), calculate it from the reference date provided.
- If the language is weak or indirect ("will try", "should be soon", "sent to bank", "processing"), set promised_date: null and set requires_human_review: true.
- Confidence must be low if the statement is vague or if multiple dates are mentioned without clear commitment.
- Set requires_human_review: true if there is any ambiguity, a dispute mentioned, or if the language is not a firm commitment.
- Do NOT use coercive or illegal collection language in your rationale.`;

const DRAFT_SYSTEM = `You are a professional accounts receivable assistant for Payd AI.
Your goal is to draft a reminder email that is firm yet professional and preserves the business relationship.

CONSTRAINTS:
- No legal threats.
- No coercive language.
- Mention the specific invoice number and amount.
- Be concise.
- Output ONLY JSON with "subject" and "body_text".`;

function extractTextFromResponse(response: any): string {
  const blocks = Array.isArray(response?.content) ? response.content : [];
  if (blocks.length > 0) {
    const textBlock = blocks.find((block: any) => block?.type === 'text' && typeof block.text === 'string');
    if (textBlock) {
      return textBlock.text;
    }

    const fallbackText = blocks
      .map((block: any) => (typeof block?.text === 'string' ? block.text : ''))
      .join('\n')
      .trim();

    if (fallbackText) {
      return fallbackText;
    }
  }

  // OpenAI-compatible fallback (proxy returns chat.completion shape)
  const choices = Array.isArray(response?.choices) ? response.choices : [];
  const messageContent = choices[0]?.message?.content;
  if (typeof messageContent === 'string' && messageContent.trim().length > 0) {
    return messageContent;
  }

  throw new Error('Malformed response: no parseable text payload');
}

export class AnthropicProvider implements AiProvider {
  async classifyReply(emailBody: string): Promise<ReplyClassification> {
    validateAiConfig();

    try {
      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20240620',
        max_tokens: 512,
        system: CLASSIFIER_SYSTEM,
        messages: [{ role: 'user', content: emailBody }],
      });

      const content = extractTextFromResponse(response);
      const cleanJson = content.replace(/```json\n?|```/g, '').trim();
      const parsed = JSON.parse(cleanJson);

      return {
        category: parsed.category || 'other',
        confidence: parsed.confidence || 0,
        requires_human_review: parsed.requires_human_review || parsed.confidence < 0.8 || parsed.category === 'dispute',
        extracted_data: parsed.extracted_data || {}
      };
    } catch (err: any) {
      console.error('[AI] Classification failure:', err);
      return {
        category: 'other',
        confidence: 0,
        requires_human_review: true,
        error: err.message || 'Unknown classification error'
      };
    }
  }

  async extractPromise(emailBody: string, referenceDate: string): Promise<PromiseExtraction> {
    validateAiConfig();

    const prompt = `Reference Date: ${referenceDate}\nEmail Content:\n"""\n${emailBody}\n"""\n\nExtract the promised_date (YYYY-MM-DD), amount (if specified, otherwise null), and your confidence level (0-1). Provide a short rationale.`;

    try {
      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20240620',
        max_tokens: 1024,
        system: EXTRACT_PROMISE_SYSTEM,
        messages: [{ role: 'user', content: prompt }],
      });

      const content = extractTextFromResponse(response);
      const cleanJson = content.replace(/```json\n?|```/g, '').trim();
      const parsed = JSON.parse(cleanJson);

      return {
        promised_date: parsed.promised_date || null,
        amount_cents: parsed.amount ? Math.round(parsed.amount * 100) : null,
        confidence: parsed.confidence || 0,
        rationale: parsed.rationale || 'No rationale provided.',
        requires_human_review: parsed.requires_human_review || parsed.confidence < 0.8
      };
    } catch (err: any) {
      console.error('[AI] Extraction failure:', err);
      return {
        promised_date: null,
        amount_cents: null,
        confidence: 0,
        rationale: err.message || 'Failed to parse AI output.',
        requires_human_review: true
      };
    }
  }

  async generateDraft(invoice: Invoice, contact: Contact, context: string): Promise<EmailDraft> {
    validateAiConfig();

    const prompt = `Invoice: ${invoice.invoice_number}\nAmount: ${(invoice.amount_cents / 100).toFixed(2)} ${invoice.currency}\nContact: ${contact.name}\nAdditional Context: ${context}\n\nDraft a follow-up email.`;

    try {
      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20240620',
        max_tokens: 1024,
        system: DRAFT_SYSTEM,
        messages: [{ role: 'user', content: prompt }],
      });

      const content = extractTextFromResponse(response);
      const cleanJson = content.replace(/```json\n?|```/g, '').trim();
      const parsed = JSON.parse(cleanJson);

      return {
        subject: parsed.subject || 'Invoice Follow-up',
        body_text: parsed.body_text || '',
        confidence: 0.9,
        rationale: 'Generated based on invoice stage.'
      };
    } catch (err) {
      return {
        subject: 'Invoice Follow-up',
        body_text: 'Error generating draft.',
        confidence: 0,
        rationale: 'Parsing failed.'
      };
    }
  }
}
