import { Wifi, WifiOff, Database, Clock } from 'lucide-react';
import type { AgentStatus, Provider } from '@/hooks/useOpenCode';

interface StatusBarProps {
  status: AgentStatus;
  provider: Provider;
  isConnected: boolean;
  model: string;
  isAlexandriaEnabled: boolean;
  sessionDuration: string;
  messageCount: number;
}

const STATUS_LABEL: Record<AgentStatus, string> = {
  idle:         'Pronto',
  thinking:     'Pensando…',
  executing:    'Executando…',
  error:        'Erro',
  disconnected: 'Desconectado',
};

const STATUS_COLOR: Record<AgentStatus, string> = {
  idle:         'text-green-400',
  thinking:     'text-yellow-400',
  executing:    'text-pink-400',
  error:        'text-red-400',
  disconnected: 'text-zinc-500',
};

export function StatusBar({
  status, provider, isConnected, model, isAlexandriaEnabled, sessionDuration, messageCount
}: StatusBarProps) {
  return (
    <div className="flex items-center gap-4 px-3 py-1 bg-zinc-950 border-t border-zinc-800 text-xs text-zinc-500 font-mono">
      {/* Status */}
      <div className="flex items-center gap-1.5">
        <span className={`w-1.5 h-1.5 rounded-full ${
          status === 'idle' ? 'bg-green-400' :
          status === 'thinking' || status === 'executing' ? 'bg-yellow-400 animate-pulse' :
          status === 'error' ? 'bg-red-400' : 'bg-zinc-600'
        }`} />
        <span className={STATUS_COLOR[status]}>{STATUS_LABEL[status]}</span>
      </div>

      <span className="text-zinc-700">|</span>

      {/* Conexão */}
      <div className="flex items-center gap-1">
        {isConnected ? (
          <Wifi className="w-3 h-3 text-green-400" />
        ) : (
          <WifiOff className="w-3 h-3 text-red-400" />
        )}
        <span>{provider === 'opencode' ? 'OpenCode' : provider === 'claude-fallback' ? 'Claude' : '—'}</span>
      </div>

      <span className="text-zinc-700">|</span>

      {/* Modelo */}
      <span className="truncate max-w-[120px]">{model}</span>

      <span className="text-zinc-700">|</span>

      {/* Alexandria */}
      <div className="flex items-center gap-1">
        <Database className={`w-3 h-3 ${isAlexandriaEnabled ? 'text-purple-400' : 'text-zinc-600'}`} />
        <span className={isAlexandriaEnabled ? 'text-purple-400' : ''}>
          Alexandria {isAlexandriaEnabled ? 'ON' : 'OFF'}
        </span>
      </div>

      <span className="text-zinc-700">|</span>

      {/* Sessão */}
      <div className="flex items-center gap-1 ml-auto">
        <Clock className="w-3 h-3" />
        <span>{sessionDuration}</span>
        <span>·</span>
        <span>{messageCount} msgs</span>
      </div>
    </div>
  );
}
