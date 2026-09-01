import React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarDays, MapPin, XCircle } from 'lucide-react';
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
  if (isLoading) return <p className="py-12 text-center text-muted-foreground">Loading registrations…</p>;
  return <div className="max-w-4xl mx-auto py-8 space-y-6"><div><h1 className="text-3xl font-extrabold">My registrations</h1><p className="text-sm text-muted-foreground">Cancel confirmed registrations any time before the event begins.</p></div>{message && <p className="text-sm text-purple-300">{message}</p>}{items.length === 0 ? <Card className="p-10 text-center text-muted-foreground">You have not registered for an event yet.</Card> : items.map((item) => { const canCancel = item.registration_status === 'CONFIRMED' && new Date() < new Date(item.start_date); return <Card key={item.id}><CardContent className="p-5 flex flex-wrap gap-4 justify-between items-center"><div><p className="font-bold">{item.title}</p><p className="text-sm text-muted-foreground">{item.college_name}</p><p className="text-xs text-muted-foreground flex gap-1 mt-2"><CalendarDays className="w-3.5 h-3.5" />{new Date(item.start_date).toLocaleString()}</p><p className="text-xs text-muted-foreground flex gap-1"><MapPin className="w-3.5 h-3.5" />{item.venue || 'Venue TBA'}</p></div><div className="text-right"><p className="text-xs font-bold text-purple-300 mb-2">{item.registration_status}</p>{canCancel && <Button variant="outline" size="sm" onClick={() => { setMessage(''); cancel.mutate(item.id); }} disabled={cancel.isPending}><XCircle className="w-3.5 h-3.5 mr-1" />Cancel</Button>}</div></CardContent></Card>; })}</div>;
};
