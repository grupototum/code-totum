import { CheckCircle2, Circle, Loader2, XCircle, ClipboardList } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PlanStep } from '@/hooks/useOpenCode';

interface PlanViewProps {
  steps?: PlanStep[];
  onApprove?: () => void;
  onReject?: () => void;
}

const stepIcon = {
  read: '📖',
  write: '✏️',
  execute: '⚡',
  test: '🧪',
};

export function PlanView({ steps, onApprove, onReject }: PlanViewProps) {
  if (!steps || steps.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-zinc-600 px-4">
        <ClipboardList className="w-10 h-10 mb-3 opacity-40" />
        <p className="text-xs text-center">O plano de execução aparecerá aqui quando o agente estiver planejando</p>
      </div>
    );
  }

  const pending = steps.filter(s => s.status === 'pending').length;
  const done = steps.filter(s => s.status === 'completed').length;

  return (
    <div className="flex flex-col h-full bg-zinc-950">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-zinc-800 shrink-0">
        <ClipboardList className="w-3.5 h-3.5 text-zinc-500" />
        <span className="text-xs text-zinc-400 font-medium uppercase tracking-wider">Plano</span>
        <span className="ml-auto text-[10px] text-zinc-600">{done}/{steps.length}</span>
      </div>

      {/* Progress bar */}
      <div className="h-0.5 bg-zinc-800 shrink-0">
        <div
          className="h-full bg-pink-600 transition-all duration-500"
          style={{ width: `${(done / steps.length) * 100}%` }}
        />
      </div>

      {/* Steps */}
      <div className="flex-1 overflow-y-auto py-2 px-3 space-y-1">
        {steps.map((step, i) => (
          <div
            key={step.id}
            className={cn(
              'flex items-start gap-2.5 p-2 rounded-lg text-xs transition-colors',
              step.status === 'in_progress' && 'bg-pink-600/10 border border-pink-600/20',
              step.status === 'completed' && 'opacity-50',
              step.status === 'failed' && 'bg-red-900/20 border border-red-800/30',
            )}
          >
            {/* Icon */}
            <div className="shrink-0 mt-0.5">
              {step.status === 'completed' && <CheckCircle2 className="w-4 h-4 text-green-400" />}
              {step.status === 'in_progress' && <Loader2 className="w-4 h-4 text-pink-400 animate-spin" />}
              {step.status === 'pending' && <Circle className="w-4 h-4 text-zinc-600" />}
              {step.status === 'failed' && <XCircle className="w-4 h-4 text-red-400" />}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span>{stepIcon[step.type]}</span>
                <span className={cn(
                  'font-medium',
                  step.status === 'completed' ? 'text-zinc-500' : 'text-zinc-200'
                )}>
                  {step.description}
                </span>
              </div>
              <span className="text-zinc-600 capitalize">{step.type}</span>
            </div>

            {/* Step number */}
            <span className="text-zinc-700 text-[10px] shrink-0">{i + 1}</span>
          </div>
        ))}
      </div>

      {/* Approve/Reject (só quando há steps pending) */}
      {pending > 0 && onApprove && onReject && (
        <div className="flex gap-2 p-3 border-t border-zinc-800 shrink-0">
          <button
            onClick={onApprove}
            className="flex-1 text-xs py-1.5 rounded bg-pink-700/20 text-pink-400 hover:bg-pink-700/40 border border-pink-700/30 transition-colors font-medium"
          >
            ▶ Executar plano
          </button>
          <button
            onClick={onReject}
            className="px-3 text-xs py-1.5 rounded bg-zinc-800 text-zinc-400 hover:bg-zinc-700 border border-zinc-700 transition-colors"
          >
            Cancelar
          </button>
        </div>
      )}
    </div>
  );
}
