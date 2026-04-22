import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Send, Square, Loader2, User, Bot, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { AgentMessage, AgentStatus } from '@/hooks/useOpenCode';

interface AgentChatProps {
  messages: AgentMessage[];
  status: AgentStatus;
  onSend: (message: string) => void;
  onStop: () => void;
  onClear: () => void;
}

function MessageContent({ content }: { content: string }) {
  // Renderiza code blocks de forma especial
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-2">
      {parts.map((part, i) => {
        if (part.startsWith('```')) {
          const lines = part.slice(3).split('\n');
          const lang = lines[0] || '';
          const code = lines.slice(1, -1).join('\n');
          return (
            <div key={i} className="rounded-lg overflow-hidden border border-zinc-700">
              {lang && (
                <div className="bg-zinc-800 px-3 py-1 text-xs text-zinc-400 font-mono">{lang}</div>
              )}
              <pre className="bg-zinc-900 p-3 text-sm text-zinc-200 font-mono overflow-x-auto">
                <code>{code}</code>
              </pre>
            </div>
          );
        }
        return (
          <p key={i} className="text-sm leading-relaxed whitespace-pre-wrap">
            {part}
          </p>
        );
      })}
    </div>
  );
}

export function AgentChat({ messages, status, onSend, onStop, onClear }: AgentChatProps) {
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isRunning = status === 'thinking' || status === 'executing';

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || isRunning) return;
    onSend(input);
    setInput('');
    setTimeout(() => textareaRef.current?.focus(), 100);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Mensagens */}
      <ScrollArea className="flex-1 px-4 py-2">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-16 text-zinc-500">
            <Bot className="w-12 h-12 mb-4 opacity-30" />
            <p className="text-sm">Inicie uma conversa com Totum Agent</p>
            <p className="text-xs mt-1 opacity-60">Shift+Enter para nova linha</p>
          </div>
        ) : (
          <div className="space-y-4 pb-2">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role !== 'user' && (
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                    msg.role === 'system' ? 'bg-red-900/50' : 'bg-pink-600/20'
                  }`}>
                    {msg.role === 'system' ? (
                      <AlertCircle className="w-4 h-4 text-red-400" />
                    ) : (
                      <Bot className="w-4 h-4 text-pink-400" />
                    )}
                  </div>
                )}

                <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                  msg.role === 'user'
                    ? 'bg-pink-600 text-white rounded-br-sm'
                    : msg.role === 'system'
                    ? 'bg-red-900/30 text-red-300 rounded-bl-sm border border-red-800/50'
                    : 'bg-zinc-800 text-zinc-100 rounded-bl-sm'
                }`}>
                  <MessageContent content={msg.content || '…'} />
                  <span className="text-xs opacity-40 mt-1 block">
                    {msg.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {msg.role === 'user' && (
                  <div className="w-7 h-7 rounded-full bg-zinc-700 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4 text-zinc-300" />
                  </div>
                )}
              </div>
            ))}

            {/* Indicador de status */}
            {isRunning && (
              <div className="flex gap-3 justify-start">
                <div className="w-7 h-7 rounded-full bg-pink-600/20 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-pink-400" />
                </div>
                <div className="bg-zinc-800 rounded-2xl rounded-bl-sm px-4 py-2.5 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-pink-400" />
                  <span className="text-sm text-zinc-400">
                    {status === 'thinking' ? 'Pensando…' : 'Executando…'}
                  </span>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <div className="border-t border-zinc-800 p-3 space-y-2">
        <div className="flex gap-2 items-end">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Descreva o que quer fazer…"
            rows={1}
            className="flex-1 resize-none bg-zinc-900 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:border-pink-600 min-h-[40px] max-h-[120px]"
            style={{ height: 'auto', overflowY: input.split('\n').length > 3 ? 'scroll' : 'hidden' }}
          />
          {isRunning ? (
            <Button
              onClick={onStop}
              size="icon"
              className="bg-red-600 hover:bg-red-700 shrink-0"
            >
              <Square className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSend}
              size="icon"
              disabled={!input.trim()}
              className="bg-pink-600 hover:bg-pink-700 shrink-0 disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </Button>
          )}
        </div>
        {messages.length > 0 && (
          <button
            onClick={onClear}
            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            Limpar conversa
          </button>
        )}
      </div>
    </div>
  );
}
