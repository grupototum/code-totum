import { useState } from 'react';
import { ChevronRight, ChevronDown, File, Folder, FolderOpen, GitBranch, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'dir';
  children?: FileNode[];
  modified?: boolean;
  added?: boolean;
}

interface FileTreeItemProps {
  node: FileNode;
  depth: number;
  selected: string | null;
  onSelect: (path: string) => void;
}

function FileTreeItem({ node, depth, selected, onSelect }: FileTreeItemProps) {
  const [open, setOpen] = useState(depth < 2);
  const isSelected = selected === node.path;

  const ext = node.name.split('.').pop() || '';
  const iconColor =
    ['ts', 'tsx'].includes(ext) ? 'text-blue-400' :
    ['js', 'jsx'].includes(ext) ? 'text-yellow-400' :
    ['css', 'scss'].includes(ext) ? 'text-pink-400' :
    ['json', 'yaml', 'yml'].includes(ext) ? 'text-orange-400' :
    ['md', 'mdx'].includes(ext) ? 'text-zinc-300' :
    'text-zinc-400';

  if (node.type === 'dir') {
    return (
      <div>
        <button
          onClick={() => setOpen(o => !o)}
          className={cn(
            'flex items-center gap-1.5 w-full text-left px-2 py-0.5 text-xs rounded hover:bg-zinc-800 transition-colors',
            isSelected && 'bg-zinc-800'
          )}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
        >
          {open ? (
            <ChevronDown className="w-3 h-3 text-zinc-500 shrink-0" />
          ) : (
            <ChevronRight className="w-3 h-3 text-zinc-500 shrink-0" />
          )}
          {open ? (
            <FolderOpen className="w-3.5 h-3.5 text-yellow-500/80 shrink-0" />
          ) : (
            <Folder className="w-3.5 h-3.5 text-yellow-500/60 shrink-0" />
          )}
          <span className="text-zinc-300 truncate">{node.name}</span>
        </button>
        {open && node.children?.map(child => (
          <FileTreeItem
            key={child.path}
            node={child}
            depth={depth + 1}
            selected={selected}
            onSelect={onSelect}
          />
        ))}
      </div>
    );
  }

  return (
    <button
      onClick={() => onSelect(node.path)}
      className={cn(
        'flex items-center gap-1.5 w-full text-left px-2 py-0.5 text-xs rounded hover:bg-zinc-800 transition-colors group',
        isSelected && 'bg-zinc-800/80 ring-1 ring-pink-600/30'
      )}
      style={{ paddingLeft: `${depth * 12 + 20}px` }}
    >
      <File className={cn('w-3.5 h-3.5 shrink-0', iconColor)} />
      <span className={cn(
        'truncate',
        node.modified ? 'text-yellow-300' : node.added ? 'text-green-300' : 'text-zinc-300'
      )}>
        {node.name}
      </span>
      {node.modified && <span className="ml-auto text-yellow-400 text-[10px]">M</span>}
      {node.added && <span className="ml-auto text-green-400 text-[10px]">A</span>}
    </button>
  );
}

// Árvore de exemplo (mock)
const MOCK_TREE: FileNode[] = [
  {
    name: 'src', path: 'src', type: 'dir', children: [
      {
        name: 'components', path: 'src/components', type: 'dir', children: [
          { name: 'App.tsx', path: 'src/components/App.tsx', type: 'file', modified: true },
          { name: 'Button.tsx', path: 'src/components/Button.tsx', type: 'file' },
        ]
      },
      {
        name: 'hooks', path: 'src/hooks', type: 'dir', children: [
          { name: 'useOpenCode.ts', path: 'src/hooks/useOpenCode.ts', type: 'file', modified: true },
          { name: 'useAlexandria.ts', path: 'src/hooks/useAlexandria.ts', type: 'file' },
        ]
      },
      { name: 'main.tsx', path: 'src/main.tsx', type: 'file' },
    ]
  },
  { name: 'package.json', path: 'package.json', type: 'file' },
  { name: 'tsconfig.json', path: 'tsconfig.json', type: 'file' },
  { name: 'vite.config.ts', path: 'vite.config.ts', type: 'file', added: true },
];

interface FileExplorerProps {
  modifiedFiles?: string[];
  onFileSelect?: (path: string) => void;
}

export function FileExplorer({ modifiedFiles = [], onFileSelect }: FileExplorerProps) {
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (path: string) => {
    setSelected(path);
    onFileSelect?.(path);
  };

  // Injeta arquivos modificados na árvore
  const tree = modifiedFiles.length > 0
    ? [
        {
          name: '⚡ Modificados', path: '__modified', type: 'dir' as const,
          children: modifiedFiles.map(f => ({
            name: f.split('/').pop() || f,
            path: f,
            type: 'file' as const,
            modified: true,
          }))
        },
        ...MOCK_TREE
      ]
    : MOCK_TREE;

  return (
    <div className="flex flex-col h-full bg-zinc-950">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800 shrink-0">
        <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium uppercase tracking-wider">
          <GitBranch className="w-3.5 h-3.5" />
          Explorer
        </div>
        <button className="text-zinc-500 hover:text-zinc-300 transition-colors">
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-y-auto py-1 px-1">
        {tree.map(node => (
          <FileTreeItem
            key={node.path}
            node={node}
            depth={0}
            selected={selected}
            onSelect={handleSelect}
          />
        ))}
      </div>

      {/* Branch info */}
      <div className="px-3 py-2 border-t border-zinc-800 text-[10px] text-zinc-600 flex items-center gap-1.5">
        <GitBranch className="w-3 h-3" />
        main
        {modifiedFiles.length > 0 && (
          <span className="ml-auto text-yellow-600">{modifiedFiles.length} alterado(s)</span>
        )}
      </div>
    </div>
  );
}
