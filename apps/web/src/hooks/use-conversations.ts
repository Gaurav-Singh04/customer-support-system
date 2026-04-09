import { useState, useEffect, useCallback } from 'react';
import type { ConversationSummary } from '../types';
import * as api from '../lib/api';

export function useConversations(customerId: string) {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.fetchConversations(customerId);
      setConversations(data);
    } catch (err) {
      console.error('Failed to load conversations:', err);
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  useEffect(() => {
    load();
  }, [load]);

  const remove = useCallback(async (id: string) => {
    try {
      await api.deleteConversation(id);
      setConversations((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error('Failed to delete conversation:', err);
    }
  }, []);

  return { conversations, loading, reload: load, remove };
}
