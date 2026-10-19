import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { EventCard } from './EventCard.jsx';
import type { EventRecord } from '../../types/api.js';

interface EventRailProps {
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  events?: EventRecord[];
  actionText?: string;
  actionHref?: string;
  emptyMessage?: string;
}

export const EventRail = ({
  title,
  subtitle,
  badge,
  events = [],
  actionText = 'View all',
  actionHref,
  emptyMessage = 'No events scheduled currently.',
}: EventRailProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const offset = direction === 'left' ? -360 : 360;
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  if (events.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      {/* Rail Header */}
      <div className="flex items-end justify-between gap-4">
        <div>
          {badge && (
            <div className="mb-1.5 inline-flex items-center gap-1.5 rounded-full border border-pink-500/20 bg-pink-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-pink-300">
              {badge}
            </div>
          )}
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">{title}</h2>
          {subtitle && <p className="text-xs sm:text-sm text-slate-400 mt-0.5">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-2">
          {actionHref && (
            <a
              href={actionHref}
              className="text-xs font-semibold text-pink-400 hover:text-pink-300 mr-2 transition-colors hidden sm:block"
            >
              {actionText} &rarr;
            </a>
          )}
          <button
            type="button"
            onClick={() => scroll('left')}
            aria-label="Scroll left"
            className="w-8 h-8 rounded-full border border-white/10 bg-[#120e1c] hover:bg-[#1a1429] text-slate-300 hover:text-white flex items-center justify-center transition-all disabled:opacity-30 active:scale-95"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => scroll('right')}
            aria-label="Scroll right"
            className="w-8 h-8 rounded-full border border-white/10 bg-[#120e1c] hover:bg-[#1a1429] text-slate-300 hover:text-white flex items-center justify-center transition-all disabled:opacity-30 active:scale-95"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Scroll Area */}
      <div
        ref={scrollRef}
        className="flex gap-5 overflow-x-auto no-scrollbar pb-4 pt-1 snap-x snap-mandatory scroll-smooth -mx-4 px-4 sm:mx-0 sm:px-0"
      >
        {events.map((event) => (
          <div
            key={event.id}
            className="w-[280px] sm:w-[320px] md:w-[350px] shrink-0 snap-start flex flex-col"
          >
            <EventCard event={event} className="h-full" />
          </div>
        ))}
      </div>
    </section>
  );
};
