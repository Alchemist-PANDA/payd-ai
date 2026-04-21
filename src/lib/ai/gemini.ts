import { AiProvider } from './types';
import { ReplyClassification, PromiseExtraction, EmailDraft, Invoice, Contact } from '../../../packages/shared/src/types/contracts';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemma-4-31b-it:generateContent';

export class GeminiProvider implements AiProvider {
  private async makeRequestWithBackoff(prompt: string, systemPrompt?: string): Promise<string> {
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not set');
    }

    const payload: any = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2,
      },
    };

    if (systemPrompt) {
      payload.systemInstruction = { parts: [{ text: systemPrompt }] };
    }

    const maxRetries = 3;
    const baseDelay = 2000;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(`${API_URL}?key=${GEMINI_API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (response.status === 429) {
          if (attempt === maxRetries) throw new Error('Rate limit exceeded after max retries');
          const delay = baseDelay * Math.pow(2, attempt);
          console.warn(`[Gemini] Rate limit hit. Retrying in ${delay}ms...`);
          await new Promise(res => setTimeout(res, delay));
          continue;
        }

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Gemini API error: ${response.status} ${errorText}`);
        }

        const data = await response.json();
        const parts = data.candidates?.[0]?.content?.parts || [];

        // Filter out thought parts (Gemini API returns thought: true for reasoning steps)
        const finalParts = parts.filter((p: any) => !p.thought);
        const text = finalParts.map((p: any) => p.text).join('');

        if (!text) {
           throw new Error('Invalid response format from Gemini');
        }

        return this.parseThoughtChannel(text);
      } catch (error: any) {
        if (attempt === maxRetries) throw error;
        // If not a 429 but some other fetch error (e.g. network), we might retry or throw
        if (error.message.includes('Rate limit')) {
           throw error; // handled in the loop
        } else {
           throw error; // fail fast on non-429
        }
      }
    }
    throw new Error('Unreachable');
  }

  private parseThoughtChannel(text: string): string {
    // Even after filtering thought parts, the model might output markdown ```json blocks
    let cleaned = text.trim();
    const codeBlockRegex = /```(?:json)?\s*([\s\S]*?)```/;
    const match = cleaned.match(codeBlockRegex);
    if (match && match[1]) {
      cleaned = match[1];
    } else {
       // If no code block, try to find the first '{' and last '}'
       const firstBrace = cleaned.indexOf('{');
       const lastBrace = cleaned.lastIndexOf('}');
       if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
           cleaned = cleaned.substring(firstBrace, lastBrace + 1);
       }
    }

    return cleaned.trim();
  }

  async classifyReply(emailBody: string): Promise<ReplyClassification> {
    console.log('[Gemini] Classifying reply...');

    const systemPrompt = `You are an expert accounts receivable classifier.
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

Return ONLY JSON with these fields:
- category: string
- confidence: number (0.0 to 1.0)
- requires_human_review: boolean
`;

    const prompt = `Email Content:\n"""\n${emailBody}\n"""\n\nClassify this reply.`;

    try {
      const responseText = await this.makeRequestWithBackoff(prompt, systemPrompt);
      const parsed = JSON.parse(responseText);

      return {
        category: parsed.category,
        // Conservative confidence threshold for interim provider
        confidence: parsed.confidence,
        requires_human_review: parsed.confidence < 0.80 || parsed.category === 'dispute' || parsed.requires_human_review,
        extracted_data: parsed.extracted_data
      };
    } catch (error: any) {
      console.warn(`[Gemini] Classification failed: ${error.message}. Routing to human review.`);
      throw error; // Will be caught by QueueIngestionService fallback
    }
  }

  async extractPromise(emailBody: string, referenceDate: string): Promise<PromiseExtraction> {
    console.log(`[Gemini] Extracting promise... Ref Date: ${referenceDate}`);

    const systemPrompt = `You are an expert financial debt collection analyst. Your goal is to extract specific payment promises from email threads.

RULES:
- Return ONLY valid JSON with fields: promised_date (YYYY-MM-DD or null), amount_cents (number or null), confidence (0.0-1.0), rationale (string), requires_human_review (boolean).
- If a date is relative (e.g., "next Friday"), calculate it from the reference date provided.
- If the language is weak or indirect ("will try", "should be soon", "sent to bank", "processing"), set promised_date: null and set requires_human_review: true.
- Confidence must be low if the statement is vague or if multiple dates are mentioned without clear commitment.
- Set requires_human_review: true if there is any ambiguity, a dispute mentioned, or if the language is not a firm commitment.
- Do NOT use coercive or illegal collection language in your rationale.`;

    const prompt = `Reference Date: ${referenceDate}\nEmail Content:\n"""\n${emailBody}\n"""\n\nExtract promise.`;

    try {
      const responseText = await this.makeRequestWithBackoff(prompt, systemPrompt);
      const parsed = JSON.parse(responseText);

      return {
        promised_date: parsed.promised_date,
        amount_cents: parsed.amount_cents,
        confidence: parsed.confidence,
        rationale: parsed.rationale,
        requires_human_review: parsed.confidence < 0.80 || parsed.requires_human_review
      };
    } catch (error: any) {
       console.warn(`[Gemini] Promise extraction failed: ${error.message}`);
       throw error;
    }
  }

  async generateDraft(invoice: Invoice, contact: Contact, context: string): Promise<EmailDraft> {
    console.log(`[Gemini] Generating draft for Invoice: ${invoice.invoice_number}`);

    const systemPrompt = `You are a professional accounts receivable assistant for Payd AI.
Your goal is to draft a reminder email that is firm yet professional and preserves the business relationship.

CONSTRAINTS:
- No legal threats.
- No coercive language.
- Mention the specific invoice number and amount.
- Be concise.
- Output ONLY JSON with "subject", "body_text", "confidence", and "rationale".`;

    const prompt = `Contact Name: ${contact.name}\nInvoice Number: ${invoice.invoice_number}\nAmount: ${(invoice.amount_cents / 100).toFixed(2)} ${invoice.currency}\nContext: ${context}\n\nGenerate draft.`;

    try {
      const responseText = await this.makeRequestWithBackoff(prompt, systemPrompt);
      const parsed = JSON.parse(responseText);

      return {
        subject: parsed.subject,
        body_text: parsed.body_text,
        confidence: parsed.confidence,
        rationale: parsed.rationale
      };
    } catch (error: any) {
       console.warn(`[Gemini] Draft generation failed: ${error.message}`);
       throw error;
    }
  }
}
