import { useState, useEffect, useRef, useCallback } from 'react';

export type AgentStatus = 'idle' | 'thinking' | 'executing' | 'error' | 'disconnected';
export type Provider = 'opencode' | 'claude-fallback' | 'unknown';

export interface AgentMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  type?: 'text' | 'code' | 'diff' | 'plan';
  timestamp: Date;
}

export interface PlanStep {
  id: number;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  type: 'read' | 'write' | 'execute' | 'test';
}

interface UseOpenCodeOptions {
  serverUrl?: string;
  model?: string;
  context?: string;
}

const SERVER_URL = '';
const WS_URL = `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}`;

export function useOpenCode(options: UseOpenCodeOptions = {}) {
  const { model = 'claude-3-5-sonnet-20241022', context = '' } = options;

  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [status, setStatus] = useState<AgentStatus>('disconnected');
  const [provider, setProvider] = useState<Provider>('unknown');
  const [isConnected, setIsConnected] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<PlanStep[] | undefined>();
  const [modifiedFiles, setModifiedFiles] = useState<string[]>([]);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout>>();
  const pendingContent = useRef('');

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const ws = new WebSocket(`${WS_URL}/api/opencode/stream`);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      setStatus('idle');
    };

    ws.onclose = () => {
      setIsConnected(false);
      setStatus('disconnected');
      // Reconecta após 3s
      reconnectTimer.current = setTimeout(connect, 3000);
    };

    ws.onerror = () => {
      setIsConnected(false);
      setStatus('error');
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        handleServerMessage(msg);
      } catch {}
    };
  }, []);

  const handleServerMessage = (msg: { type: string; content?: string; provider?: Provider; steps?: PlanStep[]; files?: string[] }) => {
    switch (msg.type) {
      case 'connected':
        setProvider(msg.provider || 'unknown');
        setStatus('idle');
        break;

      case 'thinking':
        setStatus('thinking');
        break;

      case 'start':
        setStatus('executing');
        pendingContent.current = '';
        setMessages(prev => [
          ...prev,
          {
            id: Date.now().toString(),
            role: 'assistant',
            content: '',
            type: 'text',
            timestamp: new Date(),
          },
        ]);
        break;

      case 'delta':
        if (msg.content) {
          pendingContent.current += msg.content;
          setMessages(prev => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            if (last?.role === 'assistant') {
              updated[updated.length - 1] = { ...last, content: pendingContent.current };
            }
            return updated;
          });
        }
        break;

      case 'done':
        setStatus('idle');
        pendingContent.current = '';
        break;

      case 'plan':
        if (msg.steps) setCurrentPlan(msg.steps);
        break;

      case 'files_modified':
        if (msg.files) setModifiedFiles(prev => [...new Set([...prev, ...msg.files!])]);
        break;

      case 'error':
        setStatus('error');
        setMessages(prev => [
          ...prev,
          {
            id: Date.now().toString(),
            role: 'system',
            content: `Erro: ${msg.content}`,
            type: 'text',
            timestamp: new Date(),
          },
        ]);
        break;
    }
  };

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    const userMsg: AgentMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      type: 'text',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);

    const historyForApi = messages.map(m => ({ role: m.role === 'system' ? 'user' : m.role, content: m.content }));

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'message',
        messages: [...historyForApi, { role: 'user', content }],
        model,
        context,
      }));
    } else {
      // Fallback via Ollama quando WS não disponível
      setStatus('thinking');
      try {
        const historyText = historyForApi.slice(-4).map(m =>
          `${m.role === 'user' ? 'Usuário' : 'Assistente'}: ${m.content}`
        ).join('\n');
        const prompt = `Assistente código: React/TS/Node/IA. PT-BR. Direto.\n\n${historyText}\nUsuário: ${content}\nAssistente:`;

        const response = await fetch('/api/ollama/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ model: 'mistral', prompt, stream: false }),
        });
        const text = await response.text();
        const data = JSON.parse(text);
        const replyContent = data.response || data.error || 'Ollama offline. Verifique o serviço na VPS.';
        setMessages(prev => [
          ...prev,
          { id: Date.now().toString(), role: 'assistant', content: replyContent, type: 'text', timestamp: new Date() },
        ]);
        setStatus('idle');
      } catch (err) {
        setMessages(prev => [
          ...prev,
          { id: Date.now().toString(), role: 'assistant', content: 'Sem conexão com o servidor.', type: 'text', timestamp: new Date() },
        ]);
        setStatus('error');
      }
    }
  }, [messages, model, context]);

  const stopExecution = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'stop' }));
    }
    setStatus('idle');
  }, []);

  const approvePlan = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'approve_plan' }));
    }
    setCurrentPlan(undefined);
  }, []);

  const rejectPlan = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'reject_plan' }));
    }
    setCurrentPlan(undefined);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setModifiedFiles([]);
    setCurrentPlan(undefined);
    setStatus('idle');
  }, []);

  const acceptChanges = useCallback(async (path: string) => {
    setModifiedFiles(prev => prev.filter(f => f !== path));
  }, []);

  const rejectChanges = useCallback(async (path: string) => {
    setModifiedFiles(prev => prev.filter(f => f !== path));
  }, []);

  // Conecta ao montar
  useEffect(() => {
    connect();
    return () => {
      clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
    };
  }, [connect]);

  return {
    messages,
    status,
    provider,
    isConnected,
    currentPlan,
    modifiedFiles,
    sendMessage,
    stopExecution,
    approvePlan,
    rejectPlan,
    clearMessages,
    acceptChanges,
    rejectChanges,
  };
}
