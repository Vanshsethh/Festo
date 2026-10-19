import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, MapPin, Building2, Bookmark, Share2, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { AvailabilityBar } from './AvailabilityBar.jsx';
import { useToast } from '../common/Toast.jsx';
import type { EventRecord } from '../../types/api.js';

export const FeaturedEvent = ({ event }: { event: EventRecord | null }) => {
  const [imgError, setImgError] = useState(false);
  const [isSaved, setIsSaved] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('festo_saved_events') || '[]');
      return saved.includes(event?.id);
    } catch {
      return false;
    }
  });

  const toast = useToast();
  if (!event) return null;

  const hasPoster = Boolean(event.poster_url?.trim()) && !imgError;

  const toggleSave = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const saved = JSON.parse(localStorage.getItem('festo_saved_events') || '[]');
      let updated;
      if (isSaved) {
        updated = saved.filter((id: string) => id !== event.id);
        setIsSaved(false);
        toast.info(`Removed "${event.title}" from saved`);
      } else {
        updated = [...saved, event.id];
        setIsSaved(true);
        toast.success(`Saved "${event.title}" to your list`);
      }
      localStorage.setItem('festo_saved_events', JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }
  };

  const handleShare = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/events/${event.slug}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      toast.success('Event link copied to clipboard!');
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Date TBA';
    return new Date(dateString).toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#0f0b18] shadow-2xl transition-all duration-300 hover:border-violet-500/30">
      {/* Background Ambient Poster Glow */}
      {hasPoster && (
        <div
          className="absolute inset-0 bg-cover bg-center blur-3xl opacity-25 scale-125 pointer-events-none"
          style={{ backgroundImage: `url(${event.poster_url})` }}
        />
      )}

      <div className="relative z-10 grid lg:grid-cols-12 items-center">
        {/* Left / Top Artwork Section */}
        <div className="lg:col-span-7 relative aspect-[16/10] sm:aspect-[16/9] lg:aspect-auto lg:h-[420px] w-full overflow-hidden bg-slate-950">
          {hasPoster ? (
            <img
              src={event.poster_url ?? undefined}
              alt={event.title}
              onError={() => setImgError(true)}
              className="h-full w-full object-cover transition-transform duration-700 ease-out hover:scale-105"
            />
          ) : (
            <div className="festo-poster-fallback h-full w-full flex flex-col items-center justify-center p-8 text-center">
              <Sparkles className="mb-4 h-14 w-14 opacity-70" />
              <p className="max-w-[15ch] text-3xl font-black leading-tight sm:text-5xl">{event.title || 'Featured Campus Event'}</p>
              <span className="mt-4 text-xs font-bold uppercase tracking-[.25em] opacity-75">{event.category || 'Campus Spotlight'}</span>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-[#0f0b18] via-transparent to-black/40 lg:bg-gradient-to-r lg:from-transparent lg:to-[#0f0b18]" />

          {/* Featured Ribbon */}
          <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-pink-600 text-white shadow-xl shadow-pink-900/40">
              <Sparkles className="w-3.5 h-3.5 fill-current" />
              Featured Spotlight
            </span>
            <span className="festo-event-category px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-black/60 backdrop-blur-md border border-white/10 text-cyan-300">
              {event.category}
            </span>
          </div>

          {/* Quick Actions */}
          <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
            <button
              type="button"
              onClick={handleShare}
              aria-label="Share event"
              className="w-9 h-9 rounded-full bg-black/60 hover:bg-black/90 text-slate-300 hover:text-white backdrop-blur-md flex items-center justify-center transition-all border border-white/10"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={toggleSave}
              aria-label="Save event"
              className={`w-9 h-9 rounded-full backdrop-blur-md flex items-center justify-center transition-all border ${
                isSaved
                  ? 'bg-pink-600 border-pink-500 text-white shadow-lg shadow-pink-900/50'
                  : 'bg-black/60 hover:bg-black/90 text-slate-300 hover:text-pink-300 border-white/10'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* Right Content Section */}
        <div className="lg:col-span-5 p-6 sm:p-8 lg:p-10 flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-pink-400">
              <Building2 className="w-4 h-4 text-violet-400" />
              <span>{event.college_name}</span>
              <span className="text-slate-600">·</span>
              <span className="flex items-center gap-1 text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                Verified Campus
              </span>
            </div>

            <Link to={`/events/${event.slug}`} className="block group">
              <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight group-hover:text-pink-300 transition-colors">
                {event.title}
              </h3>
            </Link>

            <p className="text-sm text-slate-300 line-clamp-3 leading-relaxed">
              {event.description ||
                'Join thousands of students for one of the premier campus events this season. Experience live performances, networking, and creative competitions.'}
            </p>

            <div className="pt-2 space-y-2">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-300">
                <CalendarDays className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="font-semibold">{formatDate(event.start_date)}</span>
                <span className="text-slate-500">at</span>
                <span className="text-slate-400">{formatTime(event.start_date)}</span>
              </div>

              <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-400">
                <MapPin className="w-4 h-4 text-pink-400 shrink-0" />
                <span>{event.venue || 'Main University Auditorium'}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-white/10">
            <AvailabilityBar capacity={event.capacity} registeredCount={event.registered_count} />

            <div className="flex items-center gap-3">
              <Link
                to={`/events/${event.slug}`}
                className="flex-1 py-3.5 px-6 rounded-2xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-sm text-center tracking-wide uppercase shadow-lg shadow-pink-600/30 hover:shadow-pink-600/50 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
              >
                <span>Get Passes</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
