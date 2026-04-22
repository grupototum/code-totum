import React from 'react';
import { Sidebar } from './Sidebar';

interface CodeHubLayoutProps {
  children: React.ReactNode;
}

export const CodeHubLayout: React.FC<CodeHubLayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
};
