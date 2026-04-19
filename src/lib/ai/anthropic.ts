type ChatMessage = { role: 'user' | 'assistant' | 'system'; content: string };

type CreateParams = {
  model: string;
  max_tokens: number;
  system?: string;
  messages: ChatMessage[];
};

const xaiBaseUrl = process.env.XAI_BASE_URL || 'https://api.x.ai/v1';
const xaiApiKey = process.env.XAI_API_KEY || '';
const xaiModel = process.env.XAI_MODEL || 'grok-2-latest';

if (!xaiApiKey) {
  console.warn('[AI Foundation] XAI_API_KEY is not defined in environment.');
}

async function createMessage(params: CreateParams): Promise<any> {
  const systemPrompt = params.system?.trim();
  const requestMessages: ChatMessage[] = [];

  if (systemPrompt) {
    requestMessages.push({ role: 'system', content: systemPrompt });
  }

  requestMessages.push(...params.messages);

  const response = await fetch(`${xaiBaseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${xaiApiKey}`,
    },
    body: JSON.stringify({
      model: xaiModel,
      messages: requestMessages,
      max_tokens: params.max_tokens,
      temperature: 0,
    }),
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(`${response.status} ${JSON.stringify(payload)}`);
  }

  return payload;
}

export const anthropic = {
  messages: {
    create: createMessage,
  },
};

export function validateAiConfig() {
  if (!xaiApiKey) {
    throw new Error('XAI_API_KEY is missing. AI features disabled.');
  }
}

export function getAiRuntimeConfig() {
  return {
    provider: 'xAI',
    model: xaiModel,
    baseUrl: xaiBaseUrl,
  };
}
