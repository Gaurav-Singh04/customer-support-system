import { describe, it, expect } from 'vitest';
import { listAgents, getAgentCapabilities } from '../agents/capabilities';

describe('listAgents', () => {
  it('returns all three agent definitions', () => {
    const agents = listAgents();
    expect(agents).toHaveLength(3);
    expect(agents.map((a) => a.type).sort()).toEqual(['billing', 'order', 'support']);
  });

  it('each agent has required fields', () => {
    for (const agent of listAgents()) {
      expect(agent.type).toBeTruthy();
      expect(agent.name).toBeTruthy();
      expect(agent.description).toBeTruthy();
      expect(agent.capabilities.length).toBeGreaterThan(0);
      expect(agent.tools.length).toBeGreaterThan(0);
    }
  });
});

describe('getAgentCapabilities', () => {
  it('returns the support agent definition', () => {
    const agent = getAgentCapabilities('support');
    expect(agent).toBeDefined();
    expect(agent!.name).toBe('Support Agent');
    expect(agent!.tools).toContain('getConversationHistory');
    expect(agent!.tools).toContain('getCustomerInfo');
  });

  it('returns the order agent definition', () => {
    const agent = getAgentCapabilities('order');
    expect(agent).toBeDefined();
    expect(agent!.name).toBe('Order Agent');
    expect(agent!.tools).toContain('getCustomerOrders');
    expect(agent!.tools).toContain('getOrderDetails');
    expect(agent!.tools).toContain('getOrderEvents');
  });

  it('returns the billing agent definition', () => {
    const agent = getAgentCapabilities('billing');
    expect(agent).toBeDefined();
    expect(agent!.name).toBe('Billing Agent');
    expect(agent!.tools).toContain('getCustomerInvoices');
    expect(agent!.tools).toContain('getInvoiceDetails');
    expect(agent!.tools).toContain('getCustomerRefunds');
    expect(agent!.tools).toContain('getRefundDetails');
  });

  it('returns undefined for an unknown agent type', () => {
    expect(getAgentCapabilities('unknown')).toBeUndefined();
  });
});
