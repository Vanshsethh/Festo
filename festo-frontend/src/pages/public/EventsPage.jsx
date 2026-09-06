import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarDays, MapPin, Search, Users, Building2, Trash2, AlertTriangle } from 'lucide-react';
import { eventsService } from '../../services/events.service.js';
import { Input } from '../../components/ui/input.jsx';
import { Card, CardContent } from '../../components/ui/card.jsx';
import { Button } from '../../components/ui/button.jsx';
import { useAuth } from '../../hooks/useAuth.jsx';

const date = (value) => new Date(value).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
const statusLabel = (event) => event.display_status?.replaceAll('_', ' ') || event.status?.replaceAll('_', ' ') || '';

export const EventsPage = () => {
  const [search, setSearch] = useState('');
  const { data, isLoading } = useQuery({
    queryKey: ['events', search],
    queryFn: () => eventsService.list({ search: search || undefined })
  });
  const events = data?.data?.events || [];

  return (
    <div className="max-w-7xl mx-auto py-8 space-y-7 px-4">
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-extrabold tracking-tight">Discover college events</h1>
        <p className="text-muted-foreground">Find fests, workshops, competitions, and more.</p>
      </div>
      <div className="relative max-w-xl mx-auto">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          className="pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search events or colleges"
        />
      </div>
      {isLoading ? (
        <p className="text-center text-muted-foreground py-12">Loading events…</p>
      ) : events.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground">No upcoming events match your search yet.</Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
};

const EventCard = ({ event }) => {
  const [imgError, setImgError] = useState(false);
  const hasPoster = Boolean(event.poster_url?.trim()) && !imgError;

  return (
    <Card className="overflow-hidden flex flex-col hover:border-purple-500/40 hover:shadow-lg transition-all duration-200">
      <div className="relative aspect-[16/9] w-full bg-slate-950 overflow-hidden flex items-center justify-center">
        {hasPoster ? (
          <>
            <img
              src={event.poster_url}
              alt=""
              aria-hidden="true"
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover blur-md opacity-30 scale-105"
            />
            <img
              src={event.poster_url}
              alt={event.title}
              referrerPolicy="no-referrer"
              className="relative z-10 w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
          </>
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-purple-900/30 to-indigo-900/20 flex flex-col items-center justify-center text-purple-300">
            <CalendarDays className="w-10 h-10 mb-1" />
            <span className="text-[10px] font-semibold tracking-wider uppercase text-purple-400/80">{event.category}</span>
          </div>
        )}
      </div>

      <CardContent className="p-5 space-y-3 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          <div className="flex justify-between items-center gap-3">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
              {event.category}
            </span>
            <span className="text-[10px] font-bold text-emerald-400">
              {statusLabel(event)}
            </span>
          </div>
          <h2 className="font-bold text-lg leading-tight line-clamp-1">{event.title}</h2>
          <p className="text-sm text-muted-foreground flex items-center gap-1.5 line-clamp-1">
            <Building2 className="w-4 h-4 shrink-0 text-purple-400" />
            {event.college_name}
          </p>
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <CalendarDays className="w-3.5 h-3.5 shrink-0 text-purple-400" />
            {date(event.start_date)}
          </p>
        </div>

        <Button asChild className="w-full mt-3">
          <Link to={`/events/${event.slug}`}>View event</Link>
        </Button>
      </CardContent>
    </Card>
  );
};

export const EventDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuth();
  const [message, setMessage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [bannerError, setBannerError] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['event', slug],
    queryFn: () => eventsService.get(slug),
  });
  const event = data?.data?.event;

  const registration = useQuery({
    queryKey: ['registrations'],
    queryFn: eventsService.myRegistrations,
    enabled: isAuthenticated && user?.role === 'USER',
  });

  const registered = registration.data?.data?.registrations?.find(
    (item) => item.event_id === event?.id && item.registration_status === 'CONFIRMED'
  );

  const register = useMutation({
    mutationFn: ({ eventId, quantity }) => eventsService.register(eventId, quantity),
    onSuccess: () => {
      setMessage(`You are registered for ${quantity} ticket${quantity > 1 ? 's' : ''}. You can view and present your passes in My Tickets.`);
      queryClient.invalidateQueries({ queryKey: ['registrations'] });
      queryClient.invalidateQueries({ queryKey: ['event', slug] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => eventsService.delete(event.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['events', 'mine'] });
      navigate('/events', { replace: true });
    },
    onError: (e) => setMessage(e.response?.data?.message || 'Failed to delete event.'),
  });

  if (isLoading) return <p className="py-16 text-center text-muted-foreground">Loading event…</p>;
  if (isError || !event) return <Card className="max-w-xl mx-auto my-12 p-10 text-center">Event not found or has concluded.</Card>;

  const isCreator = user && (user.id === event.created_by || user.role === 'ADMIN');
  const hasEnded = new Date(event.end_date) < new Date();

  const canRegister = !hasEnded &&
    event.display_status === 'REGISTRATION_OPEN' &&
    (!event.capacity || event.registered_count < event.capacity) &&
    new Date(event.registration_deadline) > new Date();

  const maxAvailable = event.capacity
    ? Math.max(0, event.capacity - event.registered_count)
    : 10;

  const registerClick = () => {
    if (!isAuthenticated) return navigate('/login', { state: { from: `/events/${slug}` } });
    if (user?.role !== 'USER') return setMessage('Only student user accounts can register for events.');
    if (quantity > maxAvailable) return setMessage(`Only ${maxAvailable} ticket${maxAvailable !== 1 ? 's' : ''} available.`);
    register.mutate(
      { eventId: event.id, quantity },
      { onError: (e) => setMessage(e.response?.data?.message || 'Registration failed.') }
    );
  };

  const hasPoster = Boolean(event.poster_url?.trim()) && !bannerError;

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-6 px-4">
      <Card className="overflow-hidden border-purple-500/20 shadow-xl">
        {/* Banner Section with ambient background and contained unmagnified main banner */}
        <div className="relative w-full min-h-[240px] max-h-[460px] bg-slate-950 overflow-hidden flex items-center justify-center border-b border-border/40">
          {hasPoster ? (
            <>
              <img
                src={event.poster_url}
                alt=""
                aria-hidden="true"
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-35 scale-110"
              />
              <img
                src={event.poster_url}
                alt={event.title}
                referrerPolicy="no-referrer"
                className="relative z-10 max-h-[440px] w-auto max-w-full object-contain p-2 shadow-2xl"
                onError={() => setBannerError(true)}
              />
            </>
          ) : (
            <div className="h-56 w-full bg-gradient-to-br from-purple-950 via-slate-900 to-indigo-950 flex flex-col items-center justify-center text-purple-300">
              <CalendarDays className="w-14 h-14 mb-2 opacity-80" />
              <span className="text-xs font-semibold uppercase tracking-widest text-purple-400">
                {event.category} EVENT
              </span>
            </div>
          )}
        </div>

        <CardContent className="p-7 space-y-6">
          <div className="flex flex-wrap justify-between items-start gap-4">
            <div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
                {event.category}
              </span>
              <h1 className="text-3xl font-extrabold mt-3">{event.title}</h1>
              <p className="text-muted-foreground mt-1 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-purple-400" />
                Hosted by {event.college_name}
              </p>
            </div>

            {/* Event Creator Actions */}
            {isCreator && (
              <div className="flex items-center gap-2">
                {!showDeleteConfirm ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-destructive/40 text-destructive hover:bg-destructive/10 gap-1.5"
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Event
                  </Button>
                ) : (
                  <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/30 p-2 rounded-lg text-xs">
                    <AlertTriangle className="w-4 h-4 text-destructive shrink-0" />
                    <span>Confirm delete event?</span>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-7 px-2.5 text-xs"
                      disabled={deleteMutation.isPending}
                      onClick={() => deleteMutation.mutate()}
                    >
                      {deleteMutation.isPending ? 'Deleting…' : 'Yes, Delete'}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-xs"
                      onClick={() => setShowDeleteConfirm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          <p className="whitespace-pre-wrap text-sm leading-6 text-foreground/90">
            {event.description || 'No event description provided.'}
          </p>

          <div className="grid sm:grid-cols-2 gap-4 text-sm bg-muted/30 p-4 rounded-xl border border-border/50">
            <p className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-purple-400 shrink-0" />
              <span>{date(event.start_date)} — {date(event.end_date)}</span>
            </p>
            <p className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-purple-400 shrink-0" />
              <span>{event.venue || 'Venue to be announced'}</span>
            </p>
            <p className="flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-400 shrink-0" />
              <span>{event.capacity ? `${event.registered_count}/${event.capacity} seats booked` : 'Unlimited capacity'}</span>
            </p>
          </div>

          {message && (
            <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-sm text-purple-300">
              {message}
            </div>
          )}

          {hasEnded ? (
            <div className="p-4 rounded-xl bg-muted text-center text-sm text-muted-foreground">
              This event has concluded.
            </div>
          ) : (
            <div className="space-y-4 pt-2">
              {!registered && canRegister && (
                <div className="space-y-2 bg-purple-500/5 border border-purple-500/10 p-4 rounded-xl">
                  <label className="block text-sm font-medium text-foreground">
                    Number of Passes / Tickets
                  </label>
                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                      disabled={quantity <= 1 || register.isPending}
                      className="w-10 h-10 rounded-lg text-lg font-bold"
                    >
                      −
                    </Button>
                    <span className="w-12 text-center font-mono text-lg font-bold">
                      {quantity}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantity((prev) => Math.min(Math.min(10, maxAvailable), prev + 1))}
                      disabled={quantity >= Math.min(10, maxAvailable) || register.isPending}
                      className="w-10 h-10 rounded-lg text-lg font-bold"
                    >
                      +
                    </Button>
                    <span className="text-xs text-muted-foreground ml-2">
                      (1 pass generated per ticket · max {Math.min(10, maxAvailable)})
                    </span>
                  </div>
                </div>
              )}

              <Button
                onClick={registerClick}
                disabled={!canRegister || Boolean(registered) || register.isPending || quantity < 1}
                className="w-full h-11 text-base bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500"
              >
                {registered
                  ? 'You are registered for this event'
                  : !canRegister
                  ? 'Registration closed'
                  : register.isPending
                  ? 'Generating passes…'
                  : `Register & Claim ${quantity} Pass${quantity > 1 ? 'es' : ''}`}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};