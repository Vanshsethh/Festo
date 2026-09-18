import React, { useState } from 'react';
import { Header } from '../components/common/Header.jsx';
import { AppSidebar } from '../components/common/AppSidebar.jsx';

export const RootLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Desktop starts as a compact rail and expands whenever it is hovered.
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <AppSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} collapsed={sidebarCollapsed} onCollapse={() => setSidebarCollapsed((value) => !value)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header onMenuToggle={() => setSidebarOpen(true)} />
        <main className="w-full flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
        <footer className="border-t border-white/5 py-6 text-center text-xs text-slate-500">
          Festo &copy; {new Date().getFullYear()} — College Event Discovery & Management Platform
        </footer>
      </div>
    </div>
  );
};
