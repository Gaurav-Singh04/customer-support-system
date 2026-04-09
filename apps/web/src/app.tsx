import { useState } from 'react';
import type { Customer } from './types';
import { useConversations } from './hooks/use-conversations';
import { useChat } from './hooks/use-chat';
import { ConversationSidebar } from './components/conversation-sidebar';
import { ChatView } from './components/chat-view';

const CUSTOMERS: Customer[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    firstName: 'Maya',
    lastName: 'Patel',
    email: 'maya.patel@example.com',
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    firstName: 'Lucas',
    lastName: 'Chen',
    email: 'lucas.chen@example.com',
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    firstName: 'Olivia',
    lastName: 'Brooks',
    email: 'olivia.brooks@example.com',
  },
];

export function App() {
  const [customerId, setCustomerId] = useState(CUSTOMERS[0].id);
  const conversations = useConversations(customerId);
  const chat = useChat(customerId);

  function handleSelectConversation(id: string) {
    chat.loadConversation(id);
  }

  function handleNewChat() {
    chat.reset();
  }

  async function handleSend(content: string) {
    await chat.send(content);
    conversations.reload();
  }

  async function handleDeleteConversation(id: string) {
    await conversations.remove(id);
    if (chat.conversationId === id) {
      chat.reset();
    }
  }

  function handleChangeCustomer(id: string) {
    setCustomerId(id);
  }

  return (
    <div className="app-layout">
      <ConversationSidebar
        customers={CUSTOMERS}
        customerId={customerId}
        onChangeCustomer={handleChangeCustomer}
        conversations={conversations.conversations}
        activeConversationId={chat.conversationId}
        onSelect={handleSelectConversation}
        onNewChat={handleNewChat}
        onDelete={handleDeleteConversation}
        loading={conversations.loading}
      />
      <ChatView
        messages={chat.messages}
        streamingContent={chat.streamingContent}
        streamingAgentType={chat.streamingAgentType}
        isStreaming={chat.isStreaming}
        loading={chat.loading}
        onSend={handleSend}
        conversationId={chat.conversationId}
      />
    </div>
  );
}
