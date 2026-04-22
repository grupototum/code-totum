import { useState, useEffect, useCallback } from 'react';
import { Zap, Database, RefreshCw, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useOpenCode } from '@/hooks/useOpenCode';
import { useAlexandria } from '@/hooks/useAlexandria';
import { AgentChat } from '@/components/agent/AgentChat';
import { ModelSelector } from '@/components/agent/ModelSelector';
import { TerminalPanel, type TerminalLog } from '@/components/agent/TerminalPanel';
import { StatusBar } from '@/components/agent/StatusBar';
import { Link } from 'wouter';

export default function TotumAgent() {
  const [model, setModel] = useState('claude-3-5-sonnet-20241022');
  const [terminalLogs, setTerminalLogs] = useState<TerminalLog[]>([]);
  const [sessionStart] = useState(Date.now());
  const [sessionDuration, setSessionDuration] = useState('00:00');

  const alexandria = useAlexandria();

  const agent = useOpenCode({
    model,
    context: alexandria.activeContext,
  });

  // Timer de sessão
  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - sessionStart) / 1000);
      const m = String(Math.floor(elapsed / 60)).padStart(2, '0');
      const s = String(elapsed % 60).padStart(2, '0');
      setSessionDuration(`${m}:${s}`);
    }, 1000);
    return () => clearInterval(interval);
  }, [sessionStart]);

  // Log quando agente muda de status
  useEffect(() => {
    if (agent.status === 'executing') {
      addLog('command', 'Executando tarefa…');
    }
  }, [agent.status]);

  const addLog = useCallback((type: TerminalLog['type'], content: string) => {
    setTerminalLogs(prev => [...prev, {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      type,
      content,
    }]);
  }, []);

  const handleSend = useCallback(async (message: string) => {
    addLog('info', `Usuário: ${message.slice(0, 60)}${message.length > 60 ? '…' : ''}`);

    // Busca contexto Alexandria se ativo
    if (alexandria.isEnabled && message.length > 5) {
      const docs = await alexandria.retrieveContext(message);
      if (docs.length > 0) {
        addLog('success', `Alexandria: ${docs.length} documentos relevantes carregados`);
      }
    }

    agent.sendMessage(message);
  }, [agent, alexandria, addLog]);

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-zinc-100">

      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-2.5 border-b border-zinc-800 bg-zinc-900 shrink-0">
        <div className="flex items-center gap-2 mr-2">
          <div className="w-7 h-7 rounded-lg bg-pink-600/20 flex items-center justify-center">
            <Zap className="w-4 h-4 text-pink-400" />
          </div>
          <div>
            <span className="font-bold text-sm tracking-tight">TOTUM AGENT</span>
            <span className="text-zinc-500 text-xs ml-1.5">v2.0</span>
          </div>
        </div>

        <div className="h-4 w-px bg-zinc-700" />

        {/* Seletor de modelo */}
        <ModelSelector selected={model} onSelect={setModel} />

        <div className="ml-auto flex items-center gap-2">
          {/* Alexandria toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={alexandria.toggleEnabled}
            className={`gap-1.5 text-xs border-zinc-700 ${
              alexandria.isEnabled
                ? 'bg-purple-600/20 border-purple-600/50 text-purple-300'
                : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            Alexandria RAG
          </Button>

          {/* Status badge */}
          {agent.isConnected ? (
            <Badge className="bg-green-600/20 text-green-400 border-green-600/30 text-xs">
              Online
            </Badge>
          ) : (
            <Badge className="bg-red-600/20 text-red-400 border-red-600/30 text-xs animate-pulse">
              Reconectando…
            </Badge>
          )}

          {/* Link para settings */}
          <Link href="/settings">
            <Button variant="ghost" size="icon" className="text-zinc-500 hover:text-zinc-300 h-8 w-8">
              <Settings className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Alexandria context panel (quando ativo e tem docs) */}
      {alexandria.isEnabled && alexandria.documents.length > 0 && (
        <div className="flex items-center gap-2 px-4 py-1.5 bg-purple-900/20 border-b border-purple-800/30 text-xs text-purple-300 shrink-0">
          <Database className="w-3.5 h-3.5" />
          <span>{alexandria.documents.length} documentos carregados no contexto</span>
          <button
            onClick={() => alexandria.setActiveContext('')}
            className="ml-auto hover:text-purple-100 transition-colors"
          >
            Limpar
          </button>
        </div>
      )}

      {/* Main: Chat */}
      <div className="flex-1 overflow-hidden">
        <AgentChat
          messages={agent.messages}
          status={agent.status}
          onSend={handleSend}
          onStop={agent.stopExecution}
          onClear={agent.clearMessages}
        />
      </div>

      {/* Terminal */}
      <TerminalPanel logs={terminalLogs} status={agent.status} />

      {/* Status bar */}
      <StatusBar
        status={agent.status}
        provider={agent.provider}
        isConnected={agent.isConnected}
        model={model}
        isAlexandriaEnabled={alexandria.isEnabled}
        sessionDuration={sessionDuration}
        messageCount={agent.messages.filter(m => m.role === 'user').length}
      />
    </div>
  );
}
