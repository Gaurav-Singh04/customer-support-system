import { describe, it, expect } from 'vitest';
import { buildContextMessages } from '../services/chat.service';

describe('buildContextMessages', () => {
  it('converts DB messages to ModelMessage format', () => {
    const dbMessages = [
      { role: 'user', content: 'Hello' },
      { role: 'assistant', content: 'Hi there!' },
      { role: 'user', content: 'Track my order' },
    ];

    const result = buildContextMessages(dbMessages);

    expect(result).toEqual([
      { role: 'user', content: 'Hello' },
      { role: 'assistant', content: 'Hi there!' },
      { role: 'user', content: 'Track my order' },
    ]);
  });

  it('returns an empty array for no messages', () => {
    expect(buildContextMessages([])).toEqual([]);
  });

  it('preserves message order', () => {
    const dbMessages = [
      { role: 'user', content: 'First' },
      { role: 'assistant', content: 'Second' },
      { role: 'user', content: 'Third' },
      { role: 'assistant', content: 'Fourth' },
    ];

    const result = buildContextMessages(dbMessages);
    expect(result.map((m) => m.content)).toEqual(['First', 'Second', 'Third', 'Fourth']);
  });
});
