import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Activity, CalendarDays, ClipboardCheck, Users } from 'lucide-react';
import { dashboardService } from '../../services/dashboard.service.js';
import { MetricCard } from '../../components/common/MetricCard.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card.jsx';
import { useAuth } from '../../hooks/useAuth.jsx';
import { EventsManagementPage } from './EventsManagementPage.jsx';
import { CollegeMembersSection } from './CollegeMembersSection.jsx';

export const CollegeDashboardPage = () => {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({ queryKey: ['dashboard', 'college'], queryFn: dashboardService.college });
  if (isLoading) return <p className="py-12 text-center text-muted-foreground">Loading college dashboard…</p>;
  const { metrics = {}, upcoming_events: upcomingEvents = [], recent_check_ins: recentCheckIns = [] } = data?.data || {};
  const attendanceRate = metrics.registrations ? Math.round((metrics.check_ins / metrics.registrations) * 100) : 0;
  return <div className="max-w-7xl mx-auto py-8 space-y-7"><div><h1 className="text-3xl font-extrabold">College dashboard</h1><p className="text-sm text-muted-foreground">Monitor events, registrations, and door attendance in one place.</p></div><div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4"><MetricCard label="All events" value={metrics.total_events} icon={CalendarDays} /><MetricCard label="Published events" value={metrics.published_events} icon={Activity} tone="cyan" /><MetricCard label="Registrations" value={metrics.registrations} icon={Users} tone="amber" /><MetricCard label={`Check-ins (${attendanceRate}%)`} value={metrics.check_ins} icon={ClipboardCheck} tone="emerald" /></div><div className="grid lg:grid-cols-2 gap-6"><Card><CardHeader><CardTitle className="text-lg">Upcoming events</CardTitle></CardHeader><CardContent className="space-y-3">{upcomingEvents.length === 0 ? <p className="text-sm text-muted-foreground">No upcoming events.</p> : upcomingEvents.map((event) => <div key={event.id} className="flex justify-between gap-3 text-sm"><div><p className="font-semibold">{event.title}</p><p className="text-xs text-muted-foreground">{new Date(event.start_date).toLocaleString()}</p></div><span className="text-xs text-muted-foreground">{event.registered_count}{event.capacity ? `/${event.capacity}` : ''}</span></div>)}</CardContent></Card><Card><CardHeader><CardTitle className="text-lg">Recent check-ins</CardTitle></CardHeader><CardContent className="space-y-3">{recentCheckIns.length === 0 ? <p className="text-sm text-muted-foreground">No attendees have checked in yet.</p> : recentCheckIns.map((checkIn) => <div key={`${checkIn.event_id}-${checkIn.checked_in_at}`} className="text-sm"><p className="font-semibold">{checkIn.attendee_name} <span className="font-normal text-muted-foreground">· {checkIn.event_title}</span></p><p className="text-xs text-muted-foreground">{new Date(checkIn.checked_in_at).toLocaleString()} by {checkIn.checked_in_by_name}</p></div>)}</CardContent></Card></div><EventsManagementPage />{user?.college_id && <CollegeMembersSection collegeId={user.college_id} />}</div>;
};
