import { MockAiProvider } from './mock';
import { AnthropicProvider } from './provider-anthropic';
import { AiProvider } from './types';

// Deterministic mock provider is the default for local development.
// It does not require any API keys and prevents live model calls.
const useMock = process.env.NODE_ENV === 'development' || process.env.USE_MOCK_AI === 'true';

let activeProvider: AiProvider;

if (useMock) {
  console.log('[AI Foundation] Using Deterministic Mock AI Provider (Review-First Mode)');
  activeProvider = new MockAiProvider();
} else {
  // Real Anthropic provider is currently blocked pending Phase 4 validation.
  // We throw if someone tries to use it in production without being unblocked.
  console.log('[AI Foundation] Attempting to use Anthropic Provider...');

  if (process.env.NODE_ENV === 'production' && process.env.ENABLE_LIVE_AI !== 'true') {
     console.warn('[AI Foundation] LIVE AI IS BLOCKED. Falling back to Mock Provider.');
     activeProvider = new MockAiProvider();
  } else {
     activeProvider = new AnthropicProvider();
  }
}

export const aiProvider = activeProvider;
