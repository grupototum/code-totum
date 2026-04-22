import { useState } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface UsClaudeOptions {
  apiKey?: string;
  model?: string;
}

export const useClaude = (options: UsClaudeOptions = {}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiKey = options.apiKey || import.meta.env.VITE_CLAUDE_API_KEY;
  const model = options.model || 'claude-3-5-sonnet-20241022';

  const sendMessage = async (userMessage: string) => {
    setLoading(true);
    setError(null);

    try {
      const newMessages = [...messages, { role: 'user' as const, content: userMessage }];
      setMessages(newMessages);

      // Demo mode: always use demo for now while testing
      const demoResponse = `Olá! Você disse: "${userMessage}"

Estou em modo de teste. A resposta real do Claude será implementada em breve.`;

      setMessages([...newMessages, { role: 'assistant', content: demoResponse }]);
      setLoading(false);
      return;

      const apiUrl = import.meta.env.VITE_API_URL;
      console.log('Calling API at:', apiUrl + '/api/claude');

      const response = await fetch(apiUrl + '/api/claude', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          max_tokens: 1024,
          messages: newMessages,
        }),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', errorData);
        throw new Error(`Claude API error: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('API Response:', data);

      const assistantMessage = data.content[0].text;

      setMessages([...newMessages, { role: 'assistant', content: assistantMessage }]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Error in sendMessage:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const clearMessages = () => {
    setMessages([]);
    setError(null);
  };

  return {
    messages,
    loading,
    error,
    sendMessage,
    clearMessages,
  };
};
