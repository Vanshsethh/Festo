import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  CalendarDays,
  MapPin,
  Building2,
  Users,
  ChevronLeft,
  Share2,
  Bookmark,
  Sparkles,
  ShieldCheck,
  Clock,
  Navigation,
  CheckCircle2,
  AlertCircle,
  Ticket,
  ExternalLink,
} from 'lucide-react';
import { eventsService } from '../../services/events.service.js';
import { useAuth } from '../../hooks/useAuth.jsx';
import { AvailabilityBar } from '../../components/events/AvailabilityBar.jsx';
import { useToast } from '../../components/common/Toast.jsx';

export const EventDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuth();
  const toast = useToast();

  const [quantity, setQuantity] = useState(1);
  const [imgError, setImgError] = useState(false);
  const [isSaved, setIsSaved] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('festo_saved_events') || '[]');
      return saved.includes(slug);
    } catch {
      return false;
    }
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: ['event', slug],
    queryFn: () => eventsService.get(slug ?? ''),
    enabled: Boolean(slug),
  });

  const event = data?.data?.event;

  // Keep a short-lived, local browsing history of the campuses whose events
  // the visitor opens. This is UI-only data and never changes event records.
  useEffect(() => {
    if (!event?.college_id) return;
    try {
      const now = Date.now();
      const expiresAt = now + 24 * 60 * 60 * 1000;
      const previous = JSON.parse(localStorage.getItem('festo_recent_colleges') || '[]');
      const active = Array.isArray(previous)
        ? previous.filter((item) => item?.expiresAt > now && item.id !== event.college_id)
        : [];
      localStorage.setItem('festo_recent_colleges', JSON.stringify([
        {
          id: event.college_id,
          name: event.college_name,
          slug: event.college_slug,
          expiresAt,
        },
        ...active,
      ].slice(0, 8)));
    } catch {
      // Browsing history is optional; ignore unavailable browser storage.
    }
  }, [event?.college_id, event?.college_name, event?.college_slug]);

  // Check if current user is registered
  const registration = useQuery({
    queryKey: ['registrations'],
    queryFn: eventsService.myRegistrations,
    enabled: Boolean(isAuthenticated && user?.role === 'USER'),
  });

  const registered = registration.data?.data?.registrations?.find(
    (item: { event_id: string; registration_status: string }) => item.event_id === event?.id && item.registration_status === 'CONFIRMED'
  );

  const registerMutation = useMutation({
    mutationFn: ({ eventId, quantity }: { eventId: string; quantity: number }) => eventsService.register(eventId, quantity),
    onSuccess: (response) => {
      toast.success(`Success! Registered for ${quantity} ticket${quantity > 1 ? 's' : ''}!`);
      // Show the confirmation in the bell immediately. The API notification
      // remains the durable record; this local entry bridges any refetch delay.
      try {
        const registration = response?.data?.registration;
        const existing = JSON.parse(localStorage.getItem('festo_local_notifications') || '[]');
        const notification = {
          id: `local-registration-${registration?.id || `${event.id}-${Date.now()}`}`,
          type: 'REGISTRATION_CONFIRMED',
          payload: {
            registration_id: registration?.id,
            event_id: event.id,
            event_title: event.title,
            quantity,
          },
          created_at: new Date().toISOString(),
        };
        const entries = Array.isArray(existing) ? existing : [];
        localStorage.setItem('festo_local_notifications', JSON.stringify([notification, ...entries].slice(0, 20)));
        window.dispatchEvent(new Event('festo-notification-created'));
      } catch {
        // A confirmation toast is still shown if local browser storage is unavailable.
      }
      queryClient.invalidateQueries({ queryKey: ['registrations'] });
      queryClient.invalidateQueries({ queryKey: ['event', slug] });
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto py-16 px-4 space-y-6 animate-pulse">
        <div className="h-96 w-full rounded-3xl bg-white/5" />
        <div className="h-40 w-full rounded-3xl bg-white/5" />
      </div>
    );
  }

  if (isError || !event) {
    return (
      <div className="max-w-xl mx-auto my-20 p-8 rounded-3xl border border-white/10 bg-[#100d18] text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-white">Event Not Found</h2>
        <p className="text-sm text-slate-400">
          This event may have been removed or concluded. Explore our other live campus events.
        </p>
        <Link
          to="/explore"
          className="inline-flex py-2.5 px-5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold uppercase tracking-wider transition-all"
        >
          Back to Events
        </Link>
      </div>
    );
  }

  const hasEnded = new Date(event.end_date) < new Date();
  const maxAvailable = event.capacity ? Math.max(0, event.capacity - event.registered_count) : 10;
  const canRegister =
    !hasEnded &&
    event.display_status === 'REGISTRATION_OPEN' &&
    (!event.capacity || event.registered_count < event.capacity) &&
    new Date(event.registration_deadline) > new Date();

  const handleRegister = () => {
    if (!isAuthenticated) {
      return navigate('/login', { state: { from: `/events/${slug}` } });
    }
    if (user?.role !== 'USER') {
      return toast.error('Only student accounts can book event tickets.');
    }
    if (quantity > maxAvailable) {
      return toast.error(`Only ${maxAvailable} ticket${maxAvailable !== 1 ? 's' : ''} available.`);
    }

    registerMutation.mutate({ eventId: event.id, quantity });
  };

  const toggleSave = () => {
    try {
      const saved = JSON.parse(localStorage.getItem('festo_saved_events') || '[]');
      let updated;
      if (isSaved) {
        updated = saved.filter((id: string) => id !== event.id);
        setIsSaved(false);
        toast.info('Removed from saved list');
      } else {
        updated = [...saved, event.id];
        setIsSaved(true);
        toast.success('Saved to your bookmarked events');
      }
      localStorage.setItem('festo_saved_events', JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Event link copied to clipboard!');
    }
  };

  const hasPoster = Boolean(event.poster_url?.trim()) && !imgError;

  // Formatted date values
  const startDate = new Date(event.start_date);
  const formattedFullDate = startDate.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  const formattedTime = startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Sample event schedule timeline items
  const scheduleItems = [
    { time: '10:00 AM', title: 'Gates Open & Badge Check-in', desc: 'Present your digital QR pass at the entrance.' },
    { time: '11:30 AM', title: 'Opening Ceremony & Keynote', desc: 'Welcome address by the campus director & organizers.' },
    { time: '01:30 PM', title: 'Main Performances & Competitions', desc: 'Live stage showcases, presentations & jury evaluation.' },
    { time: '05:00 PM', title: 'Awards, DJ Set & Closing Night', desc: 'Celebration, prize distributions and networking.' },
  ];

  return (
    <div className="relative pb-24 space-y-8">
      {/* 1. Full-Width Hero Cover Artwork */}
      <div className="relative -mx-4 sm:-mx-6 lg:-mx-8 -mt-6 sm:-mt-6 lg:-mt-8 h-[360px] sm:h-[460px] lg:h-[500px] overflow-hidden bg-slate-950">
        {hasPoster ? (
          <>
            <img
              src={event.poster_url}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full object-cover blur-3xl opacity-35 scale-110"
            />
            <img
              src={event.poster_url}
              alt={event.title}
              onError={() => setImgError(true)}
              className="relative z-10 h-full w-full object-contain sm:object-cover"
            />
          </>
        ) : (
          <div className="festo-poster-fallback h-full w-full flex flex-col items-center justify-center p-8 text-center">
            <Sparkles className="mb-5 h-16 w-16 opacity-70" />
            <p className="max-w-4xl text-4xl font-black leading-tight sm:text-6xl">{event.title || 'Campus Event'}</p>
            <span className="mt-5 text-xs font-bold uppercase tracking-[.3em] opacity-75">{event.category || 'Festo event'}</span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-[#09070f] via-black/40 to-black/60 z-20" />

        {/* Top Controls: Back, Bookmark, Share */}
        <div className="absolute top-6 left-6 right-6 z-30 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-black/60 hover:bg-black/80 text-white backdrop-blur-md border border-white/10 text-xs font-bold transition-all active:scale-95"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShare}
              aria-label="Share event"
              className="w-10 h-10 rounded-xl bg-black/60 hover:bg-black/80 text-white backdrop-blur-md border border-white/10 flex items-center justify-center transition-all active:scale-90"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={toggleSave}
              aria-label="Save event"
              className={`w-10 h-10 rounded-xl backdrop-blur-md border flex items-center justify-center transition-all active:scale-90 ${
                isSaved
                  ? 'bg-pink-600 border-pink-500 text-white shadow-lg shadow-pink-900/50'
                  : 'bg-black/60 hover:bg-black/80 border-white/10 text-white'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* Hero Bottom Overlay Info */}
        <div className="absolute bottom-6 left-6 right-6 z-30 max-w-4xl mx-auto flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-pink-600 text-white shadow-lg shadow-pink-900/40">
              {event.category}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 backdrop-blur-md">
              Free Admission
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-slate-200 border border-white/15 backdrop-blur-md">
              {event.display_status?.replaceAll('_', ' ') || 'CONFIRMED'}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight drop-shadow-md">
            {event.title}
          </h1>
        </div>
      </div>

      {/* 2. Main Content Grid */}
      <div className="max-w-5xl mx-auto grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Details, Schedule, Venue, Organizer */}
        <div className="lg:col-span-8 space-y-8">
          {/* Quick Date & Venue Cards */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-3xl border border-white/10 bg-[#100d1a] space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
                <CalendarDays className="w-4 h-4" />
                <span>Date & Time</span>
              </div>
              <p className="text-base font-bold text-white">{formattedFullDate}</p>
              <p className="text-xs text-slate-400">Doors open at {formattedTime}</p>
            </div>

            <div className="p-5 rounded-3xl border border-white/10 bg-[#100d1a] space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-pink-400 uppercase tracking-wider">
                <MapPin className="w-4 h-4" />
                <span>Venue & Campus</span>
              </div>
              <p className="text-base font-bold text-white line-clamp-1">{event.venue || 'Main Auditorium'}</p>
              <p className="text-xs text-slate-400">{event.college_name}</p>
            </div>
          </div>

          {/* About Event */}
          <div className="p-6 sm:p-8 rounded-3xl border border-white/10 bg-[#100d1a] space-y-4">
            <h2 className="text-xl font-black text-white">About the Event</h2>
            <div className="text-sm sm:text-base text-slate-300 leading-relaxed space-y-3 whitespace-pre-line">
              {event.description ||
                'Experience one of the highlight gatherings of the campus calendar. Connect with talented students, participate in curated sessions, and enjoy an electrifying atmosphere.'}
            </div>
          </div>

          {/* Event Schedule Timeline */}
          <div className="p-6 sm:p-8 rounded-3xl border border-white/10 bg-[#100d1a] space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-white">Event Schedule</h2>
                <p className="text-xs text-slate-400 mt-0.5">Program lineup and stage order</p>
              </div>
              <Clock className="w-5 h-5 text-cyan-400" />
            </div>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/10">
              {scheduleItems.map((item, idx) => (
                <div key={idx} className="relative space-y-1">
                  <div className="absolute -left-6 top-1 w-4 h-4 rounded-full border-2 border-pink-500 bg-[#100d1a]" />
                  <span className="text-xs font-bold text-cyan-400 tracking-wide uppercase">
                    {item.time}
                  </span>
                  <h3 className="text-base font-bold text-white">{item.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Organizer Card */}
          <div className="p-6 sm:p-8 rounded-3xl border border-white/10 bg-[#100d1a] space-y-4">
            <h2 className="text-xl font-black text-white">Hosted By</h2>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center text-violet-400 shrink-0">
                <Building2 className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-white">{event.college_name}</h3>
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <ShieldCheck className="w-3 h-3" />
                    Verified
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Official university organization and student council board.
                </p>
              </div>
            </div>
          </div>

          {/* Venue & Directions Map Simulation */}
          <div className="p-6 sm:p-8 rounded-3xl border border-white/10 bg-[#100d1a] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-white">Location & Campus Map</h2>
                <p className="text-xs text-slate-400 mt-0.5">{event.venue || 'Campus grounds'}</p>
              </div>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  `${event.venue || ''} ${event.college_name}`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-semibold text-pink-300 transition-all"
              >
                <span>Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Map Placeholder Graphic */}
            <div className="relative aspect-[21/9] w-full rounded-2xl overflow-hidden border border-white/10 bg-[#0d0914] flex flex-col items-center justify-center p-6 text-center">
              <div className="w-12 h-12 rounded-2xl bg-pink-600/20 border border-pink-500/30 text-pink-400 flex items-center justify-center mb-2 animate-bounce">
                <MapPin className="w-6 h-6" />
              </div>
              <p className="font-bold text-sm text-white">{event.venue || 'Campus Auditorium'}</p>
              <p className="text-xs text-slate-400 mt-0.5">{event.college_name}, New Delhi</p>
            </div>
          </div>
        </div>

        {/* Right Floating Ticket Card */}
        <div className="lg:col-span-4 sticky top-6 space-y-5">
          <div className="p-6 rounded-3xl border border-pink-500/20 bg-[#120e1f] shadow-2xl shadow-pink-950/20 space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-xs font-semibold text-slate-400">Pass Price</span>
                <p className="text-2xl font-black text-emerald-400">Free Admission</p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-pink-600/20 text-pink-300 border border-pink-500/30">
                1-10 Tickets
              </span>
            </div>

            {/* Availability Indicator */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-300">Remaining Availability</span>
              <AvailabilityBar capacity={event.capacity} registeredCount={event.registered_count} />
            </div>

            {/* If user is already registered */}
            {registered ? (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>You have passes for this event!</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Your registration is confirmed. Digital QR codes are ready in your ticket wallet.
                </p>
                <Link
                  to="/tickets"
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <Ticket className="w-4 h-4" />
                  <span>Open Ticket Wallet</span>
                </Link>
              </div>
            ) : canRegister ? (
              /* Ticket Booking Form */
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="ticket-quantity" className="text-xs font-semibold text-slate-300">
                    Select Number of Passes
                  </label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {[1, 2, 3, 4, 5].map((num) => {
                      const isDisabled = num > maxAvailable;
                      const isSelected = quantity === num;
                      return (
                        <button
                          key={num}
                          type="button"
                          disabled={isDisabled}
                          onClick={() => setQuantity(num)}
                          className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                            isSelected
                              ? 'bg-pink-600 border-pink-500 text-white shadow-md shadow-pink-900/40'
                              : isDisabled
                              ? 'opacity-30 cursor-not-allowed border-white/5 bg-black/20 text-slate-600'
                              : 'bg-black/30 border-white/10 text-slate-300 hover:bg-white/5 hover:text-white'
                          }`}
                        >
                          {num}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="button"
                  disabled={registerMutation.isPending}
                  onClick={handleRegister}
                  className="w-full py-4 px-6 rounded-2xl bg-pink-600 hover:bg-pink-500 text-white font-black text-sm uppercase tracking-wider shadow-xl shadow-pink-600/30 hover:shadow-pink-600/50 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-60"
                >
                  {registerMutation.isPending ? (
                    <span>Reserving Passes...</span>
                  ) : (
                    <>
                      <Ticket className="w-5 h-5" />
                      <span>Claim {quantity} Pass{quantity > 1 ? 'es' : ''}</span>
                    </>
                  )}
                </button>

                <p className="text-[11px] text-center text-slate-500">
                  Guaranteed seat reservation · Instant digital pass generation
                </p>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center space-y-1">
                <p className="text-sm font-bold text-slate-300">
                  {hasEnded ? 'Event Concluded' : 'Registration Closed'}
                </p>
                <p className="text-xs text-slate-500">
                  Capacity reached or registration deadline has passed.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
