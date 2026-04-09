import { useEffect, useRef } from 'react';
import type { Message, AgentType } from '../types';
import { MessageBubble } from './message-bubble';
import { TypingIndicator } from './typing-indicator';
import { MessageComposer } from './message-composer';
import { EmptyState } from './empty-state';
import { AgentBadge } from './agent-badge';

interface Props {
  messages: Message[];
  streamingContent: string;
  streamingAgentType: AgentType | null;
  isStreaming: boolean;
  loading: boolean;
  onSend: (content: string) => void;
  conversationId: string | null;
}

export function ChatView({
  messages,
  streamingContent,
  streamingAgentType,
  isStreaming,
  loading,
  onSend,
}: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: isStreaming ? 'auto' : 'smooth' });
  }, [messages, streamingContent, isStreaming]);

  const showEmpty = !loading && messages.length === 0;

  return (
    <main className="chat">
      <div className="chat__messages">
        {loading ? (
          <div className="chat__loading">
            <div className="chat__spinner" />
          </div>
        ) : showEmpty ? (
          <EmptyState
            title="Start a conversation"
            description="Send a message to begin chatting with our support team."
          />
        ) : (
          <>
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            {isStreaming && (
              <div className="message message--assistant message--streaming">
                {streamingAgentType && <AgentBadge agentType={streamingAgentType} />}
                {streamingContent ? (
                  <div className="message__bubble">
                    <p className="message__text">
                      {streamingContent}
                      <span className="message__cursor" />
                    </p>
                  </div>
                ) : (
                  <TypingIndicator agentType={streamingAgentType} />
                )}
              </div>
            )}
          </>
        )}
        <div ref={bottomRef} />
      </div>
      <MessageComposer onSend={onSend} disabled={isStreaming} />
    </main>
  );
}
