import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, MapPin, Building2, ChevronRight, Clock } from 'lucide-react';

type TimelineEvent = { id: string; slug: string; start_date: string; title: string; category?: string; college_name?: string; venue?: string };
type TimelineDay = { dateLabel: string; dayNum: number; monthName: string; weekday: string; events: TimelineEvent[] };
export const VisualTimeline = ({ events = [] }: { events?: TimelineEvent[] }) => {
  if (events.length === 0) return null;

  // Group events by day
  const grouped = events.reduce((acc, event) => {
    if (!event.start_date) return acc;
    const dateObj = new Date(event.start_date);
    const dateKey = dateObj.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      weekday: 'short',
    });
    if (!acc[dateKey]) {
      acc[dateKey] = {
        dateLabel: dateKey,
        dayNum: dateObj.getDate(),
        monthName: dateObj.toLocaleDateString(undefined, { month: 'short' }),
        weekday: dateObj.toLocaleDateString(undefined, { weekday: 'short' }),
        events: [],
      };
    }
    acc[dateKey].events.push(event);
    return acc;
  }, {} as Record<string, TimelineDay>);

  const days: TimelineDay[] = Object.values(grouped).slice(0, 5);
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);

  if (days.length === 0) return null;

  const activeDay = days[selectedDayIdx] || days[0];

  return (
    <section className="rounded-3xl border border-white/10 bg-[#100c1a] p-6 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-cyan-300 mb-1.5">
            <CalendarDays className="w-3.5 h-3.5" />
            Calendar View
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">Upcoming Campus Timeline</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">Explore scheduled dates and session lineups</p>
        </div>
      </div>

      {/* Date selector chips */}
      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 pt-1">
        {days.map((day, idx) => {
          const isSelected = selectedDayIdx === idx;
          return (
            <button
              key={day.dateLabel}
              type="button"
              onClick={() => setSelectedDayIdx(idx)}
              className={`flex flex-col items-center justify-center min-w-[76px] py-3 px-3 rounded-2xl border transition-all duration-200 active:scale-95 ${
                isSelected
                  ? 'bg-pink-600 border-pink-500 text-white shadow-lg shadow-pink-900/40'
                  : 'bg-black/30 border-white/10 text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">{day.weekday}</span>
              <span className="text-2xl font-black">{day.dayNum}</span>
              <span className="text-[10px] font-medium">{day.monthName}</span>
            </button>
          );
        })}
      </div>

      {/* Events scheduled on the selected day */}
      <div className="space-y-3 pt-2">
        {activeDay.events.map((event) => {
          const time = new Date(event.start_date).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          });
          return (
            <Link
              key={event.id}
              to={`/events/${event.slug}`}
              className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-white/5 bg-black/20 hover:bg-white/5 hover:border-pink-500/30 transition-all duration-200"
            >
              <div className="flex items-start sm:items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-400 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-cyan-400">{time}</span>
                    <span className="text-slate-600">·</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/5 text-slate-300 border border-white/10">
                      {event.category}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-white group-hover:text-pink-300 transition-colors">
                    {event.title}
                  </h4>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-violet-400" />
                      {event.college_name}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-pink-400" />
                      {event.venue || 'Campus Auditorium'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-center">
                <span className="px-3 py-1 rounded-xl bg-pink-600/15 border border-pink-500/30 text-pink-300 text-xs font-bold group-hover:bg-pink-600 group-hover:text-white transition-all">
                  Claim Spot &rarr;
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};
