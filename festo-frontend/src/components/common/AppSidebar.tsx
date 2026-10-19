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

interface AppSidebarProps {
  open: boolean;
  onClose: () => void;
  collapsed: boolean;
  onCollapse?: () => void;
}

export const AppSidebar = ({ open, onClose, collapsed, onCollapse }: AppSidebarProps) => {
  const { user, isAuthenticated, isUser, isOrganizer, logout } = useAuth();
  const navigate = useNavigate();
  const links: Array<{ label: string; to: string; icon: React.ElementType; accent?: boolean }> = [
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
      {open && <button type="button" aria-label="Close menu" onClick={onClose} className="fixed inset-0 z-40 bg-[#191a20]/20 backdrop-blur-sm lg:hidden" />}
      <aside
        onMouseEnter={() => onCollapse && collapsed && onCollapse()}
        onMouseLeave={() => onCollapse && !collapsed && onCollapse()}
        className={`fixed inset-y-3 left-3 z-50 flex w-72 -translate-x-[calc(100%+1rem)] flex-col rounded-[1.75rem] border border-border bg-white/80 px-3 py-4 shadow-[0_18px_50px_rgba(38,39,52,.12)] backdrop-blur-2xl transition-all duration-300 lg:sticky lg:top-3 lg:h-[calc(100vh-1.5rem)] lg:translate-x-0 ${sidebarWidth} ${open ? 'translate-x-0' : ''}`}
      >
        <div className="mb-8 flex items-center justify-between px-2">
          <FestoLogo size="sm" showText={!collapsed} />
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground lg:hidden"><X className="h-5 w-5" /></button>
          <button type="button" onClick={onCollapse} aria-label="Toggle sidebar" className="hidden rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-primary lg:block"><ChevronLeft className={`h-4 w-4 transition-transform ${collapsed ? 'rotate-180' : ''}`} /></button>
        </div>

        <nav className="flex flex-1 flex-col gap-1" aria-label="Primary navigation">
          {links.map(({ label, to, icon: Icon, accent }) => (
            <NavLink key={to} to={to} end={to === '/'} onClick={onClose} title={collapsed ? label : undefined} className={({ isActive }) => `group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all ${isActive ? 'bg-accent text-[#191a20] shadow-sm ring-1 ring-[#dcd9f0]' : 'text-[#191a20] hover:bg-secondary hover:text-[#191a20]'}`}>
              <Icon className="h-5 w-5 shrink-0 text-[#191a20]" />
              {!collapsed && <span className="truncate">{label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-border pt-3">
          {isAuthenticated ? (
            <>
              <Link to={profilePath} onClick={onClose} className="festo-sidebar-account mb-2 flex items-center gap-3 rounded-xl p-2 hover:bg-secondary">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-sm font-bold text-white shadow-sm">{user?.name?.[0]?.toUpperCase() || 'U'}</div>
                {!collapsed && <div className="min-w-0"><p className="festo-sidebar-account-name truncate text-sm font-semibold">{user?.name}</p><p className="festo-sidebar-account-email truncate text-xs">{user?.email}</p></div>}
              </Link>
              <button type="button" onClick={signOut} title={collapsed ? 'Sign out' : undefined} className="festo-sidebar-signout flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors hover:bg-[#f5e5e7] hover:text-[#a84f5c]"><LogOut className="h-5 w-5 shrink-0" />{!collapsed && 'Sign out'}</button>
            </>
          ) : (
            <Link to="/login" onClick={onClose} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-primary hover:bg-accent"><UserRound className="h-5 w-5 shrink-0" />{!collapsed && 'Sign in to Festo'}</Link>
          )}
        </div>
      </aside>
    </>
  );
};
