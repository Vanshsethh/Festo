import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { CalendarDays, Clock3, MapPin, QrCode, Ticket } from 'lucide-react';
import { ticketsService } from '../../services/tickets.service.js';
import { Card, CardContent } from '../../components/ui/card.jsx';
import { Button } from '../../components/ui/button.jsx';

const dateTime = (value) => new Date(value).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });

export const MyTicketsPage = () => {
  const [selectedTicketId, setSelectedTicketId] = React.useState(null);
  const { data, isLoading } = useQuery({
    queryKey: ['tickets'],
    queryFn: ticketsService.listMine,
    refetchInterval: (query) => query.state.data?.data?.tickets?.some((ticket) => !ticket.ticket_id) ? 5000 : false,
  });
  const { data: ticketData, isLoading: isLoadingTicket, isError: isTicketError } = useQuery({
    queryKey: ['tickets', selectedTicketId],
    queryFn: () => ticketsService.getMine(selectedTicketId),
    enabled: Boolean(selectedTicketId),
  });
  const tickets = data?.data?.tickets || [];
  const selectedTicket = ticketData?.data?.ticket;

  if (isLoading) return <p className="py-12 text-center text-muted-foreground">Loading your tickets…</p>;

  return <div className="max-w-5xl mx-auto py-8 space-y-6">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400"><Ticket className="w-5 h-5" /></div>
      <div><h1 className="text-2xl font-bold">My Tickets</h1><p className="text-sm text-muted-foreground">Your tickets are generated securely after registration.</p></div>
    </div>

    {tickets.length === 0 ? <Card className="p-10 text-center text-muted-foreground">You do not have any active registrations yet.</Card> : <div className="grid lg:grid-cols-[1fr_360px] gap-6 items-start">
      <div className="space-y-4">{tickets.map((ticket) => <Card key={ticket.registration_id} className="overflow-hidden"><CardContent className="p-5 flex flex-wrap justify-between items-center gap-4"><div className="space-y-1"><p className="font-bold">{ticket.title}</p><p className="text-sm text-muted-foreground">{ticket.college_name}</p><p className="text-xs text-muted-foreground flex items-center gap-1"><CalendarDays className="w-3.5 h-3.5" />{dateTime(ticket.start_date)}</p><p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{ticket.venue || 'Venue TBA'}</p></div>{ticket.ticket_id ? <Button size="sm" variant={selectedTicketId === ticket.ticket_id ? 'default' : 'outline'} onClick={() => setSelectedTicketId(ticket.ticket_id)}><QrCode className="w-3.5 h-3.5 mr-1.5" />View ticket</Button> : <span className="text-xs font-medium text-amber-400 flex items-center gap-1.5"><Clock3 className="w-3.5 h-3.5" />Generating ticket…</span>}</CardContent></Card>)}</div>
      <Card className="lg:sticky lg:top-20 overflow-hidden">{selectedTicketId ? <CardContent className="p-6 text-center space-y-4">{isLoadingTicket ? <p className="py-12 text-sm text-muted-foreground">Loading secure ticket…</p> : isTicketError ? <p className="py-12 text-sm text-destructive">This ticket is no longer available.</p> : selectedTicket && <><div><p className="font-bold">{selectedTicket.title}</p><p className="text-xs text-muted-foreground mt-1">{selectedTicket.college_name}</p></div><div className="rounded-2xl bg-white p-3 inline-block"><img src={selectedTicket.qr_code_data_url} alt={`Ticket for ${selectedTicket.title}`} className="w-56 h-56" /></div><div><p className="text-[11px] uppercase tracking-widest text-muted-foreground">Ticket code</p><p className="font-mono font-bold tracking-wider mt-1">{selectedTicket.ticket_code}</p></div><p className="text-xs text-muted-foreground">Present this ticket at the event entrance.</p></>}</CardContent> : <CardContent className="p-10 text-center text-sm text-muted-foreground">Select a generated ticket to show its QR code.</CardContent>}</Card>
    </div>}
  </div>;
};