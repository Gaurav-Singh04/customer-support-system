import { eq, desc } from 'drizzle-orm';
import { messages, customers, type DatabaseClient } from '@swades/db';
import type { ModelMessage } from 'ai';
import * as conversationService from './conversation.service';
import { ApiError } from '../lib/errors';
import type { RoutableAgentType } from '../agents/types';

const CONTEXT_WINDOW_SIZE = 20;

interface SendMessageInput {
  conversationId?: string;
  customerId: string;
  content: string;
}

export async function sendMessage(db: DatabaseClient, input: SendMessageInput) {
  const customer = await db.query.customers.findFirst({
    where: eq(customers.id, input.customerId),
  });

  if (!customer) {
    throw ApiError.notFound(`Customer ${input.customerId} not found`);
  }

  let resolvedConversationId: string;

  if (input.conversationId) {
    const existing = await conversationService.getById(db, input.conversationId);
    if (!existing) {
      throw ApiError.notFound(`Conversation ${input.conversationId} not found`);
    }
    resolvedConversationId = input.conversationId;
  } else {
    const subject = input.content.slice(0, 80) + (input.content.length > 80 ? '…' : '');
    const conv = await conversationService.create(db, {
      customerId: input.customerId,
      subject,
    });
    resolvedConversationId = conv.id;
  }

  const [userMessage] = await db
    .insert(messages)
    .values({
      conversationId: resolvedConversationId,
      role: 'user',
      content: input.content,
    })
    .returning();

  await conversationService.touch(db, resolvedConversationId);

  return { conversationId: resolvedConversationId, message: userMessage };
}

export async function getRecentMessages(
  db: DatabaseClient,
  conversationId: string,
  limit = CONTEXT_WINDOW_SIZE,
) {
  const rows = await db.query.messages.findMany({
    where: eq(messages.conversationId, conversationId),
    orderBy: [desc(messages.createdAt)],
    limit,
  });
  return rows.reverse();
}

export function buildContextMessages(
  dbMessages: { role: string; content: string }[],
): ModelMessage[] {
  return dbMessages.map((m) => ({
    role: m.role as 'user' | 'assistant' | 'system',
    content: m.content,
  }));
}

export async function saveAssistantMessage(
  db: DatabaseClient,
  conversationId: string,
  agentType: RoutableAgentType,
  content: string,
) {
  const [row] = await db
    .insert(messages)
    .values({
      conversationId,
      role: 'assistant',
      agentType,
      content,
    })
    .returning();

  await conversationService.touch(db, conversationId);
  return row;
}
