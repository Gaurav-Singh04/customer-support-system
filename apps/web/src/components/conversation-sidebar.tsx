import type { ConversationSummary, Customer } from '../types';

interface Props {
  customers: Customer[];
  customerId: string;
  onChangeCustomer: (id: string) => void;
  conversations: ConversationSummary[];
  activeConversationId: string | null;
  onSelect: (id: string) => void;
  onNewChat: () => void;
  onDelete: (id: string) => void;
  loading: boolean;
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffDays === 0) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return date.toLocaleDateString([], { weekday: 'short' });
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function truncate(text: string, maxLen: number): string {
  return text.length > maxLen ? text.slice(0, maxLen) + '\u2026' : text;
}

export function ConversationSidebar({
  customers,
  customerId,
  onChangeCustomer,
  conversations,
  activeConversationId,
  onSelect,
  onNewChat,
  onDelete,
  loading,
}: Props) {
  return (
    <aside className="sidebar">
      <div className="sidebar__header">
        <h1 className="sidebar__title">Conversations</h1>
        <select
          className="sidebar__customer-select"
          value={customerId}
          onChange={(e) => onChangeCustomer(e.target.value)}
        >
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.firstName} {c.lastName}
            </option>
          ))}
        </select>
      </div>

      <button className="sidebar__new-chat" onClick={onNewChat}>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
        New conversation
      </button>

      <div className="sidebar__list">
        {loading ? (
          <div className="sidebar__loading">
            {[1, 2, 3].map((i) => (
              <div key={i} className="sidebar__skeleton" />
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <p className="sidebar__empty">No conversations yet</p>
        ) : (
          conversations.map((conv) => (
            <div
              key={conv.id}
              className={`conversation-item ${conv.id === activeConversationId ? 'conversation-item--active' : ''}`}
              onClick={() => onSelect(conv.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && onSelect(conv.id)}
            >
              <div className="conversation-item__header">
                <span className="conversation-item__subject">{truncate(conv.subject, 40)}</span>
                <span className="conversation-item__time">
                  {conv.lastMessage ? formatTime(conv.lastMessage.createdAt) : ''}
                </span>
              </div>
              {conv.lastMessage && (
                <p className="conversation-item__preview">
                  {truncate(conv.lastMessage.content, 60)}
                </p>
              )}
              <div className="conversation-item__meta">
                <span
                  className={`conversation-item__status conversation-item__status--${conv.status}`}
                >
                  {conv.status}
                </span>
                <button
                  className="conversation-item__delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(conv.id);
                  }}
                  aria-label="Delete conversation"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}
