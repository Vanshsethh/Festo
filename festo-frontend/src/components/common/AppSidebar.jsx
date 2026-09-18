import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { CalendarDays, ChevronLeft, Compass, GraduationCap, LayoutDashboard, LogOut, PlusCircle, Ticket, UserRound, X } from 'lucide-react';
import { FestoLogo } from './FestoLogo.jsx';
import { useAuth } from '../../hooks/useAuth.jsx';

const publicLinks = [
  { label: 'Discover', to: '/', icon: Compass },
  { label: 'Explore events', to: '/explore', icon: CalendarDays },
  { label: 'Colleges', to: '/colleges', icon: GraduationCap },
];

export const AppSidebar = ({ open, onClose, collapsed, onCollapse }) => {
  const { user, isAuthenticated, isUser, isOrganizer, logout } = useAuth();
  const navigate = useNavigate();
  const links = [
    ...publicLinks,
    ...(isAuthenticated && isUser ? [
      { label: 'My dashboard', to: '/dashboard', icon: LayoutDashboard },
      { label: 'My registrations', to: '/registrations', icon: Ticket },
      { label: 'Host an event', to: '/host', icon: PlusCircle, accent: true },
    ] : []),
    ...(isOrganizer ? [
      { label: 'Organizer hub', to: '/organizer/dashboard', icon: LayoutDashboard },
      { label: 'My events', to: '/organizer/events', icon: CalendarDays },
    ] : []),
  ];

  const signOut = async () => {
    await logout();
    onClose();
    navigate('/');
  };

  const sidebarWidth = collapsed ? 'lg:w-20' : 'lg:w-72';
  const profilePath = isOrganizer ? '/organizer/dashboard' : '/dashboard';
  return (
    <>
      {open && <button type="button" aria-label="Close menu" onClick={onClose} className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden" />}
      <aside
        onMouseEnter={() => onCollapse && collapsed && onCollapse()}
        onMouseLeave={() => onCollapse && !collapsed && onCollapse()}
        className={`fixed inset-y-0 left-0 z-50 flex w-72 -translate-x-full flex-col border-r border-white/10 bg-[#09070d] px-3 py-4 shadow-2xl shadow-fuchsia-950/40 transition-all duration-300 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${sidebarWidth} ${open ? 'translate-x-0' : ''}`}
      >
        <div className="mb-8 flex items-center justify-between px-2">
          <FestoLogo size="sm" showText={!collapsed} />
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white lg:hidden"><X className="h-5 w-5" /></button>
          <button type="button" onClick={onCollapse} aria-label="Toggle sidebar" className="hidden rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-fuchsia-300 lg:block"><ChevronLeft className={`h-4 w-4 transition-transform ${collapsed ? 'rotate-180' : ''}`} /></button>
        </div>

        <nav className="flex flex-1 flex-col gap-1" aria-label="Primary navigation">
          {links.map(({ label, to, icon: Icon, accent }) => (
            <NavLink key={to} to={to} end={to === '/'} onClick={onClose} title={collapsed ? label : undefined} className={({ isActive }) => `group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all ${isActive ? 'bg-gradient-to-r from-fuchsia-600/25 to-violet-600/20 text-white shadow-lg shadow-fuchsia-950/20 ring-1 ring-fuchsia-400/20' : accent ? 'text-fuchsia-200 hover:bg-fuchsia-500/10 hover:text-fuchsia-100' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
              <Icon className={`h-5 w-5 shrink-0 ${accent ? 'text-fuchsia-400' : 'group-hover:text-fuchsia-300'}`} />
              {!collapsed && <span className="truncate">{label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/10 pt-3">
          {isAuthenticated ? (
            <>
              <Link to={profilePath} onClick={onClose} className="mb-2 flex items-center gap-3 rounded-xl p-2 hover:bg-white/5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-fuchsia-500 to-violet-600 text-sm font-bold text-white shadow-lg shadow-fuchsia-600/20">{user?.name?.[0]?.toUpperCase() || 'U'}</div>
                {!collapsed && <div className="min-w-0"><p className="truncate text-sm font-semibold text-white">{user?.name}</p><p className="truncate text-xs text-slate-500">{user?.email}</p></div>}
              </Link>
              <button type="button" onClick={signOut} title={collapsed ? 'Sign out' : undefined} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-400 transition-colors hover:bg-rose-500/10 hover:text-rose-300"><LogOut className="h-5 w-5 shrink-0" />{!collapsed && 'Sign out'}</button>
            </>
          ) : (
            <Link to="/login" onClick={onClose} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-fuchsia-200 hover:bg-fuchsia-500/10"><UserRound className="h-5 w-5 shrink-0" />{!collapsed && 'Sign in to Festo'}</Link>
          )}
        </div>
      </aside>
    </>
  );
};
