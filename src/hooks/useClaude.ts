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

  const ollamaModel = options.model || 'mistral';

  const sendMessage = async (userMessage: string) => {
    setLoading(true);
    setError(null);

    try {
      const newMessages = [...messages, { role: 'user' as const, content: userMessage }];
      setMessages(newMessages);

      const response = await fetch('/api/ollama/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: ollamaModel,
          messages: [
            { role: 'system', content: 'Assistente código especialista: React, TypeScript, Node.js. PT-BR. Respostas diretas e técnicas.' },
            ...newMessages,
          ],
          stream: false,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || `Erro ${response.status}`);
      }

      const data = await response.json();
      const assistantMessage = data.message?.content || 'Sem resposta do modelo.';

      setMessages([...newMessages, { role: 'assistant', content: assistantMessage }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
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
