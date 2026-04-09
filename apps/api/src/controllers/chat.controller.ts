import { getDb } from '../lib/db';
import { ApiError } from '../lib/errors';
import * as conversationService from '../services/conversation.service';
import * as chatService from '../services/chat.service';

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
  return chatService.sendMessage(db, input);
}
