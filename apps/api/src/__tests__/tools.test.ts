import { describe, it, expect } from 'vitest';
import { createOrderTools } from '../agents/tools/order-tools';
import { createBillingTools } from '../agents/tools/billing-tools';
import { createSupportTools } from '../agents/tools/support-tools';
import type { DatabaseClient } from '@swades/db';

const mockDb = {} as DatabaseClient;
const mockCustomerId = '11111111-1111-1111-1111-111111111111';

describe('createOrderTools', () => {
  const tools = createOrderTools(mockDb, mockCustomerId);

  it('exposes getCustomerOrders, getOrderDetails, and getOrderEvents', () => {
    expect(tools).toHaveProperty('getCustomerOrders');
    expect(tools).toHaveProperty('getOrderDetails');
    expect(tools).toHaveProperty('getOrderEvents');
  });

  it('does not expose billing or support tools', () => {
    const toolNames = Object.keys(tools);
    expect(toolNames).not.toContain('getCustomerInvoices');
    expect(toolNames).not.toContain('getConversationHistory');
  });

  it('each tool has a description and execute function', () => {
    for (const [, t] of Object.entries(tools)) {
      expect(t).toHaveProperty('description');
      expect(t).toHaveProperty('execute');
      expect(typeof (t as any).execute).toBe('function');
    }
  });
});

describe('createBillingTools', () => {
  const tools = createBillingTools(mockDb, mockCustomerId);

  it('exposes getCustomerInvoices, getInvoiceDetails, getCustomerRefunds, and getRefundDetails', () => {
    expect(tools).toHaveProperty('getCustomerInvoices');
    expect(tools).toHaveProperty('getInvoiceDetails');
    expect(tools).toHaveProperty('getCustomerRefunds');
    expect(tools).toHaveProperty('getRefundDetails');
  });

  it('does not expose order or support tools', () => {
    const toolNames = Object.keys(tools);
    expect(toolNames).not.toContain('getCustomerOrders');
    expect(toolNames).not.toContain('getConversationHistory');
  });

  it('each tool has a description and execute function', () => {
    for (const [, t] of Object.entries(tools)) {
      expect(t).toHaveProperty('description');
      expect(t).toHaveProperty('execute');
      expect(typeof (t as any).execute).toBe('function');
    }
  });
});

describe('createSupportTools', () => {
  const tools = createSupportTools(mockDb, mockCustomerId);

  it('exposes getConversationHistory and getCustomerInfo', () => {
    expect(tools).toHaveProperty('getConversationHistory');
    expect(tools).toHaveProperty('getCustomerInfo');
  });

  it('does not expose order or billing tools', () => {
    const toolNames = Object.keys(tools);
    expect(toolNames).not.toContain('getCustomerOrders');
    expect(toolNames).not.toContain('getCustomerInvoices');
  });
});
