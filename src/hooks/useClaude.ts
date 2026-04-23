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

      // Constrói prompt com histórico simplificado
      const historyText = newMessages.slice(-6).map(m =>
        `${m.role === 'user' ? 'Usuário' : 'Assistente'}: ${m.content}`
      ).join('\n');
      const prompt = `Assistente código: React/TS/Node/IA. PT-BR. Direto.\n\n${historyText}\nAssistente:`;

      const response = await fetch('/api/ollama/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: ollamaModel, prompt, stream: false }),
      });

      if (!response.ok) {
        throw new Error(`Erro ${response.status}`);
      }

      const text = await response.text();
      const data = JSON.parse(text);
      const assistantMessage = data.response || 'Sem resposta do modelo.';

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
