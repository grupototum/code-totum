import { FileText, Plus, Minus, GitCompare } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface DiffLine {
  type: 'add' | 'remove' | 'context' | 'header';
  content: string;
  lineNo?: number;
}

export interface FileDiff {
  path: string;
  lines: DiffLine[];
  additions: number;
  deletions: number;
}

function parseDiff(diff: string): DiffLine[] {
  return diff.split('\n').map(line => {
    if (line.startsWith('@@')) return { type: 'header', content: line };
    if (line.startsWith('+')) return { type: 'add', content: line.slice(1) };
    if (line.startsWith('-')) return { type: 'remove', content: line.slice(1) };
    return { type: 'context', content: line.startsWith(' ') ? line.slice(1) : line };
  });
}

interface DiffViewerProps {
  diffs?: FileDiff[];
  selectedFile?: string | null;
  onAccept?: (path: string) => void;
  onReject?: (path: string) => void;
}

export function DiffViewer({ diffs, selectedFile, onAccept, onReject }: DiffViewerProps) {
  const activeDiff = diffs?.find(d => d.path === selectedFile) ?? diffs?.[0];

  if (!activeDiff) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-zinc-600">
        <GitCompare className="w-10 h-10 mb-3 opacity-40" />
        <p className="text-xs">Nenhuma alteração pendente</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-zinc-950">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-zinc-800 shrink-0">
        <GitCompare className="w-3.5 h-3.5 text-zinc-500" />
        <span className="text-xs text-zinc-400 font-medium uppercase tracking-wider">Diff</span>
      </div>

      {/* File header */}
      <div className="flex items-center gap-2 px-3 py-2 bg-zinc-900 border-b border-zinc-800 shrink-0">
        <FileText className="w-3.5 h-3.5 text-zinc-500" />
        <span className="text-xs text-zinc-300 font-mono truncate flex-1">{activeDiff.path}</span>
        <span className="text-green-400 text-xs font-mono">+{activeDiff.additions}</span>
        <span className="text-red-400 text-xs font-mono">-{activeDiff.deletions}</span>
      </div>

      {/* Diff content */}
      <div className="flex-1 overflow-y-auto font-mono text-[11px]">
        {activeDiff.lines.map((line, i) => (
          <div
            key={i}
            className={cn(
              'flex px-3 py-px leading-5',
              line.type === 'add' && 'bg-green-950/40 text-green-300',
              line.type === 'remove' && 'bg-red-950/40 text-red-300',
              line.type === 'header' && 'bg-blue-950/30 text-blue-400',
              line.type === 'context' && 'text-zinc-500',
            )}
          >
            <span className="w-4 shrink-0 opacity-60">
              {line.type === 'add' && <Plus className="w-3 h-3 inline" />}
              {line.type === 'remove' && <Minus className="w-3 h-3 inline" />}
            </span>
            <pre className="whitespace-pre-wrap break-all">{line.content}</pre>
          </div>
        ))}
      </div>

      {/* Actions */}
      {onAccept && onReject && (
        <div className="flex gap-2 p-3 border-t border-zinc-800 shrink-0">
          <button
            onClick={() => onAccept(activeDiff.path)}
            className="flex-1 text-xs py-1.5 rounded bg-green-700/20 text-green-400 hover:bg-green-700/40 border border-green-700/30 transition-colors"
          >
            ✓ Aceitar
          </button>
          <button
            onClick={() => onReject(activeDiff.path)}
            className="flex-1 text-xs py-1.5 rounded bg-red-700/20 text-red-400 hover:bg-red-700/40 border border-red-700/30 transition-colors"
          >
            ✕ Rejeitar
          </button>
        </div>
      )}
    </div>
  );
}
