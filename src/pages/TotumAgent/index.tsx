import { useState, useEffect, useCallback } from 'react';
import { Zap, Database, Settings, GitCompare, FolderTree, ClipboardList, PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen } from 'lucide-react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useOpenCode } from '@/hooks/useOpenCode';
import { useAlexandria } from '@/hooks/useAlexandria';
import { AgentChat } from '@/components/agent/AgentChat';
import { ModelSelector } from '@/components/agent/ModelSelector';
import { TerminalPanel, type TerminalLog } from '@/components/agent/TerminalPanel';
import { StatusBar } from '@/components/agent/StatusBar';
import { FileExplorer } from '@/components/agent/FileExplorer';
import { DiffViewer } from '@/components/agent/DiffViewer';
import { PlanView } from '@/components/agent/PlanView';
import { Link } from 'wouter';
import { cn } from '@/lib/utils';

type RightPanel = 'diff' | 'plan';

export default function TotumAgent() {
  const [model, setModel] = useState('claude-3-5-sonnet-20241022');
  const [terminalLogs, setTerminalLogs] = useState<TerminalLog[]>([]);
  const [sessionStart] = useState(Date.now());
  const [sessionDuration, setSessionDuration] = useState('00:00');
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [rightTab, setRightTab] = useState<RightPanel>('plan');
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const alexandria = useAlexandria();
  const agent = useOpenCode({ model, context: alexandria.activeContext });

  // Timer
  useEffect(() => {
    const iv = setInterval(() => {
      const e = Math.floor((Date.now() - sessionStart) / 1000);
      setSessionDuration(`${String(Math.floor(e / 60)).padStart(2, '0')}:${String(e % 60).padStart(2, '0')}`);
    }, 1000);
    return () => clearInterval(iv);
  }, [sessionStart]);

  // Logs automáticos
  useEffect(() => {
    if (agent.status === 'thinking') addLog('info', 'Agente pensando…');
    if (agent.status === 'executing') addLog('command', 'Executando tarefa…');
  }, [agent.status]);

  // Abrir painel de diff quando há arquivos modificados
  useEffect(() => {
    if (agent.modifiedFiles.length > 0) {
      setRightTab('diff');
      setRightOpen(true);
    }
  }, [agent.modifiedFiles.length]);

  // Abrir painel de plan quando há plano
  useEffect(() => {
    if (agent.currentPlan) {
      setRightTab('plan');
      setRightOpen(true);
    }
  }, [agent.currentPlan]);

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
    if (alexandria.isEnabled && message.length > 5) {
      const docs = await alexandria.retrieveContext(message);
      if (docs.length > 0) addLog('success', `Alexandria: ${docs.length} doc(s) carregados`);
    }
    agent.sendMessage(message);
  }, [agent, alexandria, addLog]);

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-zinc-100 overflow-hidden">

      {/* ── Header ────────────────────────────────────── */}
      <header className="flex items-center gap-2 px-3 py-2 border-b border-zinc-800 bg-zinc-900/80 backdrop-blur shrink-0">

        {/* Toggle esquerdo */}
        <button
          onClick={() => setLeftOpen(o => !o)}
          className="text-zinc-500 hover:text-zinc-300 transition-colors p-1 rounded"
          title="Toggle explorador"
        >
          {leftOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
        </button>

        {/* Logo */}
        <div className="flex items-center gap-2 mr-1">
          <div className="w-6 h-6 rounded-md bg-pink-600/20 flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-pink-400" />
          </div>
          <span className="font-bold text-sm tracking-tight">TOTUM AGENT</span>
          <span className="text-zinc-600 text-xs">v2.0</span>
        </div>

        <div className="h-4 w-px bg-zinc-800" />

        <ModelSelector selected={model} onSelect={setModel} />

        <div className="ml-auto flex items-center gap-1.5">
          {/* Alexandria */}
          <Button
            variant="outline"
            size="sm"
            onClick={alexandria.toggleEnabled}
            className={cn(
              'gap-1.5 text-xs h-7 px-2.5 border-zinc-700',
              alexandria.isEnabled
                ? 'bg-purple-600/20 border-purple-600/50 text-purple-300'
                : 'bg-transparent text-zinc-500 hover:text-zinc-300'
            )}
          >
            <Database className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Alexandria</span>
          </Button>

          {/* Status */}
          {agent.isConnected ? (
            <Badge className="bg-green-600/20 text-green-400 border-green-600/30 text-xs h-6">
              Online
            </Badge>
          ) : (
            <Badge className="bg-red-600/20 text-red-400 border-red-600/30 text-xs h-6 animate-pulse">
              Reconectando…
            </Badge>
          )}

          {/* Settings */}
          <Link href="/settings">
            <Button variant="ghost" size="icon" className="text-zinc-500 hover:text-zinc-300 h-7 w-7">
              <Settings className="w-3.5 h-3.5" />
            </Button>
          </Link>

          {/* Toggle direito */}
          <button
            onClick={() => setRightOpen(o => !o)}
            className="text-zinc-500 hover:text-zinc-300 transition-colors p-1 rounded"
            title="Toggle painel"
          >
            {rightOpen ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Alexandria context strip */}
      {alexandria.isEnabled && alexandria.documents.length > 0 && (
        <div className="flex items-center gap-2 px-4 py-1 bg-purple-900/20 border-b border-purple-800/30 text-xs text-purple-300 shrink-0">
          <Database className="w-3 h-3" />
          <span>{alexandria.documents.length} doc(s) no contexto</span>
          <button onClick={() => alexandria.setActiveContext('')} className="ml-auto hover:text-purple-100">
            Limpar
          </button>
        </div>
      )}

      {/* ── 3 Colunas ─────────────────────────────────── */}
      <div className="flex-1 overflow-hidden">
        <PanelGroup direction="horizontal" className="h-full">

          {/* Coluna esquerda — FileExplorer */}
          {leftOpen && (
            <>
              <Panel defaultSize={18} minSize={12} maxSize={30} className="border-r border-zinc-800">
                <FileExplorer
                  modifiedFiles={agent.modifiedFiles}
                  onFileSelect={path => {
                    setSelectedFile(path);
                    setRightTab('diff');
                    setRightOpen(true);
                  }}
                />
              </Panel>
              <PanelResizeHandle className="w-1 bg-zinc-800 hover:bg-pink-600/50 transition-colors cursor-col-resize" />
            </>
          )}

          {/* Coluna central — Chat */}
          <Panel minSize={30}>
            <div className="flex flex-col h-full">
              <AgentChat
                messages={agent.messages}
                status={agent.status}
                onSend={handleSend}
                onStop={agent.stopExecution}
                onClear={agent.clearMessages}
              />
              <TerminalPanel logs={terminalLogs} status={agent.status} />
            </div>
          </Panel>

          {/* Coluna direita — Diff / Plan */}
          {rightOpen && (
            <>
              <PanelResizeHandle className="w-1 bg-zinc-800 hover:bg-pink-600/50 transition-colors cursor-col-resize" />
              <Panel defaultSize={24} minSize={16} maxSize={40} className="border-l border-zinc-800 flex flex-col">

                {/* Tabs */}
                <div className="flex items-center border-b border-zinc-800 shrink-0 bg-zinc-900/50">
                  <button
                    onClick={() => setRightTab('plan')}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-2 text-xs transition-colors border-b-2',
                      rightTab === 'plan'
                        ? 'border-pink-600 text-pink-400'
                        : 'border-transparent text-zinc-500 hover:text-zinc-300'
                    )}
                  >
                    <ClipboardList className="w-3.5 h-3.5" />
                    Plano
                    {agent.currentPlan && (
                      <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse" />
                    )}
                  </button>
                  <button
                    onClick={() => setRightTab('diff')}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-2 text-xs transition-colors border-b-2',
                      rightTab === 'diff'
                        ? 'border-pink-600 text-pink-400'
                        : 'border-transparent text-zinc-500 hover:text-zinc-300'
                    )}
                  >
                    <GitCompare className="w-3.5 h-3.5" />
                    Diff
                    {agent.modifiedFiles.length > 0 && (
                      <Badge className="h-4 px-1 text-[10px] bg-yellow-600/20 text-yellow-400 border-yellow-600/30">
                        {agent.modifiedFiles.length}
                      </Badge>
                    )}
                  </button>
                </div>

                {/* Panel content */}
                <div className="flex-1 overflow-hidden">
                  {rightTab === 'plan' ? (
                    <PlanView
                      steps={agent.currentPlan}
                      onApprove={agent.approvePlan}
                      onReject={agent.rejectPlan}
                    />
                  ) : (
                    <DiffViewer
                      selectedFile={selectedFile}
                      onAccept={agent.acceptChanges}
                      onReject={agent.rejectChanges}
                    />
                  )}
                </div>
              </Panel>
            </>
          )}
        </PanelGroup>
      </div>

      {/* ── Status Bar ────────────────────────────────── */}
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
