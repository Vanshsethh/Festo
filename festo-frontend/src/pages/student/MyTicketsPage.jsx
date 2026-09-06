import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CalendarDays, Clock3, MapPin, QrCode, Ticket, ShieldCheck } from 'lucide-react';
import { ticketsService } from '../../services/tickets.service.js';
import { Card, CardContent } from '../../components/ui/card.jsx';
import { Button } from '../../components/ui/button.jsx';

const dateTime = (value) => new Date(value).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });

export const MyTicketsPage = () => {
  const [selectedTicketId, setSelectedTicketId] = React.useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['tickets'],
    queryFn: ticketsService.listMine,
    refetchInterval: (query) =>
      query.state.data?.data?.tickets?.some((ticket) => !ticket.ticket_id) ? 3000 : false,
  });

  const tickets = data?.data?.tickets || [];

  // Automatically select the first ticket if none is selected
  useEffect(() => {
    if (!selectedTicketId && tickets.length > 0 && tickets[0].ticket_id) {
      setSelectedTicketId(tickets[0].ticket_id);
    }
  }, [tickets, selectedTicketId]);

  const { data: ticketData, isLoading: isLoadingTicket, isError: isTicketError } = useQuery({
    queryKey: ['tickets', selectedTicketId],
    queryFn: () => ticketsService.getMine(selectedTicketId),
    enabled: Boolean(selectedTicketId),
  });

  const selectedTicket = ticketData?.data?.ticket;

  if (isLoading) return <p className="py-12 text-center text-muted-foreground">Loading your tickets & passes…</p>;

  return (
    <div className="max-w-5xl mx-auto py-8 space-y-6 px-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
          <Ticket className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Tickets & Event Passes</h1>
          <p className="text-sm text-muted-foreground">
            Each ticket has its own dedicated pass and entry QR code (1:1 ticket to pass).
          </p>
        </div>
      </div>

      {tickets.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground">
          You do not have any active event passes yet. Browse upcoming events to register.
        </Card>
      ) : (
        <div className="grid lg:grid-cols-[1fr_360px] gap-6 items-start">
          <div className="space-y-4">
            {tickets.map((ticket, idx) => {
              const passKey = ticket.ticket_id || `${ticket.registration_id}-${ticket.ticket_number || idx}`;
              const isSelected = selectedTicketId === ticket.ticket_id;
              const passNumber = ticket.ticket_number || (idx + 1);
              const totalQuantity = ticket.quantity || 1;

              return (
                <Card
                  key={passKey}
                  className={`overflow-hidden transition-all duration-200 ${
                    isSelected ? 'border-purple-500 shadow-md ring-1 ring-purple-500/30' : 'hover:border-purple-500/30'
                  }`}
                >
                  <CardContent className="p-5 flex flex-wrap justify-between items-center gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-500/10 text-purple-300 border border-purple-500/20">
                          Pass #{passNumber} of {totalQuantity}
                        </span>
                        {ticket.ticket_code && (
                          <span className="font-mono text-xs font-semibold text-muted-foreground tracking-wider">
                            {ticket.ticket_code}
                          </span>
                        )}
                      </div>
                      <p className="font-bold text-lg leading-tight">{ticket.title}</p>
                      <p className="text-sm text-muted-foreground">{ticket.college_name}</p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <CalendarDays className="w-3.5 h-3.5 text-purple-400" />
                          {dateTime(ticket.start_date)}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-purple-400" />
                          {ticket.venue || 'Venue TBA'}
                        </span>
                      </div>
                    </div>

                    {ticket.ticket_id ? (
                      <Button
                        size="sm"
                        variant={isSelected ? 'default' : 'outline'}
                        onClick={() => setSelectedTicketId(ticket.ticket_id)}
                        className="gap-1.5"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        {isSelected ? 'Viewing Pass' : 'Show QR Pass'}
                      </Button>
                    ) : (
                      <span className="text-xs font-medium text-amber-400 flex items-center gap-1.5">
                        <Clock3 className="w-3.5 h-3.5" />
                        Generating pass…
                      </span>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card className="lg:sticky lg:top-20 overflow-hidden border-purple-500/20 shadow-xl">
            {selectedTicketId ? (
              <CardContent className="p-6 text-center space-y-4">
                {isLoadingTicket ? (
                  <p className="py-12 text-sm text-muted-foreground">Loading secure pass…</p>
                ) : isTicketError ? (
                  <p className="py-12 text-sm text-destructive">This pass is no longer available.</p>
                ) : (
                  selectedTicket && (
                    <>
                      <div className="space-y-1">
                        <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-500/10 text-purple-300 border border-purple-500/20">
                          <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                          Pass #{selectedTicket.ticket_number || 1}
                        </div>
                        <h2 className="font-bold text-lg leading-tight mt-2">{selectedTicket.title}</h2>
                        <p className="text-xs text-muted-foreground">{selectedTicket.college_name}</p>
                      </div>

                      <div className="rounded-2xl bg-white p-3 inline-block shadow-inner border border-slate-200">
                        <img
                          src={selectedTicket.qr_code_data_url}
                          alt={`QR Pass for ${selectedTicket.title}`}
                          className="w-56 h-56"
                        />
                      </div>

                      <div>
                        <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold">
                          Ticket Pass Code
                        </p>
                        <p className="font-mono font-bold tracking-wider text-lg mt-0.5 text-purple-400">
                          {selectedTicket.ticket_code}
                        </p>
                      </div>

                      <p className="text-xs text-muted-foreground bg-muted/40 p-2.5 rounded-lg">
                        Present this pass at the entrance. Each attendee must have an individual pass.
                      </p>
                    </>
                  )
                )}
              </CardContent>
            ) : (
              <CardContent className="p-10 text-center text-sm text-muted-foreground">
                Select any pass on the left to view its QR code.
              </CardContent>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};