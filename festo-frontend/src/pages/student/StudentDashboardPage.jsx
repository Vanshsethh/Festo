import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { CalendarDays, CheckCircle2, Clock3, Ticket, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { dashboardService } from '../../services/dashboard.service.js';
import { MetricCard } from '../../components/common/MetricCard.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card.jsx';
import { Button } from '../../components/ui/button.jsx';

export const StudentDashboardPage = () => {
  const { data, isLoading } = useQuery({ queryKey: ['dashboard', 'user'], queryFn: dashboardService.user });
  if (isLoading) return <p className="py-12 text-center text-muted-foreground">Loading your dashboard…</p>;
  const { metrics = {}, upcoming_tickets: upcomingTickets = [] } = data?.data || {};
  return <div className="max-w-6xl mx-auto py-8 space-y-7"><div><h1 className="text-3xl font-extrabold">User dashboard</h1><p className="text-sm text-muted-foreground">Your tickets, registrations, and upcoming event plans at a glance.</p></div><div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4"><MetricCard label="Total registrations" value={metrics.total_registrations} icon={Ticket} /><MetricCard label="Upcoming" value={metrics.upcoming_registrations} icon={Clock3} tone="cyan" /><MetricCard label="Attended" value={metrics.attended_registrations} icon={CheckCircle2} tone="emerald" /><MetricCard label="Cancelled" value={metrics.cancelled_registrations} icon={XCircle} tone="red" /></div><Card><CardHeader className="flex flex-row items-center justify-between"><CardTitle className="text-lg">Upcoming tickets</CardTitle><Button asChild size="sm" variant="outline"><Link to="/tickets">All tickets</Link></Button></CardHeader><CardContent className="space-y-3">{upcomingTickets.length === 0 ? <p className="text-sm text-muted-foreground py-4">No upcoming tickets yet.</p> : upcomingTickets.map((ticket) => <div key={ticket.ticket_id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border p-3.5"><div><p className="font-semibold">{ticket.title}</p><p className="text-xs text-muted-foreground">{ticket.college_name} · {new Date(ticket.start_date).toLocaleString()}</p></div><Button asChild size="sm" variant="ghost"><Link to={`/events/${ticket.slug}`}><CalendarDays className="w-3.5 h-3.5 mr-1" />Event details</Link></Button></div>)}</CardContent></Card></div>;
};