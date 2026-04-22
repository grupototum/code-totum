import React from 'react';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

interface ChatInterfaceProps {
  messages: Message[];
  onSend: (message: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  onSend,
  isLoading = false,
  placeholder = 'Type a message...',
}) => {
  return (
    <div className="flex flex-col h-full">
      <MessageList messages={messages} isLoading={isLoading} />
      <ChatInput
        onSend={onSend}
        isLoading={isLoading}
        placeholder={placeholder}
      />
    </div>
  );
};
