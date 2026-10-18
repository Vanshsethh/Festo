import React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarDays, MapPin, Ticket, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { eventsService } from '../../services/events.service.js';
import { Card, CardContent } from '../../components/ui/card.jsx';
import { Button } from '../../components/ui/button.jsx';

export const MyRegistrationsPage = () => {
  const queryClient = useQueryClient(); const [message, setMessage] = React.useState(''); const { data, isLoading } = useQuery({ queryKey: ['registrations'], queryFn: eventsService.myRegistrations });
  const cancel = useMutation({
    mutationFn: eventsService.cancelRegistration,
    onSuccess: () => {
      setMessage('Registration cancelled. The event capacity has been updated.');
      queryClient.invalidateQueries({ queryKey: ['registrations'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['event'] });
    },
    onError: (error) => setMessage(error.response?.data?.message || 'Could not cancel this registration.'),
  }); const items = data?.data?.registrations || [];
  if (isLoading) return <div className="mx-auto grid max-w-4xl gap-4 py-8">{Array.from({ length: 3 }, (_, i) => <div key={i} className="skeleton h-40 rounded-2xl" />)}</div>;
  return <div className="mx-auto max-w-4xl space-y-6 py-8"><div><p className="text-[11px] font-bold uppercase tracking-[.22em] text-fuchsia-300">Your plans</p><h1 className="mt-1 text-3xl font-extrabold">My registrations</h1><p className="mt-1 text-sm text-muted-foreground">Your confirmed campus experiences, all in one place.</p></div>{message && <p className="rounded-xl border border-fuchsia-500/20 bg-fuchsia-500/10 p-3 text-sm text-fuchsia-200">{message}</p>}{items.length === 0 ? <Card className="p-10 text-center"><Ticket className="mx-auto h-8 w-8 text-fuchsia-300" /><h2 className="mt-4 font-bold">Nothing booked yet</h2><p className="mt-1 text-sm text-muted-foreground">Discover an event and your registration will appear here.</p><Button asChild className="mt-5"><Link to="/explore">Explore events</Link></Button></Card> : items.map((item) => { const canCancel = item.registration_status === 'CONFIRMED' && new Date() < new Date(item.start_date); return <Card key={item.id} className="group overflow-hidden"><CardContent className="flex flex-wrap items-center justify-between gap-5 p-5 sm:p-6"><div className="flex min-w-0 items-center gap-4"><div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-500/30 to-violet-600/20 text-fuchsia-200"><Ticket className="h-6 w-6" /></div><div className="min-w-0"><p className="font-bold text-white">{item.title}</p><p className="mt-0.5 text-sm text-muted-foreground">{item.college_name}</p><div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground"><span className="flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5 text-violet-300" />{new Date(item.start_date).toLocaleString()}</span><span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-fuchsia-300" />{item.venue || 'Venue TBA'}</span></div></div></div><div className="flex shrink-0 items-center gap-3"><p className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold tracking-wide text-emerald-300">{item.registration_status}</p>{canCancel && <Button variant="outline" size="sm" onClick={() => { setMessage(''); cancel.mutate(item.id); }} disabled={cancel.isPending}><XCircle className="mr-1 h-3.5 w-3.5" />Cancel</Button>}</div></CardContent></Card>; })}</div>;
};
