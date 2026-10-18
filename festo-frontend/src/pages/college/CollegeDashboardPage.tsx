import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Activity, ArrowRight, CalendarDays, ClipboardCheck, QrCode, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { dashboardService } from '../../services/dashboard.service.js';
import { MetricCard } from '../../components/common/MetricCard.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card.jsx';
import { Button } from '../../components/ui/button.jsx';
import { useAuth } from '../../hooks/useAuth.jsx';
import { EventsManagementPage } from './EventsManagementPage.jsx';
import { CollegeMembersSection } from './CollegeMembersSection.jsx';

export const CollegeDashboardPage = () => {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({ queryKey: ['dashboard', 'college'], queryFn: dashboardService.college });
  if (isLoading) return <div className="grid grid-cols-1 gap-4 py-8 sm:grid-cols-2 lg:grid-cols-4">{Array.from({ length: 4 }, (_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}</div>;
  const { metrics = {}, upcoming_events: upcomingEvents = [], recent_check_ins: recentCheckIns = [] } = data?.data || {};
  const attendanceRate = metrics.registrations ? Math.round((metrics.check_ins / metrics.registrations) * 100) : 0;
  return <div className="mx-auto max-w-7xl space-y-7 py-8">
    <section className="glass-panel relative overflow-hidden rounded-3xl p-6 sm:p-8"><div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-fuchsia-500/15 blur-3xl" /><div className="relative flex flex-wrap items-end justify-between gap-5"><div><p className="text-[11px] font-bold uppercase tracking-[.22em] text-fuchsia-300">Organizer workspace</p><h1 className="mt-2 text-3xl font-extrabold tracking-tight">Run your campus events with confidence.</h1><p className="mt-2 text-sm text-muted-foreground">Registrations, attendance, and event operations in one place.</p></div><Button asChild className="gap-2 bg-gradient-to-r from-fuchsia-600 to-violet-600"><Link to="/organizer/checkin"><QrCode className="h-4 w-4" />Scan tickets <ArrowRight className="h-4 w-4" /></Link></Button></div></section>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><MetricCard label="All events" value={metrics.total_events} icon={CalendarDays} /><MetricCard label="Published events" value={metrics.published_events} icon={Activity} tone="cyan" /><MetricCard label="Registrations" value={metrics.registrations} icon={Users} tone="amber" /><MetricCard label={`Check-ins (${attendanceRate}%)`} value={metrics.check_ins} icon={ClipboardCheck} tone="emerald" /></div>
    <div className="grid gap-6 lg:grid-cols-2"><Card><CardHeader><CardTitle className="text-lg">Upcoming events</CardTitle></CardHeader><CardContent className="space-y-3">{upcomingEvents.length === 0 ? <div className="rounded-xl border border-dashed border-white/10 p-5 text-sm text-muted-foreground">No upcoming events yet. Create one to begin planning.</div> : upcomingEvents.map((event) => <div key={event.id} className="flex items-center justify-between gap-3 rounded-xl bg-white/[.035] p-3 text-sm"><div><p className="font-semibold">{event.title}</p><p className="mt-0.5 text-xs text-muted-foreground">{new Date(event.start_date).toLocaleString()}</p></div><span className="text-xs text-muted-foreground">{event.registered_count}{event.capacity ? `/${event.capacity}` : ''}</span></div>)}</CardContent></Card><Card><CardHeader><CardTitle className="text-lg">Recent check-ins</CardTitle></CardHeader><CardContent className="space-y-3">{recentCheckIns.length === 0 ? <div className="rounded-xl border border-dashed border-white/10 p-5 text-sm text-muted-foreground">No attendees have checked in yet.</div> : recentCheckIns.map((checkIn) => <div key={`${checkIn.event_id}-${checkIn.checked_in_at}`} className="rounded-xl bg-white/[.035] p-3 text-sm"><p className="font-semibold">{checkIn.attendee_name} <span className="font-normal text-muted-foreground">· {checkIn.event_title}</span></p><p className="mt-0.5 text-xs text-muted-foreground">{new Date(checkIn.checked_in_at).toLocaleString()} by {checkIn.checked_in_by_name}</p></div>)}</CardContent></Card></div><EventsManagementPage />{user?.college_id && <CollegeMembersSection collegeId={user.college_id} />}</div>;
};
