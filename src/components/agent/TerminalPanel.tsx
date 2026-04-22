import { useRef, useEffect, useState } from 'react';
import { Terminal, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { AgentStatus } from '@/hooks/useOpenCode';

export interface TerminalLog {
  id: string;
  timestamp: string;
  type: 'command' | 'output' | 'error' | 'success' | 'info';
  content: string;
}

interface TerminalPanelProps {
  logs: TerminalLog[];
  status: AgentStatus;
}

const TYPE_STYLES: Record<TerminalLog['type'], string> = {
  command: 'text-pink-400 font-semibold',
  output:  'text-zinc-300',
  error:   'text-red-400',
  success: 'text-green-400',
  info:    'text-zinc-500',
};

const TYPE_PREFIX: Record<TerminalLog['type'], string> = {
  command: '$ ',
  output:  '  ',
  error:   '✗ ',
  success: '✓ ',
  info:    '· ',
};

export function TerminalPanel({ logs, status }: TerminalPanelProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [copied, setCopied] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!collapsed) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs, collapsed]);

  const copyLogs = async () => {
    const text = logs.map(l => `${l.timestamp} ${TYPE_PREFIX[l.type]}${l.content}`).join('\n');
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="border-t border-zinc-800 bg-zinc-950">
      {/* Header */}
      <div
        className="flex items-center gap-2 px-3 py-1.5 cursor-pointer select-none hover:bg-zinc-900 transition-colors"
        onClick={() => setCollapsed(c => !c)}
      >
        <Terminal className="w-3.5 h-3.5 text-zinc-500" />
        <span className="text-xs text-zinc-400 font-mono flex-1">Terminal</span>

        {status === 'executing' && (
          <span className="flex items-center gap-1 text-xs text-pink-400">
            <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-pulse" />
            Executando
          </span>
        )}

        {logs.length > 0 && !collapsed && (
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 text-zinc-500 hover:text-zinc-300"
            onClick={e => { e.stopPropagation(); copyLogs(); }}
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          </Button>
        )}

        {collapsed ? (
          <ChevronUp className="w-3.5 h-3.5 text-zinc-500" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
        )}
      </div>

      {/* Logs */}
      {!collapsed && (
        <ScrollArea className="h-28">
          <div className="px-3 py-2 font-mono text-xs space-y-0.5">
            {logs.length === 0 ? (
              <span className="text-zinc-600">Aguardando comandos…</span>
            ) : (
              logs.map(log => (
                <div key={log.id} className="flex gap-2">
                  <span className="text-zinc-600 shrink-0">{log.timestamp}</span>
                  <span className={TYPE_STYLES[log.type]}>
                    {TYPE_PREFIX[log.type]}{log.content}
                  </span>
                </div>
              ))
            )}
            <div ref={bottomRef} />
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
