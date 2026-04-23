import { useState } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface UsClaudeOptions {
  model?: string;
}

export const useClaude = (options: UsClaudeOptions = {}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const model = options.model || 'claude-3-5-sonnet-20241022';

  const sendMessage = async (userMessage: string) => {
    setLoading(true);
    setError(null);

    try {
      const newMessages = [...messages, { role: 'user' as const, content: userMessage }];
      setMessages(newMessages);

      const response = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, max_tokens: 1024, messages: newMessages }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Claude API error: ${response.statusText}`);
      }

      const data = await response.json();
      const assistantMessage = data.content[0].text;

      setMessages([...newMessages, { role: 'assistant', content: assistantMessage }]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const clearMessages = () => {
    setMessages([]);
    setError(null);
  };

  return { messages, loading, error, sendMessage, clearMessages };
};
