import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from './../../lib/utils';
import { Button } from './../../components/ui/button';

export const Sidebar: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { label: 'Home', path: '/', icon: '🏠' },
    { label: 'Ada', path: '/ada', icon: '🤖' },
    { label: 'Claudio', path: '/claudio', icon: '✨' },
    { label: 'Craudio', path: '/craudio', icon: '🎵' },
    { label: 'Settings', path: '/settings', icon: '⚙️' },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-white p-6 h-screen overflow-y-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">CodeHub</h1>
        <p className="text-sm text-slate-400">AI Code Assistant</p>
      </div>

      <nav className="space-y-2">
        {navItems.map((item) => (
          <Link key={item.path} to={item.path}>
            <Button
              variant="ghost"
              className={cn(
                'w-full justify-start text-left',
                location.pathname === item.path
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-300 hover:bg-slate-800'
              )}
            >
              <span className="mr-3">{item.icon}</span>
              {item.label}
            </Button>
          </Link>
        ))}
      </nav>

      <div className="mt-auto pt-6 border-t border-slate-700">
        <Button variant="outline" className="w-full justify-start text-slate-300">
          🚪 Sign Out
        </Button>
      </div>
    </aside>
  );
};
