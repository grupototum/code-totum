import React from 'react';
import { CodeHubLayout } from './../../components/layout/CodeHubLayout';
import { ChatInterface } from './../../components/chat/ChatInterface';
import { useClaude } from './../../hooks/useClaude';

export const Claudio: React.FC = () => {
  const { messages, loading, error, sendMessage } = useClaude();

  const handleSend = (content: string) => {
    sendMessage(content);
  };

  return (
    <CodeHubLayout>
      <div className="h-full flex flex-col">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold">Claudio</h1>
          <p className="text-sm text-muted-foreground">Claude API Integration</p>
          {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
        </div>

        <div className="flex-1 overflow-hidden">
          <ChatInterface
            messages={messages}
            onSend={handleSend}
            isLoading={loading}
            placeholder="Ask Claude a question..."
          />
        </div>
      </div>
    </CodeHubLayout>
  );
};
