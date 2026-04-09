export type AgentType = 'support' | 'order' | 'billing';

export interface AgentDefinition {
  type: AgentType;
  name: string;
  description: string;
  capabilities: string[];
  tools: string[];
}

const agents: Record<AgentType, AgentDefinition> = {
  support: {
    type: 'support',
    name: 'Support Agent',
    description: 'Handles general customer support inquiries and conversation context.',
    capabilities: [
      'View conversation history',
      'Summarise prior interactions',
      'Provide general product and policy answers',
      'Escalate to specialised agents when needed',
    ],
    tools: [
      'getConversationHistory',
      'getCustomerInfo',
    ],
  },
  order: {
    type: 'order',
    name: 'Order Agent',
    description: 'Tracks orders and delivery status for customers.',
    capabilities: [
      'Look up order details by order number or customer',
      'Track shipment and delivery events',
      'Report estimated delivery dates',
      'Identify delayed or cancelled orders',
    ],
    tools: [
      'getCustomerOrders',
      'getOrderDetails',
      'getOrderEvents',
    ],
  },
  billing: {
    type: 'billing',
    name: 'Billing Agent',
    description: 'Manages invoice and refund inquiries.',
    capabilities: [
      'Retrieve invoice details and payment status',
      'Check refund status and history',
      'Identify overdue balances',
      'Explain billing discrepancies',
    ],
    tools: [
      'getCustomerInvoices',
      'getInvoiceDetails',
      'getCustomerRefunds',
      'getRefundDetails',
    ],
  },
};

export function listAgents(): AgentDefinition[] {
  return Object.values(agents);
}

export function getAgentCapabilities(type: string): AgentDefinition | undefined {
  return agents[type as AgentType];
}
