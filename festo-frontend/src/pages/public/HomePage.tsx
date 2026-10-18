import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Search,
  Sparkles,
  GraduationCap,
  ArrowRight,
  MapPin,
  Building2,
  ChevronRight,
} from 'lucide-react';
import { eventsService } from '../../services/events.service.js';
import { collegesService } from '../../services/colleges.service.js';
import { FeaturedEvent } from '../../components/events/FeaturedEvent.jsx';
import { EventRail } from '../../components/events/EventRail.jsx';
import { EventCard } from '../../components/events/EventCard.jsx';
import { VisualTimeline } from '../../components/events/VisualTimeline.jsx';
import { Input } from '../../components/ui/input.jsx';

const CATEGORY_CHIPS = [
  { label: 'All Events', value: '' },
  { label: '🔥 Fest & Cultural', value: 'FEST' },
  { label: '⚡ Hackathons', value: 'HACKATHON' },
  { label: '🎸 Concert & Music', value: 'CONCERT' },
  { label: '🏆 Competitions', value: 'COMPETITION' },
  { label: '💡 Workshops', value: 'WORKSHOP' },
  { label: '⚽ Sports', value: 'SPORTS' },
  { label: '💻 Technical', value: 'TECHNICAL' },
];

export const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Fetch all live & published events
  const { data: eventsData, isLoading: isLoadingEvents } = useQuery({
    queryKey: ['events', 'discover'],
    queryFn: () => eventsService.list({ limit: 40 }),
  });

  // Fetch verified partner colleges
  const { data: collegesData } = useQuery({
    queryKey: ['colleges', 'featured'],
    queryFn: () => collegesService.getVerifiedColleges({ limit: 6 }),
  });

  const allEvents = useMemo(() => eventsData?.data?.events || [], [eventsData]);
  const colleges = useMemo(() => collegesData?.data?.colleges || [], [collegesData]);

  // Featured Event (highest capacity or upcoming major fest)
  const featuredEvent = useMemo(() => {
    if (allEvents.length === 0) return null;
    return (
      allEvents.find((e) => e.category === 'FEST' || e.category === 'CONCERT') ||
      allEvents[0]
    );
  }, [allEvents]);

  // Happening Now (or starting soon today)
  const happeningNow = useMemo(() => {
    return allEvents.filter((e) => {
      const start = new Date(e.start_date);
      const now = new Date();
      const diffHours = (start.getTime() - now.getTime()) / (1000 * 60 * 60);
      return e.display_status === 'HAPPENING_NOW' || (diffHours >= -2 && diffHours <= 24);
    });
  }, [allEvents]);

  // This Week events
  const thisWeekEvents = useMemo(() => {
    return allEvents.filter((e) => {
      const start = new Date(e.start_date);
      const now = new Date();
      const diffDays = (start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      return diffDays >= 0 && diffDays <= 7;
    });
  }, [allEvents]);

  // Trending on Campus (high registered count or high capacity)
  const trendingEvents = useMemo(() => {
    return [...allEvents]
      .sort((a, b) => (b.registered_count || 0) - (a.registered_count || 0))
      .slice(0, 10);
  }, [allEvents]);

  // Tech & Hackathons
  const techEvents = useMemo(() => {
    return allEvents.filter((e) => e.category === 'HACKATHON' || e.category === 'TECHNICAL');
  }, [allEvents]);

  // Cultural & Music
  const culturalEvents = useMemo(() => {
    return allEvents.filter(
      (e) => e.category === 'CULTURAL' || e.category === 'MUSIC' || e.category === 'DANCE'
    );
  }, [allEvents]);

  return (
    <div className="space-y-12 pb-16">
      {/* 1. Brand-led discovery hero */}
      <section className="festo-hero relative isolate overflow-hidden rounded-[2rem] border border-white/10 px-6 py-10 shadow-2xl shadow-fuchsia-950/20 sm:px-10 sm:py-12 lg:min-h-[390px] lg:px-16 lg:py-16">
        <div className="relative z-10 flex h-full max-w-3xl flex-col justify-center">
          <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-fuchsia-300/25 bg-white/5 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-fuchsia-100 backdrop-blur-sm sm:text-xs">
            <Sparkles className="h-3.5 w-3.5 text-fuchsia-300" />
            Your campus, in motion
          </div>
          <h1 className="festo-hero-wordmark relative z-10 leading-[0.8]" aria-label="Festo">FESTO</h1>
          <p className="mt-7 text-xs font-bold uppercase tracking-[0.32em] text-fuchsia-100 sm:text-sm">
            Discover. Connect. Experience.
          </p>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-300 sm:text-base">
            Experience what&apos;s happening around you.
          </p>
        </div>
      </section>

      {/* 2. Interactive Discovery Search & Category Filter Bar */}
      <section className="festo-discovery-panel relative rounded-[2rem] border border-white/10 bg-[#100c1a]/95 p-5 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-6">
        <div className="mb-5 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-fuchsia-300">Make a plan</p>
            <h2 className="mt-1 text-2xl font-black tracking-tight text-white">Find your next scene</h2>
          </div>
          <p className="text-xs text-slate-500">Search by event, college, or city.</p>
        </div>
        <div className="flex flex-col items-center gap-3 md:flex-row">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-pink-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search events, artists, or colleges"
              className="h-12 pl-11 pr-4 bg-black/40 border-white/10 text-white placeholder:text-slate-500 rounded-2xl focus-visible:ring-pink-500/40 text-sm"
            />
          </div>

          <Link
            to={searchQuery ? `/explore?q=${encodeURIComponent(searchQuery)}` : '/explore'}
            className="w-full md:w-auto h-12 px-6 rounded-2xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-pink-600/30 transition-all active:scale-95"
          >
            <span>Explore All</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Quick Category Chips */}
        <div className="mt-4 flex items-center gap-2 overflow-x-auto border-t border-white/5 pt-4 no-scrollbar">
          {CATEGORY_CHIPS.map((cat) => {
            const isSelected = selectedCategory === cat.value;
            return (
              <button
                key={cat.value}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat.value);
                  if (cat.value) {
                    window.location.href = `/explore?category=${cat.value}`;
                  }
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 active:scale-95 border ${
                  isSelected
                    ? 'bg-pink-600 border-pink-500 text-white shadow-md shadow-pink-900/40'
                    : 'bg-black/30 border-white/10 text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. Happening Now Section */}
      {happeningNow.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="relative flex items-center justify-center w-3.5 h-3.5">
                <span className="absolute w-full h-full rounded-full bg-rose-500 opacity-75 animate-ping" />
                <span className="relative w-2.5 h-2.5 rounded-full bg-rose-500" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Happening Now & Today
              </h2>
            </div>
            <Link
              to="/explore?status=HAPPENING_NOW"
              className="text-xs font-semibold text-pink-400 hover:text-pink-300 transition-colors"
            >
              See all live &rarr;
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {happeningNow.slice(0, 3).map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      )}

      {/* 4. Large Editorial Featured Event Card */}
      {featuredEvent && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-pink-400 uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Campus Headliner</span>
            </div>
          </div>
          <FeaturedEvent event={featuredEvent} />
        </section>
      )}

      {/* 5. Horizontal Event Rail: This Week */}
      <EventRail
        title="This Week on Campus"
        subtitle="Hottest upcoming lineups, workshops and gatherings"
        badge="SCHEDULED THIS WEEK"
        events={thisWeekEvents.length > 0 ? thisWeekEvents : allEvents.slice(0, 8)}
        actionHref="/explore"
      />

      {/* 6. Horizontal Event Rail: Trending on Campus */}
      <EventRail
        title="Trending on Campus"
        subtitle="Events with the highest registrations and student buzz"
        badge="MOST POPULAR"
        events={trendingEvents}
        actionHref="/explore?sort=popular"
      />

      {/* 7. Nearby Campuses & Verified Colleges */}
      {colleges.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="mb-1.5 inline-flex items-center gap-1.5 rounded-full border border-violet-500/20 bg-violet-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-violet-300">
                <GraduationCap className="w-3.5 h-3.5" />
                Campuses & Universities
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Explore Verified Campuses
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Browse partner colleges hosting official student fests
              </p>
            </div>
            <Link
              to="/colleges"
              className="text-xs font-semibold text-pink-400 hover:text-pink-300 transition-colors"
            >
              All colleges &rarr;
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {colleges.map((college) => (
              <Link
                key={college.id || college.slug}
                to={`/colleges/${college.slug || college.id}`}
                className="group relative flex items-center gap-4 p-4 rounded-3xl border border-white/10 bg-[#100d1a] hover:border-violet-500/40 hover:bg-[#151022] transition-all duration-300 hover:shadow-xl hover:shadow-violet-950/30"
              >
                <div className="w-16 h-16 rounded-2xl bg-black/40 border border-white/10 p-1 flex items-center justify-center overflow-hidden shrink-0">
                  {college.logo_url ? (
                    <img
                      src={college.logo_url}
                      alt={college.name}
                      className="w-full h-full object-contain rounded-xl"
                    />
                  ) : (
                    <Building2 className="w-8 h-8 text-violet-400" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-base text-white group-hover:text-pink-300 transition-colors truncate">
                    {college.name}
                  </h3>
                  <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5 truncate">
                    <MapPin className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                    <span>{college.location || 'New Delhi, India'}</span>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-500/10 text-violet-300 border border-violet-500/20">
                      {college.event_count || 17} Active Events
                    </span>
                  </div>
                </div>

                <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-pink-400 group-hover:translate-x-0.5 transition-all shrink-0" />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 8. Categorized Rails: Hackathons & Tech */}
      {techEvents.length > 0 && (
        <EventRail
          title="Hackathons & Tech Innovators"
          subtitle="Coding sprints, robotics tournaments, and tech conferences"
          badge="DEV & DESIGN"
          events={techEvents}
          actionHref="/explore?category=HACKATHON"
        />
      )}

      {/* 9. Visual Timeline */}
      <VisualTimeline events={allEvents} />
    </div>
  );
};
