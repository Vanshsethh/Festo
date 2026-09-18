import React from 'react';
import { Menu } from 'lucide-react';
import { FestoLogo } from './FestoLogo.jsx';

/** Mobile-only top bar. Desktop account/navigation controls live in AppSidebar. */
export const Header = ({ onMenuToggle }) => (
  <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/10 bg-[#0a080d]/90 px-4 backdrop-blur-xl lg:hidden">
    <FestoLogo size="sm" />
    <button
      type="button"
      onClick={onMenuToggle}
      aria-label="Open navigation"
      className="rounded-xl p-2 text-slate-300 transition-colors hover:bg-fuchsia-500/10 hover:text-fuchsia-200"
    >
      <Menu className="h-5 w-5" />
    </button>
  </header>
);
