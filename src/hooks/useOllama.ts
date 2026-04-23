import { useState } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface UseOllamaOptions {
  baseUrl?: string;
  model?: string;
}

export const useOllama = (options: UseOllamaOptions = {}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const model = options.model || import.meta.env.VITE_OLLAMA_MODEL || 'mistral';

  const sendMessage = async (userMessage: string) => {
    setLoading(true);
    setError(null);

    try {
      const newMessages = [...messages, { role: 'user' as const, content: userMessage }];
      setMessages(newMessages);

      const response = await fetch(`/api/ollama/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          prompt: userMessage,
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`);
      }

      const data = await response.json();
      const assistantMessage = data.response;

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

  return {
    messages,
    loading,
    error,
    sendMessage,
    clearMessages,
  };
};
