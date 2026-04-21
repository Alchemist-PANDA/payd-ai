import { MockAiProvider } from './mock';
import { AnthropicProvider } from './provider-anthropic';
import { GeminiProvider } from './gemini';
import { AiProvider } from './types';

// Deterministic mock provider is the default for local development.
const providerConfig = process.env.AI_PROVIDER || 'mock';

let activeProvider: AiProvider;

if (providerConfig === 'gemini' && process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'dummy') {
  console.log('[AI Foundation] Using Gemma 4 31B (Interim Provider)');
  activeProvider = new GeminiProvider();
} else if (providerConfig === 'gemini') {
  console.warn('[AI Foundation] GEMINI_API_KEY missing or invalid. Falling back to Mock Provider.');
  activeProvider = new MockAiProvider();
} else if (providerConfig === 'anthropic') {
  console.log('[AI Foundation] Attempting to use Anthropic Provider...');
  if (process.env.NODE_ENV === 'production' && process.env.ENABLE_LIVE_AI !== 'true') {
     console.warn('[AI Foundation] LIVE AI IS BLOCKED. Falling back to Mock Provider.');
     activeProvider = new MockAiProvider();
  } else {
     activeProvider = new AnthropicProvider();
  }
} else {
  console.log('[AI Foundation] Using Deterministic Mock AI Provider (Review-First Mode)');
  activeProvider = new MockAiProvider();
}

// Fallback wrapper to ensure deterministic behavior on failures
export const aiProvider: AiProvider = {
  async classifyReply(emailBody: string) {
    try {
      return await activeProvider.classifyReply(emailBody);
    } catch (error) {
      console.warn('[AI Wrapper] Provider failed, falling back to deterministic mock.');
      const mock = new MockAiProvider();
      return mock.classifyReply(emailBody);
    }
  },
  async extractPromise(emailBody: string, referenceDate: string) {
    try {
      return await activeProvider.extractPromise(emailBody, referenceDate);
    } catch (error) {
      console.warn('[AI Wrapper] Provider failed, falling back to deterministic mock.');
      const mock = new MockAiProvider();
      return mock.extractPromise(emailBody, referenceDate);
    }
  },
  async generateDraft(invoice: any, contact: any, context: string) {
    try {
      return await activeProvider.generateDraft(invoice, contact, context);
    } catch (error) {
      console.warn('[AI Wrapper] Provider failed, falling back to deterministic mock.');
      const mock = new MockAiProvider();
      return mock.generateDraft(invoice, contact, context);
    }
  }
};

