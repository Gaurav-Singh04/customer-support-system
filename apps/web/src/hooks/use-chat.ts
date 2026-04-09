import { useState, useRef, useEffect, useCallback } from 'react';
import type { Message, AgentType } from '../types';
import * as api from '../lib/api';
import { parseDataStream } from '../lib/stream';

export function useChat(customerId: string) {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [streamingContent, setStreamingContent] = useState('');
  const [streamingAgentType, setStreamingAgentType] = useState<AgentType | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setConversationId(null);
    setMessages([]);
    setStreamingContent('');
    setStreamingAgentType(null);
    setIsStreaming(false);
    setLoading(false);
  }, []);

  useEffect(() => {
    reset();
  }, [customerId, reset]);

  const loadConversation = useCallback(async (id: string) => {
    abortRef.current?.abort();
    setLoading(true);
    setStreamingContent('');
    setStreamingAgentType(null);
    setIsStreaming(false);
    try {
      const data = await api.fetchConversation(id);
      setMessages(data.messages);
      setConversationId(id);
    } catch (err) {
      console.error('Failed to load conversation:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const send = useCallback(
    async (content: string): Promise<string | null> => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          conversationId: conversationId ?? '',
          role: 'user',
          agentType: null,
          content,
          createdAt: new Date().toISOString(),
        },
      ]);
      setIsStreaming(true);
      setStreamingContent('');
      setStreamingAgentType(null);

      let resultConversationId: string | null = null;

      try {
        const response = await api.sendMessage(
          { conversationId: conversationId ?? undefined, customerId, content },
          controller.signal,
        );

        const newConvId = response.headers.get('X-Conversation-Id');
        const agentType = (response.headers.get('X-Agent-Type') as AgentType) ?? null;

        if (newConvId) {
          setConversationId(newConvId);
          resultConversationId = newConvId;
        }
        setStreamingAgentType(agentType);

        let accumulated = '';
        await parseDataStream(response, {
          onText(text) {
            if (controller.signal.aborted) return;
            accumulated += text;
            setStreamingContent(accumulated);
          },
          onError(error) {
            console.error('Stream error:', error);
          },
        });

        if (!controller.signal.aborted && accumulated) {
          setMessages((prev) => [
            ...prev,
            {
              id: crypto.randomUUID(),
              conversationId: newConvId ?? conversationId ?? '',
              role: 'assistant',
              agentType,
              content: accumulated,
              createdAt: new Date().toISOString(),
            },
          ]);
        }
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Failed to send message:', err);
        }
      } finally {
        if (!controller.signal.aborted) {
          setStreamingContent('');
          setStreamingAgentType(null);
          setIsStreaming(false);
        }
      }

      return resultConversationId;
    },
    [conversationId, customerId],
  );

  return {
    conversationId,
    messages,
    streamingContent,
    streamingAgentType,
    isStreaming,
    loading,
    loadConversation,
    send,
    reset,
  };
}
