import { useState, useEffect } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface UsClaudeOptions {
  model?: string;
}

const STORAGE_KEY = 'claudio-history';

function loadHistory(): Message[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export const useClaude = (options: UsClaudeOptions = {}) => {
  const [messages, setMessages] = useState<Message[]>(loadHistory);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ollamaModel = options.model || 'mistral';

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

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
        signal: AbortSignal.timeout(60000),
      });

      if (!response.ok) {
        throw new Error(`Erro ${response.status}`);
      }

      const text = await response.text();
      const data = JSON.parse(text);
      if (!data.response) throw new Error(data.error || 'Sem resposta do modelo.');
      const assistantMessage = data.response;

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
    localStorage.removeItem(STORAGE_KEY);
  };

  return { messages, loading, error, sendMessage, clearMessages };
};
