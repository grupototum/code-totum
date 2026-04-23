import { Zap, Code2, Mic, Brain, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';

const NAV = [
  { label: 'Totum Agent', path: '/agent', icon: Zap },
  { label: 'Claudio', path: '/claudio', icon: Code2 },
  { label: 'Cráudio', path: '/craudio', icon: Mic },
  { label: 'Ada', path: '/ada', icon: Brain },
  { label: 'Configuração', path: '/settings', icon: Settings },
];

interface AppSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function AppSidebar({ collapsed, onToggle }: AppSidebarProps) {
  const [location] = useLocation();

  return (
    <aside
      className={cn(
        'flex flex-col bg-zinc-900 border-r border-zinc-800 transition-all duration-200 shrink-0',
        collapsed ? 'w-12' : 'w-52'
      )}
    >
      {/* Logo */}
      <div className={cn(
        'flex items-center gap-2 px-3 py-3.5 border-b border-zinc-800',
        collapsed ? 'justify-center' : ''
      )}>
        <div className="w-6 h-6 rounded bg-pink-600/30 flex items-center justify-center shrink-0">
          <Code2 className="w-3.5 h-3.5 text-pink-400" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <div className="text-xs font-bold text-zinc-100 leading-tight">TOTUM</div>
            <div className="text-[10px] text-zinc-500 leading-tight">AI-POWERED WORKSPACE</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-2 px-1.5 space-y-0.5 overflow-y-auto">
        {NAV.map(({ label, path, icon: Icon }) => {
          const active = location === path || (path !== '/' && location.startsWith(path));
          return (
            <Link key={path} href={path}>
              <a
                className={cn(
                  'flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs transition-colors w-full',
                  active
                    ? 'bg-pink-600/15 text-pink-400 font-medium'
                    : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200',
                  collapsed && 'justify-center px-2'
                )}
                title={collapsed ? label : undefined}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {!collapsed && <span className="truncate">{label}</span>}
              </a>
            </Link>
          );
        })}
      </nav>

      {/* User */}
      {!collapsed && (
        <div className="px-3 py-2.5 border-t border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-pink-600/20 flex items-center justify-center shrink-0">
              <span className="text-[10px] text-pink-400 font-bold">T</span>
            </div>
            <div className="min-w-0">
              <div className="text-xs text-zinc-300 font-medium truncate">Totum Dev</div>
              <div className="text-[10px] text-zinc-600 truncate">development@totum.com</div>
            </div>
          </div>
        </div>
      )}

      {/* Toggle */}
      <button
        onClick={onToggle}
        className="flex items-center justify-center py-2 border-t border-zinc-800 text-zinc-600 hover:text-zinc-400 transition-colors"
        title={collapsed ? 'Expandir' : 'Colapsar'}
      >
        {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>
    </aside>
  );
}
