import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('ai', () => ({
  generateObject: vi.fn(),
  zodSchema: vi.fn((schema: unknown) => schema),
}));

vi.mock('../agents/model', () => ({
  getChatModel: vi.fn(() => 'mock-model'),
}));

import { generateObject } from 'ai';
import { classifyIntent } from '../agents/router.agent';
import type { ModelMessage } from 'ai';

const mockedGenerateObject = vi.mocked(generateObject);

function userMessage(content: string): ModelMessage[] {
  return [{ role: 'user', content }];
}

describe('classifyIntent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('routes order-related messages to the order agent', async () => {
    mockedGenerateObject.mockResolvedValueOnce({
      object: { agentType: 'order' },
    } as any);

    const result = await classifyIntent(userMessage('Where is my order SW-1001?'));
    expect(result).toBe('order');
  });

  it('routes billing-related messages to the billing agent', async () => {
    mockedGenerateObject.mockResolvedValueOnce({
      object: { agentType: 'billing' },
    } as any);

    const result = await classifyIntent(userMessage('I need a refund for my last invoice'));
    expect(result).toBe('billing');
  });

  it('routes general messages to the support agent', async () => {
    mockedGenerateObject.mockResolvedValueOnce({
      object: { agentType: 'support' },
    } as any);

    const result = await classifyIntent(userMessage('Hello, I have a question'));
    expect(result).toBe('support');
  });

  it('defaults to support when the LLM call fails', async () => {
    mockedGenerateObject.mockRejectedValueOnce(new Error('API rate limit'));

    const result = await classifyIntent(userMessage('Something random'));
    expect(result).toBe('support');
  });

  it('passes conversation context to the model', async () => {
    mockedGenerateObject.mockResolvedValueOnce({
      object: { agentType: 'order' },
    } as any);

    const messages: ModelMessage[] = [
      { role: 'user', content: 'Hi there' },
      { role: 'assistant', content: 'Hello! How can I help?' },
      { role: 'user', content: 'Track my order' },
    ];

    await classifyIntent(messages);

    expect(mockedGenerateObject).toHaveBeenCalledWith(
      expect.objectContaining({
        messages,
        model: 'mock-model',
      }),
    );
  });
});
