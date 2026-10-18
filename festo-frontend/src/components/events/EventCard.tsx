import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, MapPin, Building2, Bookmark, Share2, Sparkles, Check } from 'lucide-react';
import { AvailabilityBar } from './AvailabilityBar.jsx';
import { useToast } from '../common/Toast.jsx';

// Category color palettes for subtle distinction
const categoryStyles = {
  FEST: 'bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30',
  CULTURAL: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
  MUSIC: 'bg-pink-500/15 text-pink-300 border-pink-500/30',
  CONCERT: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
  HACKATHON: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
  TECHNICAL: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
  SPORTS: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  WORKSHOP: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  GAMING: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
};

const formatEventDate = (dateString) => {
  if (!dateString) return 'Date TBA';
  const d = new Date(dateString);
  return d.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
};

const formatEventTime = (dateString) => {
  if (!dateString) return '';
  const d = new Date(dateString);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export const EventCard = ({ event, className = '', isFeatured = false }) => {
  const [imgError, setImgError] = useState(false);
  const [isSaved, setIsSaved] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('festo_saved_events') || '[]');
      return saved.includes(event.id);
    } catch {
      return false;
    }
  });

  const toast = useToast();
  const hasPoster = Boolean(event.poster_url?.trim()) && !imgError;
  const categoryStyle = categoryStyles[event.category] || 'bg-slate-800 text-slate-300 border-slate-700';

  const toggleSave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const saved = JSON.parse(localStorage.getItem('festo_saved_events') || '[]');
      let updated;
      if (isSaved) {
        updated = saved.filter((id) => id !== event.id);
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

  const handleShare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/events/${event.slug}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      toast.success('Event link copied to clipboard!');
    }
  };

  const isSoldOut = event.capacity && event.registered_count >= event.capacity;

  return (
    <div
      className={`group relative flex flex-col rounded-3xl border border-white/10 bg-[#100d18] overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:border-violet-500/40 hover:shadow-2xl hover:shadow-violet-950/40 ${className}`}
    >
      {/* Top Image Artwork */}
      <Link to={`/events/${event.slug}`} className="relative aspect-[16/10] w-full overflow-hidden bg-slate-950 block">
        {hasPoster ? (
          <>
            <img
              src={event.poster_url}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full object-cover blur-xl opacity-40 scale-110 group-hover:scale-125 transition-transform duration-500"
            />
            <img
              src={event.poster_url}
              alt={event.title}
              onError={() => setImgError(true)}
              className="relative z-10 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            />
          </>
        ) : (
          <div className="festo-poster-fallback h-full w-full flex flex-col items-center justify-center p-5 text-center">
            <Sparkles className="mb-3 h-8 w-8 opacity-70" />
            <p className="max-w-[18ch] text-xl font-black leading-tight sm:text-2xl">{event.title || 'Campus Event'}</p>
            <span className="mt-3 text-[10px] font-bold uppercase tracking-[.2em] opacity-75">{event.category || 'Campus Event'}</span>
          </div>
        )}

        {/* Gradient Overlay for Text Legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#100d18] via-transparent to-black/40 z-10" />

        {/* Floating Badges */}
        <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
            <span
            className={`festo-event-category px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border backdrop-blur-md shadow-md ${categoryStyle}`}
          >
            {event.category}
          </span>
          {event.display_status === 'HAPPENING_NOW' && (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/90 text-white shadow-lg shadow-rose-900/40 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
              LIVE
            </span>
          )}
        </div>

        {/* Top Right Quick Actions: Bookmark & Share */}
        <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleShare}
            aria-label="Share event"
            className="w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-slate-300 hover:text-white backdrop-blur-md flex items-center justify-center transition-transform active:scale-90 border border-white/10"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={toggleSave}
            aria-label="Save event"
            className={`w-8 h-8 rounded-full backdrop-blur-md flex items-center justify-center transition-transform active:scale-90 border ${
              isSaved
                ? 'bg-pink-600 border-pink-500 text-white shadow-lg shadow-pink-900/50'
                : 'bg-black/60 hover:bg-black/80 text-slate-300 hover:text-pink-300 border-white/10'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Bottom Image Info: Date Pill & Price */}
        <div className="absolute bottom-3 left-3 right-3 z-20 flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-xs font-semibold text-slate-200">
            <CalendarDays className="w-3.5 h-3.5 text-cyan-400" />
            <span>{formatEventDate(event.start_date)}</span>
            <span className="text-slate-500">·</span>
            <span className="text-slate-400">{formatEventTime(event.start_date)}</span>
          </div>

          <span className="festo-event-meta-badge px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold backdrop-blur-md">
            Free Entry
          </span>
        </div>
      </Link>

      {/* Content Body */}
      <div className="flex flex-1 flex-col justify-between p-5 space-y-4">
        <div className="space-y-2">
          <Link to={`/events/${event.slug}`} className="block group/title">
            <h3 className="font-bold text-lg text-white leading-snug group-hover/title:text-pink-300 transition-colors line-clamp-1">
              {event.title}
            </h3>
          </Link>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 line-clamp-1">
              <Building2 className="w-3.5 h-3.5 text-violet-400 shrink-0" />
              <span className="font-medium text-slate-300">{event.college_name}</span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-400 line-clamp-1">
              <MapPin className="w-3.5 h-3.5 text-pink-400 shrink-0" />
              <span>{event.venue || 'Campus Venue'}</span>
            </div>
          </div>
        </div>

        {/* Availability Bar & Action */}
        <div className="space-y-3 pt-1 border-t border-white/5">
          <AvailabilityBar capacity={event.capacity} registeredCount={event.registered_count} />

          <Link
            to={`/events/${event.slug}`}
            className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
              isSoldOut
                ? 'bg-white/5 text-slate-500 cursor-not-allowed border border-white/5'
                : 'bg-pink-600 hover:bg-pink-500 text-white shadow-lg shadow-pink-600/25 hover:shadow-pink-600/40 active:scale-[0.99]'
            }`}
          >
            {isSoldOut ? 'Sold Out' : 'Claim Pass'}
          </Link>
        </div>
      </div>
    </div>
  );
};
