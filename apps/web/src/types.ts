export type AgentType = 'support' | 'order' | 'billing' | 'fallback';

export interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  agentType: AgentType | null;
  content: string;
  createdAt: string;
}

export interface ConversationSummary {
  id: string;
  customerId: string;
  subject: string;
  status: 'open' | 'resolved' | 'closed';
  createdAt: string;
  updatedAt: string;
  customer: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  lastMessage: {
    content: string;
    role: string;
    createdAt: string;
  } | null;
}

export interface ConversationDetail {
  id: string;
  customerId: string;
  subject: string;
  status: 'open' | 'resolved' | 'closed';
  createdAt: string;
  updatedAt: string;
  customer: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  messages: Message[];
}

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}
