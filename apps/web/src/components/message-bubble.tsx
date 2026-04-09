import type { Message } from '../types';
import { AgentBadge } from './agent-badge';

interface Props {
  message: Message;
}

export function MessageBubble({ message }: Props) {
  const isUser = message.role === 'user';

  return (
    <div className={`message ${isUser ? 'message--user' : 'message--assistant'}`}>
      {!isUser && message.agentType && <AgentBadge agentType={message.agentType} />}
      <div className="message__bubble">
        <p className="message__text">{message.content}</p>
      </div>
      <time className="message__time">
        {new Date(message.createdAt).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </time>
    </div>
  );
}
