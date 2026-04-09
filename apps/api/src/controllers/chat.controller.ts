import { getDb } from '../lib/db';
import { ApiError } from '../lib/errors';
import * as conversationService from '../services/conversation.service';
import * as chatService from '../services/chat.service';
import * as routerAgent from '../agents/router.agent';
import * as supportAgent from '../agents/support.agent';
import * as orderAgent from '../agents/order.agent';
import * as billingAgent from '../agents/billing.agent';
import type { AgentContext, AgentStreamResult, RoutableAgentType } from '../agents/types';

const AGENT_MAP: Record<RoutableAgentType, { invoke: (ctx: AgentContext) => AgentStreamResult }> = {
  support: supportAgent,
  order: orderAgent,
  billing: billingAgent,
};

export async function listConversations(customerId?: string) {
  const { db } = getDb();
  return conversationService.list(db, customerId);
}

export async function getConversation(id: string) {
  const { db } = getDb();
  const conversation = await conversationService.getById(db, id);

  if (!conversation) {
    throw ApiError.notFound(`Conversation ${id} not found`);
  }

  return conversation;
}

export async function deleteConversation(id: string) {
  const { db } = getDb();
  const deleted = await conversationService.remove(db, id);

  if (!deleted) {
    throw ApiError.notFound(`Conversation ${id} not found`);
  }

  return { id: deleted.id };
}

export async function sendMessage(input: {
  conversationId?: string;
  customerId: string;
  content: string;
}) {
  const { db } = getDb();

  const { conversationId } = await chatService.sendMessage(db, input);

  const recentMessages = await chatService.getRecentMessages(db, conversationId);
  const contextMessages = chatService.buildContextMessages(recentMessages);

  const agentType = await routerAgent.classifyIntent(contextMessages);

  const ctx: AgentContext = {
    db,
    customerId: input.customerId,
    conversationId,
    messages: contextMessages,
  };

  const result = AGENT_MAP[agentType].invoke(ctx);

  result.text
    .then(async (fullText) => {
      if (fullText) {
        await chatService.saveAssistantMessage(db, conversationId, agentType, fullText);
      }
    })
    .catch((err: unknown) => {
      console.error('Failed to persist assistant message:', err);
    });

  const response = result.toDataStreamResponse({
    headers: {
      'X-Conversation-Id': conversationId,
      'X-Agent-Type': agentType,
    },
  });

  return { response };
}
