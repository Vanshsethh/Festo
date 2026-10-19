import React, { useEffect, useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  CalendarDays,
  Filter,
  SlidersHorizontal,
  MapPin,
  Building2,
  Grid,
  Map as MapIcon,
  X,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import { eventsService } from '../../services/events.service.js';
import { collegesService } from '../../services/colleges.service.js';
import { EventCard } from '../../components/events/EventCard.jsx';
import { Input } from '../../components/ui/input.jsx';
import type { EventRecord } from '../../types/api.js';

interface CollegeFilter { id: string; name: string; }

// Re-export EventDetailPage so existing imports never break
export { EventDetailPage } from './EventDetailPage.jsx';

const DATE_PRESETS = [
  { label: 'All Dates', value: 'all' },
  { label: 'Today', value: 'today' },
  { label: 'Tomorrow', value: 'tomorrow' },
  { label: 'This Week', value: 'this-week' },
  { label: 'This Weekend', value: 'weekend' },
  { label: 'This Month', value: 'month' },
];

const CATEGORIES = [
  { label: 'All Categories', value: '' },
  { label: 'Fest', value: 'FEST' },
  { label: 'Cultural', value: 'CULTURAL' },
  { label: 'Hackathon', value: 'HACKATHON' },
  { label: 'Technical', value: 'TECHNICAL' },
  { label: 'Concert & Music', value: 'CONCERT' },
  { label: 'Dance', value: 'DANCE' },
  { label: 'Sports', value: 'SPORTS' },
  { label: 'Workshop', value: 'WORKSHOP' },
  { label: 'Competition', value: 'COMPETITION' },
  { label: 'Gaming', value: 'GAMING' },
];

export const EventsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || '';
  const initialQuery = searchParams.get('q') || '';

  const [search, setSearch] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedDatePreset, setSelectedDatePreset] = useState('all');
  const [selectedCollege, setSelectedCollege] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'map'
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Keep the search box in sync when a new search is submitted from the global header.
  useEffect(() => {
    setSearch(searchParams.get('q') || '');
  }, [searchParams]);

  // Load events
  const { data, isLoading } = useQuery({
    queryKey: ['events', 'explore', search, selectedCategory, selectedCollege],
    queryFn: () =>
      eventsService.list({
        search: search || undefined,
        category: selectedCategory || undefined,
        limit: 100,
      }),
  });

  // Load colleges for filter dropdown
  const { data: collegesData } = useQuery({
    queryKey: ['colleges', 'filter-list'],
    queryFn: () => collegesService.getVerifiedColleges({ limit: 50 }),
  });

  const rawEvents: EventRecord[] = useMemo(() => data?.data?.events || [], [data]);
  const colleges: CollegeFilter[] = useMemo(() => collegesData?.data?.colleges || [], [collegesData]);

  // Client-side date preset and college filter
  const filteredEvents = useMemo(() => {
    return rawEvents.filter((event) => {
      // College filter
      if (selectedCollege && event.college_id !== selectedCollege && event.college_name !== selectedCollege) {
        return false;
      }

      // Date Presets filter
      if (selectedDatePreset !== 'all' && event.start_date) {
        const eventDate = new Date(event.start_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);

        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        if (selectedDatePreset === 'today') {
          return eventDate >= today && eventDate < tomorrow;
        }
        if (selectedDatePreset === 'tomorrow') {
          const dayAfterTomorrow = new Date(tomorrow);
          dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);
          return eventDate >= tomorrow && eventDate < dayAfterTomorrow;
        }
        if (selectedDatePreset === 'this-week') {
          return eventDate >= today && eventDate <= nextWeek;
        }
        if (selectedDatePreset === 'month') {
          return eventDate >= today && eventDate <= endOfMonth;
        }
        if (selectedDatePreset === 'weekend') {
          const dayOfWeek = eventDate.getDay();
          return dayOfWeek === 0 || dayOfWeek === 6;
        }
      }

      return true;
    });
  }, [rawEvents, selectedCollege, selectedDatePreset]);

  return (
    <div className="space-y-8 pb-16">
      {/* Header & Search Banner */}
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Explore Campus Events
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Discover cultural nights, hackathons, sports tournaments, and student gatherings.
          </p>
        </div>

        {/* Command Search Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-pink-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, artist, tech stack, or campus name..."
              className="festo-events-search h-12 pl-11 pr-4 bg-[#100d1a] border-white/10 rounded-2xl focus-visible:ring-pink-500/40 text-sm"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            {/* Mobile Filter Toggle */}
            <button
              type="button"
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-3 rounded-2xl bg-[#100d1a] border border-white/10 text-xs font-bold text-slate-300 hover:text-white"
            >
              <SlidersHorizontal className="w-4 h-4 text-pink-400" />
              <span>Filters</span>
            </button>

            {/* View Mode: List vs Map */}
            <div className="flex items-center rounded-2xl border border-white/10 bg-[#100d1a] p-1">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  viewMode === 'list'
                    ? 'bg-pink-600 text-white shadow-md shadow-pink-900/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
                <span>Grid</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('map')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  viewMode === 'map'
                    ? 'bg-pink-600 text-white shadow-md shadow-pink-900/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <MapIcon className="w-3.5 h-3.5" />
                <span>Map</span>
              </button>
            </div>
          </div>
        </div>

        {/* Date Presets Row */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
          {DATE_PRESETS.map((preset) => {
            const isSelected = selectedDatePreset === preset.value;
            return (
              <button
                key={preset.value}
                type="button"
                onClick={() => setSelectedDatePreset(preset.value)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all ${
                  isSelected
                    ? 'bg-pink-600 border-pink-500 text-white shadow-md shadow-pink-900/40'
                    : 'bg-[#100d1a] border-white/10 text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid with Desktop Sidebar Filter */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Desktop Filters Panel */}
        <div className="hidden lg:block lg:col-span-3 space-y-6 rounded-3xl border border-white/10 bg-[#100d1a] p-6 sticky top-6">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-pink-400" />
              <span>Filters</span>
            </h3>
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setSelectedCategory('');
                setSelectedDatePreset('all');
                setSelectedCollege('');
              }}
              className="text-xs text-pink-400 hover:text-pink-300 font-semibold"
            >
              Reset
            </button>
          </div>

          {/* Categories */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Categories
            </span>
            <div className="space-y-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    selectedCategory === cat.value
                      ? 'bg-pink-600/20 text-pink-300 border border-pink-500/30 font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Campus / College */}
          <div className="space-y-2 pt-3 border-t border-white/10">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Host Campus
            </span>
            <select
              value={selectedCollege}
              onChange={(e) => setSelectedCollege(e.target.value)}
              className="w-full h-10 rounded-xl bg-black/40 border border-white/10 px-3 text-xs text-slate-200 outline-none focus:border-pink-500"
            >
              <option value="">All Campuses</option>
              {colleges.map((col) => (
                <option key={col.id} value={col.name}>
                  {col.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Area */}
        <div className="lg:col-span-9 space-y-6">
          {/* Active Filters Bar */}
          {(selectedCategory || selectedCollege || selectedDatePreset !== 'all' || search) && (
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-500 font-medium">Active:</span>
              {search && (
                <span className="px-2.5 py-1 rounded-full bg-pink-500/10 text-pink-300 border border-pink-500/20 flex items-center gap-1.5">
                  &ldquo;{search}&rdquo;
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setSearch('')} />
                </span>
              )}
              {selectedCategory && (
                <span className="px-2.5 py-1 rounded-full bg-violet-500/10 text-violet-300 border border-violet-500/20 flex items-center gap-1.5">
                  {selectedCategory}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedCategory('')} />
                </span>
              )}
              {selectedCollege && (
                <span className="px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 flex items-center gap-1.5">
                  {selectedCollege}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedCollege('')} />
                </span>
              )}
            </div>
          )}

          {/* List or Map View */}
          {isLoading ? (
            <div className="py-24 text-center space-y-3">
              <div className="w-8 h-8 rounded-full border-2 border-pink-500 border-t-transparent animate-spin mx-auto" />
              <p className="text-xs text-slate-400">Loading events...</p>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="py-24 rounded-3xl border border-white/10 bg-[#100d1a] text-center space-y-4 px-4">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 text-slate-500 flex items-center justify-center mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">No campus events match your filters</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Try searching with broader terms or clearing your category and date filters.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setSelectedCategory('');
                  setSelectedDatePreset('all');
                  setSelectedCollege('');
                }}
                className="py-2 px-4 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold transition-all"
              >
                Clear all filters
              </button>
            </div>
          ) : viewMode === 'list' ? (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            /* Map View Simulation */
            <div className="rounded-3xl border border-white/10 bg-[#100d1a] overflow-hidden p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-white">Campus Map Locator</h3>
                  <p className="text-xs text-slate-400">
                    Displaying venues across Delhi NCR campuses
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-pink-600/20 text-pink-300 border border-pink-500/30">
                  {filteredEvents.length} Locations
                </span>
              </div>

              <div className="relative aspect-[16/9] w-full rounded-2xl bg-[#090710] border border-white/10 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-12 h-12 rounded-2xl bg-pink-600/20 border border-pink-500/30 text-pink-400 flex items-center justify-center mb-2 animate-pulse">
                  <MapPin className="w-6 h-6" />
                </div>
                <p className="font-bold text-sm text-white">Interactive Venue Map</p>
                <p className="text-xs text-slate-400 mt-1 max-w-sm">
                  Pinpointing venues at GGSIPU, DTU, NSUT, and partner college campuses.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {filteredEvents.slice(0, 4).map((event) => (
                  <Link
                    key={event.id}
                    to={`/events/${event.slug}`}
                    className="p-4 rounded-2xl bg-black/30 border border-white/5 hover:border-pink-500/30 flex items-center gap-3 transition-all"
                  >
                    <MapPin className="w-5 h-5 text-pink-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="font-bold text-xs text-white truncate">{event.title}</p>
                      <p className="text-[11px] text-slate-400 truncate">
                        {event.venue || event.college_name}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Bottom-Sheet Filter Drawer */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/70 backdrop-blur-sm lg:hidden">
          <div className="w-full max-h-[85vh] overflow-y-auto rounded-t-[2.5rem] border-t border-white/10 bg-[#120e1f] p-6 space-y-6 shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-black text-lg text-white">Filter Events</h3>
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Categories */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Category
              </span>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(cat.value);
                      setIsMobileFilterOpen(false);
                    }}
                    className={`p-2.5 rounded-xl text-xs font-medium text-left border ${
                      selectedCategory === cat.value
                        ? 'bg-pink-600 border-pink-500 text-white font-bold'
                        : 'bg-black/30 border-white/10 text-slate-300'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsMobileFilterOpen(false)}
              className="w-full py-3 rounded-2xl bg-pink-600 text-white font-bold text-sm shadow-lg shadow-pink-600/30"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
