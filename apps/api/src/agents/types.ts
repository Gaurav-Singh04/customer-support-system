import type { DatabaseClient } from '@swades/db';
import type { ModelMessage } from 'ai';

export type RoutableAgentType = 'support' | 'order' | 'billing';

export interface AgentContext {
  db: DatabaseClient;
  customerId: string;
  conversationId: string;
  messages: ModelMessage[];
}

export interface AgentStreamResult {
  readonly text: Promise<string>;
  toDataStreamResponse(options?: {
    headers?: Record<string, string>;
  }): Response;
}
