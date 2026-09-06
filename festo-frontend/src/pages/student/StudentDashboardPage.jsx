import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CalendarDays,
  Clock3,
  MapPin,
  QrCode,
  Sparkles,
  Ticket,
  Users,
  Building2,
  PlusCircle,
  ExternalLink,
  Trash2,
  AlertTriangle,
  Pencil
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { dashboardService } from '../../services/dashboard.service.js';
import { eventsService } from '../../services/events.service.js';
import { MetricCard } from '../../components/common/MetricCard.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card.jsx';
import { Button } from '../../components/ui/button.jsx';
import { EditEventModal } from '../../components/events/EditEventModal.jsx';

const dateTime = (value) =>
  new Date(value).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });

export const StudentDashboardPage = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'hosted' | 'participated'
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard', 'user'],
    queryFn: dashboardService.user,
  });

  const deleteMutation = useMutation({
    mutationFn: (eventId) => eventsService.delete(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'user'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      setDeleteConfirmId(null);
    },
  });

  if (isLoading) {
    return <p className="py-16 text-center text-muted-foreground">Loading your dashboard…</p>;
  }

  if (isError) {
    return (
      <Card className="max-w-xl mx-auto my-12 p-8 text-center text-muted-foreground">
        Could not load dashboard data. Please refresh or try logging in again.
      </Card>
    );
  }

  const {
    metrics = {},
    hosted_events: hostedEvents = [],
    participated_events: participatedEvents = []
  } = data?.data || {};

  const totalHosted = metrics.total_hosted_events || hostedEvents.length || 0;
  const totalParticipated = metrics.confirmed_registrations || participatedEvents.length || 0;
  const totalAttendees = metrics.total_attendees_hosted || 0;
  const totalPasses = metrics.total_passes || 0;

  return (
    <div className="max-w-6xl mx-auto py-8 space-y-8 px-4">
      {/* Dashboard Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">My Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track your hosted events, registrations, and claimed event passes.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button asChild variant="outline" size="sm">
            <Link to="/explore">Explore Events</Link>
          </Button>
          <Button asChild size="sm" className="bg-gradient-to-r from-purple-600 to-indigo-600 gap-1.5">
            <Link to="/host">
              <PlusCircle className="w-4 h-4" />
              Host an Event
            </Link>
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Hosted Events"
          value={totalHosted}
          icon={Sparkles}
          tone="purple"
        />
        <MetricCard
          label="Attendees Hosted"
          value={totalAttendees}
          icon={Users}
          tone="cyan"
        />
        <MetricCard
          label="Events Joined"
          value={totalParticipated}
          icon={Ticket}
          tone="emerald"
        />
        <MetricCard
          label="Total Passes"
          value={totalPasses}
          icon={QrCode}
          tone="purple"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-border/60 pb-3">
        <Button
          size="sm"
          variant={activeTab === 'all' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('all')}
          className="text-xs"
        >
          All Activity
        </Button>
        <Button
          size="sm"
          variant={activeTab === 'hosted' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('hosted')}
          className="text-xs gap-1.5"
        >
          Hosted Events
          <span className="px-1.5 py-0.2 rounded-full bg-purple-500/20 text-purple-300 text-[10px]">
            {hostedEvents.length}
          </span>
        </Button>
        <Button
          size="sm"
          variant={activeTab === 'participated' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('participated')}
          className="text-xs gap-1.5"
        >
          Participated Events
          <span className="px-1.5 py-0.2 rounded-full bg-purple-500/20 text-purple-300 text-[10px]">
            {participatedEvents.length}
          </span>
        </Button>
      </div>

      {/* Section 1: My Hosted Events */}
      {(activeTab === 'all' || activeTab === 'hosted') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              Events Hosted by Me
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
                {hostedEvents.length}
              </span>
            </h2>
            <Button asChild variant="ghost" size="sm" className="text-xs text-purple-400">
              <Link to="/host">+ Host another event</Link>
            </Button>
          </div>

          {hostedEvents.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground space-y-3">
              <p>You haven't hosted any events yet.</p>
              <Button asChild size="sm">
                <Link to="/host">Create your first event</Link>
              </Button>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {hostedEvents.map((event) => (
                <Card key={event.id} className="overflow-hidden border-border/70 hover:border-purple-500/30 transition-all flex flex-col justify-between">
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-300 border border-purple-500/20">
                            {event.category}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-emerald-400 bg-emerald-500/10">
                            {event.status}
                          </span>
                        </div>
                        <h3 className="font-bold text-lg leading-tight mt-1.5">{event.title}</h3>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                          <Building2 className="w-3.5 h-3.5 text-purple-400" />
                          {event.college_name}
                        </p>
                      </div>
                      {event.poster_url && (
                        <img
                          src={event.poster_url}
                          alt=""
                          referrerPolicy="no-referrer"
                          className="w-14 h-14 rounded-lg object-cover border border-border/50 shrink-0"
                        />
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground pt-1 border-t border-border/40">
                      <p className="flex items-center gap-1.5">
                        <CalendarDays className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                        <span className="truncate">{dateTime(event.start_date)}</span>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                        <span>
                          {event.registered_count || 0}
                          {event.capacity ? ` / ${event.capacity}` : ' registered'}
                        </span>
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1.5 text-xs border-purple-500/30 text-purple-300 hover:bg-purple-500/10"
                          onClick={() => setEditingEvent(event)}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          Edit Details
                        </Button>
                        <Button asChild size="sm" variant="outline" className="gap-1.5 text-xs">
                          <Link to={`/events/${event.slug}`}>
                            <ExternalLink className="w-3.5 h-3.5" />
                            View
                          </Link>
                        </Button>
                      </div>

                      {deleteConfirmId === event.id ? (
                        <div className="flex items-center gap-1.5 bg-destructive/10 p-1 rounded-lg">
                          <span className="text-[11px] text-destructive px-1">Confirm?</span>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="h-6 px-2 text-[11px]"
                            disabled={deleteMutation.isPending}
                            onClick={() => deleteMutation.mutate(event.id)}
                          >
                            Delete
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 px-1.5 text-[11px]"
                            onClick={() => setDeleteConfirmId(null)}
                          >
                            ✕
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-xs text-destructive hover:bg-destructive/10 gap-1"
                          onClick={() => setDeleteConfirmId(event.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Section 2: Events I'm Attending / Participated */}
      {(activeTab === 'all' || activeTab === 'participated') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Ticket className="w-5 h-5 text-purple-400" />
              Events I'm Attending (Participated)
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
                {participatedEvents.length}
              </span>
            </h2>
            <Button asChild variant="ghost" size="sm" className="text-xs text-purple-400">
              <Link to="/tickets">View all QR passes</Link>
            </Button>
          </div>

          {participatedEvents.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground space-y-3">
              <p>You haven't registered for any events yet.</p>
              <Button asChild size="sm">
                <Link to="/explore">Explore Upcoming Events</Link>
              </Button>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {participatedEvents.map((item) => (
                <Card key={item.registration_id} className="overflow-hidden border-border/70 hover:border-purple-500/30 transition-all flex flex-col justify-between">
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-300 border border-purple-500/20">
                            {item.category}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-300 border border-purple-500/20">
                            {item.quantity || 1} Pass{item.quantity > 1 ? 'es' : ''} Claimed
                          </span>
                        </div>
                        <h3 className="font-bold text-lg leading-tight mt-1.5">{item.title}</h3>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                          <Building2 className="w-3.5 h-3.5 text-purple-400" />
                          {item.college_name}
                        </p>
                      </div>
                      {item.poster_url && (
                        <img
                          src={item.poster_url}
                          alt=""
                          referrerPolicy="no-referrer"
                          className="w-14 h-14 rounded-lg object-cover border border-border/50 shrink-0"
                        />
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground pt-1 border-t border-border/40">
                      <p className="flex items-center gap-1.5">
                        <CalendarDays className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                        <span className="truncate">{dateTime(item.start_date)}</span>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                        <span className="truncate">{item.venue || 'Venue TBA'}</span>
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <Button asChild size="sm" variant="outline" className="gap-1.5 text-xs">
                        <Link to={`/events/${item.slug}`}>
                          <ExternalLink className="w-3.5 h-3.5" />
                          Event Details
                        </Link>
                      </Button>
                      <Button asChild size="sm" className="gap-1.5 text-xs bg-purple-600 hover:bg-purple-500">
                        <Link to="/tickets">
                          <QrCode className="w-3.5 h-3.5" />
                          Show QR Passes
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Edit Event Modal */}
      <EditEventModal
        isOpen={Boolean(editingEvent)}
        event={editingEvent}
        onClose={() => setEditingEvent(null)}
      />
    </div>
  );
};