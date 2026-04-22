import React, { useState } from 'react';
import { CodeHubLayout } from './../../components/layout/CodeHubLayout';
import { ChatInterface } from './../../components/chat/ChatInterface';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './../../components/ui/card';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

export const Ada: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSend = async (content: string) => {
    // Add user message
    setMessages((prev) => [
      ...prev,
      { role: 'user', content, timestamp: new Date().toLocaleTimeString() },
    ]);

    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Ada is ready to help you with code analysis. This is a placeholder response.',
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
      setLoading(false);
    }, 1000);
  };

  return (
    <CodeHubLayout>
      <div className="h-full flex flex-col">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold">Ada</h1>
          <p className="text-sm text-muted-foreground">AI-powered code analysis</p>
        </div>

        <div className="flex-1 overflow-hidden">
          <ChatInterface
            messages={messages}
            onSend={handleSend}
            isLoading={loading}
            placeholder="Ask Ada for code analysis..."
          />
        </div>
      </div>
    </CodeHubLayout>
  );
};
