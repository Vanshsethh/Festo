import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Sparkles, QrCode, CalendarDays, MapPin, ArrowRight, Ticket } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.jsx';
import { ticketsService } from '../../services/tickets.service.js';

export const PersonalizedHeader = () => {
  const { user, isAuthenticated } = useAuth();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const { data: ticketsData } = useQuery({
    queryKey: ['tickets', 'upcoming-quick'],
    queryFn: ticketsService.listMine,
    enabled: Boolean(isAuthenticated),
    staleTime: 1000 * 60 * 2,
  });

  const tickets = ticketsData?.data?.tickets || [];
  // Find the next upcoming event
  const upcomingTicket = tickets
    .filter((t) => new Date(t.start_date) >= new Date(Date.now() - 3600000 * 4)) // not ended long ago
    .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())[0];

  const displayName = user?.name ? user.name.split(' ')[0] : 'Explorer';

  return (
    <div className="space-y-6">
      {/* Top Greeting Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-pink-500/20 bg-pink-500/10 px-3 py-1 text-xs font-bold text-pink-300 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Campus Culture & Event Hub</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            {getGreeting()}, <span className="text-pink-400">{displayName}</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Discover what’s lighting up campuses near you today.
          </p>
        </div>

        {/* Quick action buttons */}
        <div className="flex items-center gap-3">
          <Link
            to="/explore"
            className="px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white text-xs font-bold transition-all active:scale-95"
          >
            Explore All Events
          </Link>
          {isAuthenticated && (
            <Link
              to="/tickets"
              className="px-4 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold shadow-lg shadow-pink-600/30 flex items-center gap-2 transition-all active:scale-95"
            >
              <Ticket className="w-4 h-4" />
              <span>My Wallet</span>
            </Link>
          )}
        </div>
      </div>

      {/* Next Event / Upcoming Pass Shortcut (if user has an upcoming booking) */}
      {isAuthenticated && upcomingTicket && (
        <div className="relative overflow-hidden rounded-3xl border border-pink-500/30 bg-gradient-to-r from-pink-950/40 via-[#150e22] to-violet-950/40 p-5 sm:p-6 shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-pink-600/20 border border-pink-500/30 text-pink-400 flex items-center justify-center shrink-0">
                <QrCode className="w-6 h-6" />
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-pink-500/20 text-pink-300 border border-pink-500/30">
                    Your Next Event
                  </span>
                  {upcomingTicket.ticket_code && (
                    <span className="font-mono text-xs font-semibold text-slate-400">
                      #{upcomingTicket.ticket_code}
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-white leading-snug">
                  {upcomingTicket.title}
                </h3>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 mt-1">
                  <span className="flex items-center gap-1.5 text-cyan-300 font-medium">
                    <CalendarDays className="w-3.5 h-3.5" />
                    {new Date(upcomingTicket.start_date).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-pink-400" />
                    {upcomingTicket.venue || upcomingTicket.college_name}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 self-end md:self-center">
              <Link
                to="/tickets"
                className="px-4 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-pink-600/30 transition-all active:scale-95"
              >
                <span>View Digital Pass</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
