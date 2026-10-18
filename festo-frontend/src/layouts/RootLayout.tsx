import React, { useState } from 'react';
import { Header } from '../components/common/Header.jsx';
import { AppSidebar } from '../components/common/AppSidebar.jsx';

export const RootLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Desktop starts as a compact rail and expands whenever it is hovered.
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  return (
    <div className="relative flex min-h-screen overflow-hidden bg-background text-foreground">
      <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-0 z-0 h-72 bg-[radial-gradient(ellipse_at_top,rgba(220,217,240,.85),transparent_70%)]" />
      <AppSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} collapsed={sidebarCollapsed} onCollapse={() => setSidebarCollapsed((value) => !value)} />
      <div className="relative z-10 flex min-w-0 flex-1 flex-col lg:pl-1">
        <Header onMenuToggle={() => setSidebarOpen(true)} />
        <main className="w-full flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
        <footer className="border-t border-border/80 py-6 text-center text-xs text-muted-foreground">
          Festo &copy; {new Date().getFullYear()} — College Event Discovery & Management Platform
        </footer>
      </div>
    </div>
  );
};
