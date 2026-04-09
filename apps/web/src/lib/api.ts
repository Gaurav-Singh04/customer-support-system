import type { ConversationSummary, ConversationDetail } from '../types';

const API_BASE = '/api';

export async function fetchConversations(customerId?: string): Promise<ConversationSummary[]> {
  const params = customerId ? `?customerId=${customerId}` : '';
  const res = await fetch(`${API_BASE}/chat/conversations${params}`);
  if (!res.ok) throw new Error('Failed to fetch conversations');
  const data = await res.json();
  return data.conversations;
}

export async function fetchConversation(id: string): Promise<ConversationDetail> {
  const res = await fetch(`${API_BASE}/chat/conversations/${id}`);
  if (!res.ok) throw new Error('Failed to fetch conversation');
  const data = await res.json();
  return data.conversation;
}

export async function deleteConversation(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/chat/conversations/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete conversation');
}

export async function sendMessage(
  body: { conversationId?: string; customerId: string; content: string },
  signal?: AbortSignal,
): Promise<Response> {
  const res = await fetch(`${API_BASE}/chat/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  });
  if (!res.ok) throw new Error(await res.text().catch(() => 'Failed to send message'));
  return res;
}
