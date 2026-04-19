import { MockAiProvider } from '../mock';

describe('MockAiProvider', () => {
  const provider = new MockAiProvider();

  describe('classifyReply', () => {
    it('should classify dispute signals', async () => {
      const result = await provider.classifyReply('This invoice is wrong and we are not paying.');
      expect(result.category).toBe('dispute');
      expect(result.confidence).toBeGreaterThan(0.9);
      expect(result.requires_human_review).toBe(true);
    });

    it('should classify paid claims', async () => {
      const result = await provider.classifyReply('We already paid this yesterday.');
      expect(result.category).toBe('paid_claim');
      expect(result.confidence).toBeGreaterThan(0.9);
      expect(result.requires_human_review).toBe(true); // Phase 4: Review-first enforced
    });

    it('should classify explicit promises', async () => {
      const result = await provider.classifyReply('We will pay on next Friday.');
      expect(result.category).toBe('explicit_promise');
      expect(result.confidence).toBeGreaterThan(0.8);
      expect(result.requires_human_review).toBe(true); // Phase 4: Review-first enforced
    });

    it('should classify weak payment signals', async () => {
      const result = await provider.classifyReply('We are processing this internally.');
      expect(result.category).toBe('weak_payment_signal');
      expect(result.requires_human_review).toBe(true);
    });

    it('should classify out of office', async () => {
      const result = await provider.classifyReply('I am out of office until Monday.');
      expect(result.category).toBe('out_of_office');
      expect(result.confidence).toBeGreaterThan(0.95);
    });

    it('should default to other for neutral messages', async () => {
      const result = await provider.classifyReply('Noted, thanks.');
      expect(result.category).toBe('other');
      expect(result.requires_human_review).toBe(true);
    });
  });

  describe('extractPromise', () => {
    it('should extract explicit promise with date', async () => {
      const result = await provider.extractPromise('We will pay on next Friday.', '2026-04-18');
      expect(result.promised_date).toBe('2026-04-24');
      expect(result.amount_cents).toBe(50000);
      expect(result.confidence).toBeGreaterThan(0.8);
      expect(result.requires_human_review).toBe(true); // Phase 4: Review-first enforced
    });

    it('should return null for vague promises', async () => {
      const result = await provider.extractPromise('We will try to pay soon.', '2026-04-18');
      expect(result.promised_date).toBeNull();
      expect(result.requires_human_review).toBe(true);
    });
  });

  describe('generateDraft', () => {
    it('should generate professional reminder email', async () => {
      const invoice = {
        id: 'inv-1',
        invoice_number: 'INV-001',
        amount_cents: 100000,
        currency: 'USD'
      } as any;

      const contact = {
        id: 'contact-1',
        name: 'John Doe'
      } as any;

      const result = await provider.generateDraft(invoice, contact, 'First reminder');

      expect(result.subject).toContain('INV-001');
      expect(result.body_text).toContain('John Doe');
      expect(result.body_text).toContain('1000.00');
      expect(result.confidence).toBeGreaterThan(0.9);
    });
  });
});
