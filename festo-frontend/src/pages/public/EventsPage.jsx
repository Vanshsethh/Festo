import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarDays, MapPin, Search, Users, Building2 } from 'lucide-react';
import { eventsService } from '../../services/events.service.js';
import { Input } from '../../components/ui/input.jsx';
import { Card, CardContent } from '../../components/ui/card.jsx';
import { Button } from '../../components/ui/button.jsx';
import { useAuth } from '../../hooks/useAuth.jsx';

const date = (value) => new Date(value).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
const statusLabel = (event) => event.display_status?.replaceAll('_', ' ') || event.status.replaceAll('_', ' ');

export const EventsPage = () => {
  const [search, setSearch] = useState('');
  const { data, isLoading } = useQuery({ queryKey: ['events', search], queryFn: () => eventsService.list({ search: search || undefined }) });
  const events = data?.data?.events || [];
  return <div className="max-w-7xl mx-auto py-8 space-y-7">
    <div className="text-center space-y-3"><h1 className="text-3xl font-extrabold">Discover college events</h1><p className="text-muted-foreground">Find fests, workshops, competitions, and more.</p></div>
    <div className="relative max-w-xl mx-auto"><Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search events or colleges" /></div>
    {isLoading ? <p className="text-center text-muted-foreground">Loading events…</p> : events.length === 0 ? <Card className="p-12 text-center text-muted-foreground">No published events match your search yet.</Card> : <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">{events.map((event) => <EventCard key={event.id} event={event} />)}</div>}
  </div>;
};

const EventCard = ({ event }) => <Card className="overflow-hidden flex flex-col"><div className="h-36 bg-gradient-to-br from-purple-600/30 to-indigo-700/20 flex items-center justify-center">{event.poster_url ? <img src={event.poster_url} alt="" className="w-full h-full object-cover" /> : <CalendarDays className="w-11 h-11 text-purple-300" />}</div><CardContent className="p-5 space-y-3 flex-1"><div className="flex justify-between gap-3"><span className="text-[10px] font-bold px-2 py-1 rounded-full bg-purple-500/10 text-purple-300">{event.category}</span><span className="text-[10px] font-bold text-emerald-400">{statusLabel(event)}</span></div><h2 className="font-bold text-lg leading-tight">{event.title}</h2><p className="text-sm text-muted-foreground flex gap-1.5"><Building2 className="w-4 h-4 shrink-0" />{event.college_name}</p><p className="text-sm text-muted-foreground flex gap-1.5"><CalendarDays className="w-4 h-4 shrink-0" />{date(event.start_date)}</p><Button asChild className="w-full mt-2"><Link to={`/events/${event.slug}`}>View event</Link></Button></CardContent></Card>;

export const EventDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuth();
  const [message, setMessage] = useState('');
  const [quantity, setQuantity] = useState(1);

  const { data, isLoading, isError } = useQuery({ queryKey: ['event', slug], queryFn: () => eventsService.get(slug) });
  const event = data?.data?.event;

  const registration = useQuery({
    queryKey: ['registrations'],
    queryFn: eventsService.myRegistrations,
    enabled: isAuthenticated && user?.role === 'USER'
  });

  const registered = registration.data?.data?.registrations?.find((item) => item.event_id === event?.id && item.registration_status === 'CONFIRMED');

  const register = useMutation({
    mutationFn: (eventId, qty) => eventsService.register(eventId, qty),
    onSuccess: () => {
      setMessage(`You are registered for ${quantity} ticket${quantity > 1 ? 's' : ''}. You can manage this registration from My tickets.`);
      queryClient.invalidateQueries({ queryKey: ['registrations'] });
      queryClient.invalidateQueries({ queryKey: ['event', slug] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  });

  if (isLoading) return <p className="py-16 text-center text-muted-foreground">Loading event…</p>;
  if (isError || !event) return <Card className="max-w-xl mx-auto my-12 p-10 text-center">Event not found.</Card>;

  const canRegister = event.display_status === 'REGISTRATION_OPEN' &&
                     (!event.capacity || event.registered_count < event.capacity) &&
                     event.registration_deadline > new Date().toISOString();

  const maxAvailable = event.capacity ? Math.max(0, event.capacity - event.registered_count) : 999; // Assuming unlimited if no capacity

  const registerClick = () => {
    if (!isAuthenticated) return navigate('/login', { state: { from: `/events/${slug}` } });
    if (user?.role !== 'USER') return setMessage('Only user accounts can register for events.');
    if (quantity > maxAvailable) return setMessage(`Only ${maxAvailable} ticket${maxAvailable !== 1 ? 's' : ''} available.`);
    register.mutate(event.id, quantity, { onError: (e) => setMessage(e.response?.data?.message || 'Registration failed.') });
  };

  return <div className="max-w-4xl mx-auto py-8 space-y-6"><Card className="overflow-hidden"><div className="h-56 bg-gradient-to-br from-purple-600/30 to-indigo-700/20">{event.poster_url && <img src={event.poster_url} alt="" className="w-full h-full object-cover" />}</div><CardContent className="p-7 space-y-6"><div><span className="text-xs font-bold text-purple-300">{event.category}</span><h1 className="text-3xl font-extrabold mt-2">{event.title}</h1><p className="text-muted-foreground mt-2">Hosted by {event.college_name}</p></div><p className="whitespace-pre-wrap text-sm leading-6">{event.description || 'No event description provided.'}</p><div className="grid sm:grid-cols-2 gap-4 text-sm"><p className="flex gap-2"><CalendarDays className="w-4 h-4 text-purple-400" />{date(event.start_date)} — {date(event.end_date)}</p><p className="flex gap-2"><MapPin className="w-4 h-4 text-purple-400" />{event.venue || 'Venue to be announced'}</p><p className="flex gap-2"><Users className="w-4 h-4 text-purple-400" />{event.capacity ? `${event.registered_count}/${event.capacity} seats` : 'Unlimited capacity'}</p></div>{message && <p className="text-sm text-purple-300">{message}</p>}<div className="mt-4 space-y-4"><label className="block text-sm font-medium text-purple-700 mb-2">Number of Tickets</label><div className="flex items-center gap-3"><Button variant="outline" onClick={() => setQuantity(prev => Math.max(1, prev - 1))} disabled={quantity <= 1 || quantity > maxAvailable} className="w-10 h-10 rounded-lg border border-purple-300 bg-white hover:bg-purple-50 flex items-center justify-center"><span className="text-purple-600">−</span></Button><span className="w-10 text-center font-mono">{quantity}</span><Button variant="outline" onClick={() => setQuantity(prev => Math.min(maxAvailable, prev + 1))} disabled={quantity >= maxAvailable} className="w-10 h-10 rounded-lg border border-purple-300 bg-white hover:bg-purple-50 flex items-center justify-center"><span className="text-purple-600">+</span></Button></div><p className="text-xs text-muted-foreground mt-1">Select quantity (max: {maxAvailable})</p></div><Button onClick={registerClick} disabled={!canRegister || Boolean(registered) || register.isPending || quantity < 1} className="w-full">{registered ? 'You are registered' : !canRegister ? 'Registration closed' : register.isPending ? 'Registering…' : `Register for ${quantity} ticket${quantity > 1 ? 's' : ''}`}</Button></CardContent></Card></div>;
};