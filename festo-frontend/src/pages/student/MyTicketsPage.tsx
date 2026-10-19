import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Ticket,
  QrCode,
  CalendarDays,
  Clock3,
  MapPin,
  Building2,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ChevronRight,
  Maximize2,
  X,
  Sparkles,
  Download,
} from 'lucide-react';
import { ticketsService } from '../../services/tickets.service.js';
import { useToast } from '../../components/common/Toast.jsx';

type TicketStatus = 'upcoming' | 'used' | 'cancelled';
interface TicketPreview {
  ticket_id: string;
  start_date: string;
  status?: string;
  check_in_status?: string;
  registration_status?: string;
  ticket_number?: string | number;
  quantity?: number;
  poster_url?: string | null;
  title: string;
  college_name?: string;
  venue?: string;
  ticket_code?: string;
}

export const MyTicketsPage = () => {
  const [activeTab, setActiveTab] = useState<TicketStatus>('upcoming'); // 'upcoming' | 'used' | 'cancelled'
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const toast = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ['tickets'],
    queryFn: ticketsService.listMine,
    refetchInterval: (query) =>
      query.state.data?.data?.tickets?.some((ticket: TicketPreview) => !ticket.ticket_id) ? 3000 : false,
  });

  const tickets: TicketPreview[] = data?.data?.tickets || [];

  // Auto-select first ticket if available
  useEffect(() => {
    if (!selectedTicketId && tickets.length > 0 && tickets[0].ticket_id) {
      setSelectedTicketId(tickets[0].ticket_id);
    }
  }, [tickets, selectedTicketId]);

  const { data: ticketData, isLoading: isLoadingPass } = useQuery({
    queryKey: ['tickets', selectedTicketId],
    queryFn: () => ticketsService.getMine(selectedTicketId as string),
    enabled: Boolean(selectedTicketId),
  });

  const activePass = ticketData?.data?.ticket;

  // Categorize tickets into Upcoming, Used, Cancelled
  const categorizedTickets = {
    upcoming: tickets.filter((t: TicketPreview) => {
      const isConcluded = new Date(t.start_date) < new Date(Date.now() - 3600000 * 12);
      const isCheckedIn = t.status === 'USED' || t.check_in_status === 'CHECKED_IN';
      const isCancelled = t.status === 'CANCELLED' || t.registration_status === 'CANCELLED';
      return !isCheckedIn && !isCancelled && !isConcluded;
    }),
    used: tickets.filter((t: TicketPreview) => {
      const isConcluded = new Date(t.start_date) < new Date(Date.now() - 3600000 * 12);
      const isCheckedIn = t.status === 'USED' || t.check_in_status === 'CHECKED_IN';
      return (isCheckedIn || isConcluded) && t.status !== 'CANCELLED';
    }),
    cancelled: tickets.filter(
      (t: TicketPreview) => t.status === 'CANCELLED' || t.registration_status === 'CANCELLED'
    ),
  };

  const currentList = categorizedTickets[activeTab] || [];

  const handleRevealQR = (ticketId: string) => {
    setSelectedTicketId(ticketId);
    setIsQRModalOpen(true);
  };

  return (
    <div className="max-w-5xl mx-auto py-4 space-y-8 pb-16">
      {/* Wallet Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-pink-600/15 border border-pink-500/30 text-pink-400 flex items-center justify-center shadow-lg shadow-pink-950/40">
            <Ticket className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Digital Ticket Wallet
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Access your personalized campus event passes and door entry QR codes.
            </p>
          </div>
        </div>

        <Link
          to="/explore"
          className="self-start sm:self-auto px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white text-xs font-bold transition-all active:scale-95"
        >
          Browse More Events
        </Link>
      </div>

      {/* Tabs: Upcoming | Used | Cancelled */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3">
        {[
          { key: 'upcoming' as TicketStatus, label: 'Upcoming Passes', count: categorizedTickets.upcoming.length },
          { key: 'used' as TicketStatus, label: 'Used / Concluded', count: categorizedTickets.used.length },
          { key: 'cancelled' as TicketStatus, label: 'Cancelled', count: categorizedTickets.cancelled.length },
        ].map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-pink-600 text-white shadow-md shadow-pink-900/40'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  isActive ? 'bg-black/30 text-white' : 'bg-white/5 text-slate-400'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Ticket Content */}
      {isLoading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-pink-500 border-t-transparent animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Loading your digital wallet...</p>
        </div>
      ) : currentList.length === 0 ? (
        <div className="py-20 rounded-3xl border border-white/10 bg-[#100d18] text-center space-y-4 px-4">
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 text-slate-500 flex items-center justify-center mx-auto">
            <Ticket className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">No {activeTab} passes found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {activeTab === 'upcoming'
                ? 'You do not have any active event registrations. Explore upcoming campus fests and claim your pass.'
                : `You do not have any ${activeTab} passes recorded.`}
            </p>
          </div>
          {activeTab === 'upcoming' && (
            <Link
              to="/explore"
              className="inline-flex py-2.5 px-6 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-pink-600/30 transition-all active:scale-95"
            >
              Discover Events
            </Link>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {currentList.map((ticket, idx) => {
            const isConcluded = activeTab === 'used';
            const isCancelled = activeTab === 'cancelled';
            const passNum = ticket.ticket_number || idx + 1;
            const totalQty = ticket.quantity || 1;

            return (
              <div
                key={ticket.ticket_id || idx}
                className={`relative flex flex-col rounded-3xl border transition-all duration-300 overflow-hidden shadow-xl ${
                  isConcluded
                    ? 'border-white/5 bg-[#0d0a14] opacity-75'
                    : isCancelled
                    ? 'border-rose-500/20 bg-[#140a0e] opacity-75'
                    : 'border-white/10 bg-[#120e1d] hover:border-pink-500/40 hover:shadow-2xl hover:shadow-pink-950/20'
                }`}
              >
                {/* Perforation Notches on Sides */}
                <div className="ticket-notch-left" />
                <div className="ticket-notch-right" />

                {/* Top Banner Artwork */}
                <div className="relative h-32 w-full bg-slate-950 overflow-hidden">
                  {ticket.poster_url ? (
                    <img
                      src={ticket.poster_url}
                      alt={ticket.title}
                      className="h-full w-full object-cover opacity-60"
                    />
                  ) : (
                    <div className="festo-poster-fallback flex h-full w-full items-center justify-center p-4 text-center">
                      <p className="max-w-[24ch] text-lg font-black leading-tight">{ticket.title || 'Campus Event'}</p>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#120e1d] via-transparent to-black/60" />

                  {/* Top Bar on Card */}
                  <div className="absolute top-3 left-4 right-4 flex items-center justify-between z-10">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/60 backdrop-blur-md border border-white/10 text-pink-300">
                      Pass #{passNum} of {totalQty}
                    </span>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                        isConcluded
                          ? 'bg-slate-800 text-slate-400 border-slate-700'
                          : isCancelled
                          ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      }`}
                    >
                      {isConcluded ? 'Used' : isCancelled ? 'Cancelled' : 'Valid Pass'}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <h3 className="font-bold text-xl text-white leading-snug line-clamp-1">
                      {ticket.title}
                    </h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1.5 line-clamp-1">
                      <Building2 className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                      <span>{ticket.college_name}</span>
                    </p>

                    <div className="pt-2 grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 rounded-xl bg-black/30 border border-white/5 space-y-0.5">
                        <span className="text-[10px] uppercase font-bold text-slate-500">Date</span>
                        <p className="font-semibold text-slate-200">
                          {new Date(ticket.start_date).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                      </div>

                      <div className="p-2.5 rounded-xl bg-black/30 border border-white/5 space-y-0.5">
                        <span className="text-[10px] uppercase font-bold text-slate-500">Time</span>
                        <p className="font-semibold text-slate-200">
                          {new Date(ticket.start_date).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-slate-400 pt-1">
                      <MapPin className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                      <span className="truncate">{ticket.venue || 'Campus Auditorium'}</span>
                    </div>
                  </div>

                  {/* Bottom Action Area */}
                  <div className="pt-4 border-t border-dashed border-white/10 flex items-center justify-between gap-3">
                    <div className="font-mono text-xs text-slate-400">
                      <span className="text-[10px] block text-slate-500 uppercase font-sans font-bold">
                        Code
                      </span>
                      <span className="font-bold text-pink-400">
                        {ticket.ticket_code || 'PASS-PENDING'}
                      </span>
                    </div>

                    {ticket.ticket_id ? (
                      <button
                        type="button"
                        onClick={() => handleRevealQR(ticket.ticket_id)}
                        className="py-2 px-4 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-pink-600/30 transition-all active:scale-95"
                      >
                        <QrCode className="w-4 h-4" />
                        <span>Reveal QR</span>
                      </button>
                    ) : (
                      <span className="text-xs text-amber-400 flex items-center gap-1">
                        <Clock3 className="w-3.5 h-3.5 animate-spin" />
                        Generating pass...
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Interactive "Reveal QR Pass" Modal */}
      {isQRModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm rounded-[2.5rem] border border-pink-500/30 bg-[#120e20] p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsQRModalOpen(false)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {isLoadingPass ? (
              <div className="py-16 text-center space-y-2">
                <div className="w-8 h-8 rounded-full border-2 border-pink-500 border-t-transparent animate-spin mx-auto" />
                <p className="text-xs text-slate-400">Fetching encrypted QR pass...</p>
              </div>
            ) : activePass ? (
              <div className="text-center space-y-4">
                <div className="space-y-1">
                  <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-pink-600/20 text-pink-300 border border-pink-500/30">
                    Pass #{activePass.ticket_number || 1}
                  </span>
                  <h3 className="text-lg font-bold text-white leading-tight mt-2">
                    {activePass.title}
                  </h3>
                  <p className="text-xs text-slate-400">{activePass.college_name}</p>
                </div>

                {/* High Contrast Scannable QR Code */}
                <div className="p-4 rounded-3xl bg-white shadow-2xl inline-block border-4 border-pink-500/20">
                  <img
                    src={activePass.qr_code_data_url}
                    alt={`QR Pass for ${activePass.title}`}
                    className="w-56 h-56 mx-auto object-contain"
                  />
                </div>

                {/* Pass Code */}
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500">
                    Official Pass Verification Code
                  </p>
                  <p className="font-mono text-xl font-black text-pink-400 tracking-wider">
                    {activePass.ticket_code}
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-black/40 border border-white/5 text-xs text-slate-400 leading-relaxed">
                  💡 <strong>Tip for Gate Check-in:</strong> Turn up screen brightness when
                  presenting this QR pass to the door scanner.
                </div>
              </div>
            ) : (
              <p className="text-center text-xs text-rose-400 py-10">
                Failed to load pass details.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
