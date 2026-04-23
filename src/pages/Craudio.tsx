import { useState, useEffect, useRef } from 'react';
import { Send, Zap, AlertCircle, GitBranch, Play, Cpu, Clock } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface OllamaModel {
  name: string;
  modified_at: string;
  size: number;
}

export default function Craudio() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [models, setModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState('mistral');
  const [ollamaOnline, setOllamaOnline] = useState(false);
  const [sessionDuration, setSessionDuration] = useState('00:00');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Proxy URL — sempre relativo ao servidor
  const ollamaProxy = '/api/ollama';

  // Check Ollama health and load models
  useEffect(() => {
    const checkOllama = async () => {
      try {
        const response = await fetch(`${ollamaProxy}/tags`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) throw new Error('Ollama offline');

        const data = await response.json();
        const modelList = data.models?.map((m: OllamaModel) => m.name) || [];

        setModels(modelList);
        if (modelList.length > 0) {
          setSelectedModel(modelList[0]);
          setOllamaOnline(true);
        } else {
          setOllamaOnline(false);
        }
      } catch (error) {
        console.error('Ollama error:', error);
        setOllamaOnline(false);
        setModels([]);
      }
    };

    checkOllama();
    const interval = setInterval(checkOllama, 10000); // Check every 10s
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Session timer
  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const mins = Math.floor(elapsed / 60);
      const secs = elapsed % 60;
      setSessionDuration(`${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading || !ollamaOnline) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch(`${ollamaProxy}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: selectedModel,
          messages: [
            {
              role: 'system',
              content: 'Você é Cráudio Codete, um assistente de desenvolvimento especializado em React, TypeScript, Node.js e IA. Responda em português brasileiro. Seja objetivo.',
            },
            ...messages.map((m) => ({ role: m.role, content: m.content })),
            { role: 'user', content: inputValue },
          ],
          stream: true,
        }),
      });

      if (!response.ok) throw new Error('API error');

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No stream');

      let assistantContent = '';
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.trim()) {
            try {
              const json = JSON.parse(line);
              if (json.message?.content) {
                assistantContent += json.message.content;
                setMessages((prev) => [
                  ...prev.slice(0, -1),
                  { ...prev[prev.length - 1], content: assistantContent },
                ]);
              }
            } catch (e) {
              // Ignore parse errors
            }
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 2).toString(),
          role: 'assistant',
          content: 'Erro na conexão com Ollama. Verifique se o serviço está rodando.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    { label: 'Git Status', command: 'Como ver o status do git?' },
    { label: 'Rodar Testes', command: 'Como rodar testes com Jest?' },
    { label: 'Build Prod', command: 'Como fazer build para produção?' },
    { label: 'Deploy VPS', command: 'Como fazer deploy em uma VPS?' },
  ];

  return (
    <div className="flex-1 flex overflow-hidden h-full">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header with status */}
        <div className="p-6 border-b border-white/10">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Zap size={24} /> Cráudio Codete
          </h2>
          <p className="text-sm text-gray-400">Assistente de desenvolvimento via Ollama</p>
        </div>

        {/* Model selector */}
        {ollamaOnline && models.length > 0 && (
          <div className="px-6 py-3 border-b border-white/10 flex items-center gap-3">
            <label className="text-sm text-gray-400">Modelo:</label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="px-3 py-1 bg-gray-900/50 border border-white/10 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              {models.map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full">
            {!ollamaOnline && (
              <div className="mb-6 p-4 rounded-lg border border-red-500/30 bg-red-900/20 max-w-md">
                <div className="flex items-center gap-2 text-red-300 mb-2">
                  <AlertCircle size={18} />
                  <span className="font-medium">Ollama Offline</span>
                </div>
                <p className="text-sm text-red-200">
                  Ollama não está acessível no servidor. Verifique se o serviço está rodando na VPS.
                </p>
              </div>
            )}
            <Zap className="w-12 h-12 text-gray-600 mb-4" />
            <p className="text-gray-400">Inicie uma conversa com Cráudio...</p>
            {ollamaOnline && models.length > 0 && (
              <div className="mt-6 grid grid-cols-2 gap-2">
                {quickActions.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => setInputValue(action.command)}
                    className="px-3 py-2 rounded text-sm text-gray-300 border border-white/10 hover:bg-white/5 transition"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className="space-y-2">
            <div className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                  msg.role === 'user' ? 'bg-blue-600' : ''
                }`}
                style={msg.role === 'user' ? {} : { background: 'linear-gradient(135deg, #ff006e 0%, #d7007d 100%)' }}
              >
                {msg.role === 'user' ? 'Y' : 'C'}
              </div>
              <span className="text-sm font-medium text-white">{msg.role === 'user' ? 'Você' : 'Cráudio'}</span>
            </div>
            <div className="ml-8 rounded-lg p-4 border border-white/10 backdrop-blur-sm" style={{ background: 'rgba(255, 0, 110, 0.08)' }}>
              <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-gray-400">
            <div className="animate-spin">⌛</div>
            <span className="text-sm">Cráudio está pensando...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

        {/* Input area */}
        {ollamaOnline && models.length > 0 ? (
          <div className="border-t border-white/10 backdrop-blur-md p-6" style={{ background: 'rgba(10, 10, 10, 0.6)' }}>
            <div className="flex gap-3">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !isLoading && sendMessage()}
                placeholder="Pergunte algo sobre código..."
                disabled={isLoading}
                className="flex-1 px-4 py-3 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-transparent disabled:opacity-50 backdrop-blur-sm transition"
                style={{ background: 'rgba(30, 30, 40, 0.5)' }}
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !inputValue.trim()}
                className="w-12 h-12 text-white rounded-lg flex items-center justify-center transition hover:opacity-80 disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #ff006e 0%, #d7007d 100%)' }}
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        ) : (
          <div className="border-t border-white/10 p-6 text-center">
            <p className="text-gray-400">Ollama não está acessível. Configure a URL nas Configurações e tente novamente.</p>
          </div>
        )}
      </div>

      {/* Right Sidebar */}
      <div className="w-80 border-l border-white/10 overflow-y-auto p-6 space-y-6" style={{ background: 'rgba(10, 10, 10, 0.4)' }}>
        {/* Status */}
        <div>
          <h3 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">STATUS</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Status</span>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${ollamaOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-white">{ollamaOnline ? 'Online' : 'Offline'}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Model</span>
              <span className="text-white text-xs truncate">{selectedModel}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Endpoint</span>
              <span className="text-white text-xs truncate">/api/ollama</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h3 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">QUICK ACTIONS</h3>
          <div className="space-y-2">
            {[
              { icon: GitBranch, label: 'Git Status', command: 'Como ver o status do git?' },
              { icon: Play, label: 'Run Tests', command: 'Como rodar testes com Jest?' },
              { icon: Zap, label: 'Build Prod', command: 'Como fazer build para produção?' },
              { icon: Cpu, label: 'Deploy VPS', command: 'Como fazer deploy em uma VPS?' },
            ].map((action) => (
              <button
                key={action.label}
                onClick={() => setInputValue(action.command)}
                className="w-full px-3 py-2 rounded text-sm text-gray-300 border border-white/10 hover:border-white/20 hover:bg-white/5 transition flex items-center gap-2"
              >
                <action.icon size={16} />
                {action.label}
              </button>
            ))}
          </div>
        </div>

        {/* Session */}
        <div>
          <h3 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">SESSION</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 flex items-center gap-2">
                <Clock size={14} /> Duration
              </span>
              <span className="text-white font-mono">{sessionDuration}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Messages</span>
              <span className="text-white">{messages.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Files</span>
              <span className="text-white">0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
