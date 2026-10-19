import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Bell, Building2, CalendarDays, MapPin, Menu, Search, Ticket, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { FestoLogo } from './FestoLogo.jsx';
import { useAuth } from '../../hooks/useAuth.jsx';
import { eventsService } from '../../services/events.service.js';
import { collegesService } from '../../services/colleges.service.js';
import { notificationsService } from '../../services/notifications.service.js';

type SearchItem = { id: string; title?: string; slug?: string; college_name?: string; name?: string; location?: string };
type Notification = { id: string; type: string; created_at: string; payload?: { registration_id?: string; event_title?: string; quantity?: number } };

export const Header = ({ onMenuToggle }: { onMenuToggle: () => void }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const searchRef = useRef(null);
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [localNotifications, setLocalNotifications] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('festo_local_notifications') || '[]');
      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  });
  const [campusName, setCampusName] = useState(() => {
    try {
      const saved = localStorage.getItem('festo_my_college');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed?.name || parsed?.slug?.toUpperCase() || null;
      }
    } catch {
      // ignore error
    }
    return null;
  });

  useEffect(() => {
    const handleCollegeChange = () => {
      try {
        const saved = localStorage.getItem('festo_my_college');
        if (saved) {
          const parsed = JSON.parse(saved);
          setCampusName(parsed?.name || parsed?.slug?.toUpperCase() || null);
        } else {
          setCampusName(null);
        }
      } catch {
        setCampusName(null);
      }
    };

    window.addEventListener('festo-college-changed', handleCollegeChange);
    return () => window.removeEventListener('festo-college-changed', handleCollegeChange);
  }, []);

  useEffect(() => {
    const refreshLocalNotifications = () => {
      try {
        const saved = JSON.parse(localStorage.getItem('festo_local_notifications') || '[]');
        setLocalNotifications(Array.isArray(saved) ? saved : []);
      } catch {
        setLocalNotifications([]);
      }
    };
    window.addEventListener('festo-notification-created', refreshLocalNotifications);
    return () => window.removeEventListener('festo-notification-created', refreshLocalNotifications);
  }, []);

  const displayCampus = campusName || user?.college_name || 'Your campus';
  const normalizedQuery = query.trim();
  const { data: eventResults } = useQuery({
    queryKey: ['header-search-events', normalizedQuery],
    queryFn: () => eventsService.list({ search: normalizedQuery, limit: 5 }),
    enabled: normalizedQuery.length >= 2,
  });
  const { data: collegeResults } = useQuery({
    queryKey: ['header-search-colleges', normalizedQuery],
    queryFn: () => collegesService.getVerifiedColleges({ search: normalizedQuery, limit: 4 }),
    enabled: normalizedQuery.length >= 2,
  });
  const { data: notificationResults } = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationsService.mine,
    enabled: Boolean(user),
    refetchInterval: 30000,
  });
  const events = eventResults?.data?.events || [];
  const colleges = collegeResults?.data?.colleges || [];
  const apiNotifications = notificationResults?.data?.notifications || [];
  const notifications = [
    ...apiNotifications,
    ...localNotifications.filter((localNotification) => !apiNotifications.some(
      (apiNotification: Notification) => apiNotification.payload?.registration_id
        && apiNotification.payload.registration_id === localNotification.payload?.registration_id
    )),
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const submitSearch = (event: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (!normalizedQuery) return;
    setSearchOpen(false);
    navigate(`/explore?q=${encodeURIComponent(normalizedQuery)}`);
  };

  const formatNotification = (notification: Notification) => {
    const eventTitle = notification.payload?.event_title || 'your event';
    if (notification.type === 'REGISTRATION_CONFIRMED') {
      const quantity = notification.payload?.quantity || 1;
      return { title: 'Ticket booked!', detail: `Congratulations — ${quantity} ticket${quantity > 1 ? 's are' : ' is'} booked for ${eventTitle}.` };
    }
    if (notification.type === 'EVENT_REMINDER') return { title: 'Event reminder', detail: `${eventTitle} is coming up soon.` };
    return { title: 'Festo update', detail: 'You have a new notification.' };
  };

  return (
    <header className="sticky top-0 z-30 flex h-[4.5rem] items-center justify-between border-b border-border/80 bg-[#f7f7fa]/80 px-4 backdrop-blur-xl lg:px-8">
      <FestoLogo size="sm" className="lg:hidden" />
      <div className="hidden w-full max-w-xl items-center gap-3 lg:flex">
        <div ref={searchRef} className="relative flex-1">
          <form onSubmit={submitSearch} className="glass-control flex h-10 items-center gap-2 rounded-xl px-3 text-sm transition-colors focus-within:bg-white focus-within:text-foreground">
            <Search className="h-4 w-4 shrink-0 text-primary" />
            <input
              value={query}
              onChange={(event) => { setQuery(event.target.value); setSearchOpen(true); }}
              onFocus={() => setSearchOpen(true)}
              placeholder="Search events, colleges, artists..."
              className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
              aria-label="Search events, colleges, and artists"
            />
            {query && <button type="button" onClick={() => { setQuery(''); setSearchOpen(false); }} aria-label="Clear search"><X className="h-4 w-4" /></button>}
          </form>
          {searchOpen && normalizedQuery.length >= 2 && (
            <div className="absolute left-0 right-0 top-12 overflow-hidden rounded-xl border border-border bg-background shadow-xl">
              {events.length === 0 && colleges.length === 0 ? <p className="p-4 text-sm text-muted-foreground">No events, colleges, or artists found.</p> : <>
                {events.map((event: SearchItem) => <Link key={event.id} to={`/events/${event.slug}`} onClick={() => setSearchOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-accent"><CalendarDays className="h-4 w-4 text-primary" /><span className="min-w-0 flex-1 truncate">{event.title}</span><span className="truncate text-xs text-muted-foreground">{event.college_name}</span></Link>)}
                {colleges.map((college: SearchItem) => <Link key={college.id} to={`/colleges/${college.slug}`} onClick={() => setSearchOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-accent"><Building2 className="h-4 w-4 text-primary" /><span className="min-w-0 flex-1 truncate">{college.name}</span><span className="truncate text-xs text-muted-foreground">{college.location}</span></Link>)}
                <button type="button" onClick={(event) => submitSearch(event)} className="w-full border-t border-border px-4 py-3 text-left text-sm font-medium text-primary hover:bg-accent">View all results for “{normalizedQuery}”</button>
              </>}
            </div>
          )}
        </div>
        <Link
          to="/colleges"
          title={campusName ? `Current campus: ${displayCampus} (click to change)` : 'Select your campus'}
          className="festo-campus-control flex h-10 items-center gap-2 rounded-xl px-3.5 text-xs font-semibold transition-colors"
        >
          <MapPin className="festo-campus-label h-4 w-4 text-purple-400 shrink-0" />
          <span className="festo-campus-label max-w-[140px] truncate font-medium">
            {displayCampus}
          </span>
        </Link>
      </div>
      <div className="flex items-center gap-1">
        <div className="relative">
        <button
          type="button"
          aria-label="Notifications"
          aria-expanded={notificationsOpen}
          onClick={() => setNotificationsOpen((open) => !open)}
          className="festo-bell-control relative flex h-10 w-10 items-center justify-center rounded-xl transition-colors"
        >
          <Bell className="festo-notification-icon h-5 w-5" />
          {notifications.length > 0 && <span className="festo-notification-badge absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full" />}
        </button>
        {notificationsOpen && <div className="festo-notifications-panel fixed right-4 top-20 z-50 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border shadow-2xl">
          <div className="border-b border-border px-4 py-3 text-sm font-semibold">Notifications</div>
          {notifications.length === 0 ? <p className="p-4 text-sm text-muted-foreground">No notifications yet.</p> : <div className="max-h-80 overflow-y-auto">{notifications.map((notification) => { const content = formatNotification(notification); return <div key={notification.id} className="flex gap-3 border-b border-border/70 px-4 py-3 last:border-0"><Ticket className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><div><p className="text-sm font-medium">{content.title}</p><p className="mt-0.5 text-xs text-muted-foreground">{content.detail}</p><p className="mt-1 text-[11px] text-muted-foreground">{new Date(notification.created_at).toLocaleString()}</p></div></div>; })}</div>}
        </div>}
        </div>
        <button
          type="button"
          onClick={onMenuToggle}
          aria-label="Open navigation"
          className="rounded-xl p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-primary lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
};
