import React from 'react';
import { Header } from '../components/common/Header.jsx';

export const RootLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <footer className="border-t border-border/40 py-6 text-center text-xs text-muted-foreground">
        Festo &copy; {new Date().getFullYear()} — College Event Discovery & Management Platform
      </footer>
    </div>
  );
};
