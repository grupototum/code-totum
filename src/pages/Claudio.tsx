import { useState, useRef, useEffect } from 'react';
import { Send, Code2, Zap, GitBranch, Play, Cpu, Clock } from 'lucide-react';
import { useClaude } from '../hooks/useClaude';

export default function Claudio() {
  const [inputValue, setInputValue] = useState('');
  const { messages, loading, error, sendMessage, clearMessages } = useClaude();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [sessionDuration, setSessionDuration] = useState('00:00');

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

  const handleSendMessage = async () => {
    if (inputValue.trim()) {
      await sendMessage(inputValue);
      setInputValue('');
    }
  };

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b border-white/10 p-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Code2 size={24} /> Claudio
          </h2>
          <p className="text-sm text-gray-400">Chat com Claude API (Claude 3.5 Sonnet)</p>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Code2 className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Claude Code ready. Describe what you want to build or ask for help with your code.</p>
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-lg border border-red-500/30 backdrop-blur-sm" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
              <p className="text-sm text-red-300"><strong>Erro:</strong> {error}</p>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div key={idx} className="space-y-2">
              <div className="flex items-center gap-2">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                    msg.role === 'user' ? 'bg-blue-600' : ''
                  }`}
                  style={msg.role === 'user' ? {} : { background: 'linear-gradient(135deg, #ff006e 0%, #d7007d 100%)' }}
                >
                  {msg.role === 'user' ? 'Y' : 'C'}
                </div>
                <span className="text-sm font-medium text-white">{msg.role === 'user' ? 'Você' : 'Claude'}</span>
              </div>
              <div className="ml-8 rounded-lg p-4 border border-white/10 backdrop-blur-sm" style={{ background: 'rgba(255, 0, 110, 0.08)' }}>
                <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-gray-400">
              <div className="animate-spin">⌛</div>
              <span className="text-sm">Claude está pensando...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-white/10 backdrop-blur-md p-6" style={{ background: 'rgba(10, 10, 10, 0.6)' }}>
          <div className="flex gap-3 mb-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !loading && handleSendMessage()}
              placeholder="Digite sua mensagem ou comando... (Enter para enviar)"
              disabled={loading}
              className="flex-1 px-4 py-3 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-transparent disabled:opacity-50 backdrop-blur-sm transition"
              style={{ background: 'rgba(30, 30, 40, 0.5)' }}
            />
            <button
              onClick={handleSendMessage}
              disabled={loading || !inputValue.trim()}
              className="w-12 h-12 text-white rounded-lg flex items-center justify-center transition hover:opacity-80 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #ff006e 0%, #d7007d 100%)' }}
            >
              <Send size={20} />
            </button>
          </div>
          <div className="flex gap-2">
            <p className="text-xs text-gray-400">Dica: Use /help para ver comandos. Conectado à API Claude Sonnet 4.</p>
            <button
              onClick={clearMessages}
              className="ml-auto px-3 py-1 rounded text-xs transition border border-white/10 hover:bg-white/5 text-gray-400 hover:text-white"
            >
              NOVO CHAT
            </button>
          </div>
        </div>
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
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-white">Connected</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Model</span>
              <span className="text-white">Sonnet 4</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Context</span>
              <span className="text-white">200k tokens</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">API</span>
              <span className="text-white">Claude API</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h3 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">QUICK ACTIONS</h3>
          <div className="space-y-2">
            {[
              { icon: Code2, label: 'Open Project' },
              { icon: GitBranch, label: 'Git Status' },
              { icon: Play, label: 'Run Tests' },
              { icon: Zap, label: 'Deploy' },
              { icon: Cpu, label: 'System Status' },
            ].map((action) => (
              <button
                key={action.label}
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
