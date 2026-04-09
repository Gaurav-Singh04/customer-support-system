import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@swades/db', () => ({
  createDbStatus: vi.fn(() => 'configured'),
  createDatabaseClient: vi.fn(),
}));

vi.mock('../lib/db', () => {
  const mockDb = {
    query: {
      customers: { findFirst: vi.fn(), findMany: vi.fn() },
      conversations: { findFirst: vi.fn(), findMany: vi.fn() },
      messages: { findFirst: vi.fn(), findMany: vi.fn() },
      orders: { findFirst: vi.fn(), findMany: vi.fn() },
    },
    insert: vi.fn(() => ({ values: vi.fn(() => ({ returning: vi.fn(() => []) })) })),
    delete: vi.fn(() => ({ where: vi.fn(() => ({ returning: vi.fn(() => []) })) })),
    update: vi.fn(() => ({ set: vi.fn(() => ({ where: vi.fn() })) })),
  };
  return {
    getDb: vi.fn(() => ({ db: mockDb, pool: {} })),
  };
});

vi.mock('ai', () => ({
  generateObject: vi.fn(),
  streamText: vi.fn(),
  tool: vi.fn((config: any) => config),
  zodSchema: vi.fn((schema: unknown) => schema),
}));

vi.mock('../agents/model', () => ({
  getChatModel: vi.fn(() => 'mock-model'),
}));

import { app } from '../app';

describe('GET /api/health', () => {
  it('returns status ok with database info', async () => {
    const res = await app.request('/api/health');
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.status).toBe('ok');
    expect(body).toHaveProperty('database');
    expect(typeof body.database).toBe('string');
    expect(body.timestamp).toBeTruthy();
  });
});

describe('GET /api/agents/agents', () => {
  it('returns the list of agent definitions', async () => {
    const res = await app.request('/api/agents/agents');
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.agents).toHaveLength(3);
    expect(body.agents.map((a: any) => a.type).sort()).toEqual(['billing', 'order', 'support']);
  });
});

describe('GET /api/agents/:type/capabilities', () => {
  it('returns capabilities for a valid agent type', async () => {
    const res = await app.request('/api/agents/order/capabilities');
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.agent.type).toBe('order');
    expect(body.agent.tools).toContain('getCustomerOrders');
  });

  it('returns 404 for an unknown agent type', async () => {
    const res = await app.request('/api/agents/unknown/capabilities');
    expect(res.status).toBe(404);

    const body = await res.json();
    expect(body.error.code).toBe('NOT_FOUND');
  });
});

describe('POST /api/chat/messages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects a request with missing required fields', async () => {
    const res = await app.request('/api/chat/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    expect(res.status).toBe(400);
  });

  it('rejects a request with invalid customerId format', async () => {
    const res = await app.request('/api/chat/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerId: 'not-a-uuid',
        content: 'Hello',
      }),
    });

    expect(res.status).toBe(400);
  });

  it('rejects an empty content string', async () => {
    const res = await app.request('/api/chat/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerId: '11111111-1111-1111-1111-111111111111',
        content: '',
      }),
    });

    expect(res.status).toBe(400);
  });
});

describe('Unknown routes', () => {
  it('returns 404 with structured error for unmatched paths', async () => {
    const res = await app.request('/api/nonexistent');
    expect(res.status).toBe(404);

    const body = await res.json();
    expect(body.error.code).toBe('NOT_FOUND');
  });
});
