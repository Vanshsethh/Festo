import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, CalendarDays, MapPin, Users, ChevronRight, Building2, Tag, Sparkles } from 'lucide-react';
import { eventsService } from '../../services/events.service.js';
import { Input } from '../../components/ui/input.jsx';
import { Button } from '../../components/ui/button.jsx';
import { SearchableSelect } from '../../components/ui/SearchableSelect.jsx';
import { GlowingEffect } from '../../components/ui/GlowingEffect.jsx';
import { INDIAN_CITIES, INDIAN_COLLEGES, getCollegesByCity } from '../../data/indianColleges.js';
import { Link } from 'react-router-dom';

const dateFormatter = (value) => new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

export const HomePage = () => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedCollege, setSelectedCollege] = useState('');
  const collegeOptions = (selectedCity ? getCollegesByCity(selectedCity) : INDIAN_COLLEGES)
    .map(({ name }) => name)
    .sort((a, b) => a.localeCompare(b));

  const { data, isLoading } = useQuery({
    queryKey: ['featured-events', search, selectedCategory, selectedCity, selectedCollege],
    queryFn: () => eventsService.list({
      // The API can search college names, but does not have a city field yet.
      // City narrowing is completed below against the local college directory.
      search: search || selectedCollege || undefined,
      category: selectedCategory || undefined,
      limit: selectedCity ? 100 : 6,
    })
  });

  const events = (data?.data?.events || []).filter((event) => {
    const college = event.college_name?.toLowerCase() || '';
    const location = `${event.city || ''} ${event.venue || ''}`.toLowerCase();
    return (!selectedCollege || college.includes(selectedCollege.toLowerCase()))
      && (!selectedCity || location.includes(selectedCity.toLowerCase()) || collegeOptions.some((name) => name.toLowerCase() === college));
  }).slice(0, 6);
  const categories = [
    { name: 'All', value: '' },
    { name: 'Fest', value: 'FEST' },
    { name: 'Cultural', value: 'CULTURAL' },
    { name: 'Sports', value: 'SPORTS' },
    { name: 'Technical', value: 'TECHNICAL' },
    { name: 'Workshop', value: 'WORKSHOP' },
    { name: 'Competition', value: 'COMPETITION' },
    { name: 'Concert', value: 'CONCERT' },
    { name: 'Hackathon', value: 'HACKATHON' },
    { name: 'Quiz', value: 'QUIZ' }
  ];

  return (
    <div className="space-y-8">
      <section className="festo-hero relative isolate overflow-hidden rounded-[2rem] border border-fuchsia-300/15 px-6 py-16 sm:px-12 sm:py-20 lg:px-20">
        <div className="relative z-10 w-full max-w-none">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-fuchsia-300/20 bg-fuchsia-400/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-fuchsia-200">
            <Sparkles className="h-3.5 w-3.5" /> Your campus, in motion
          </div>
          <h1 className="festo-hero-wordmark leading-[0.78] text-white">FESTO</h1>
          <p className="mt-7 text-sm font-semibold uppercase tracking-[0.28em] text-fuchsia-200 sm:text-base">Discover. Connect. Experience.</p>
          <p className="mt-5 max-w-lg text-base leading-7 text-slate-300 sm:text-lg">Experience what&apos;s happening around you.</p>
        </div>
        <div className="pointer-events-none absolute -right-12 -top-28 h-96 w-96 rounded-full bg-fuchsia-600/20 blur-[110px]" />
        <div className="pointer-events-none absolute bottom-0 right-1/4 h-40 w-80 rounded-full bg-violet-600/25 blur-[90px]" />
      </section>

      <section className="relative overflow-visible rounded-3xl border border-white/10 bg-[#100b16]/90 p-4 shadow-2xl shadow-black/25 sm:p-6">
        <div className="mb-5 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-fuchsia-300">Make a plan</p>
            <h2 className="mt-1 text-xl font-semibold text-white">Find your next scene</h2>
          </div>
          <p className="text-sm text-slate-500">Search by event, college, or city.</p>
        </div>
        <div className="grid gap-3 lg:grid-cols-12">
          <div className="relative lg:col-span-5">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-fuchsia-400" />
            <Input className="h-12 border-white/10 bg-black/30 pl-11 text-white placeholder:text-slate-500 focus-visible:ring-fuchsia-500/50" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search events, artists, or colleges" />
          </div>
          <div className="relative lg:col-span-2">
            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} aria-label="Event category" className="h-12 w-full appearance-none rounded-xl border border-white/10 bg-black/30 px-4 pr-9 text-sm text-white outline-none transition focus:border-fuchsia-400/50 focus:ring-2 focus:ring-fuchsia-500/20">
              {categories.map((category) => <option key={category.value} value={category.value}>{category.name}</option>)}
            </select>
            <ChevronRight className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 rotate-90 text-fuchsia-300" />
          </div>
          <SearchableSelect items={INDIAN_CITIES} value={selectedCity} onChange={(city) => { setSelectedCity(city); setSelectedCollege(''); }} placeholder="Select city" searchPlaceholder="Search cities..." icon={<MapPin className="h-4 w-4" />} className="lg:col-span-2 [&>button]:h-12" />
          <SearchableSelect items={collegeOptions} value={selectedCollege} onChange={setSelectedCollege} placeholder="Search college" searchPlaceholder="Search colleges..." icon={<Building2 className="h-4 w-4" />} className="lg:col-span-3 [&>button]:h-12" />
        </div>
        <div className="mt-4 flex justify-end">
          <button type="button" onClick={() => { setSearch(''); setSelectedCategory(''); setSelectedCity(''); setSelectedCollege(''); }} className="text-sm font-medium text-slate-400 transition-colors hover:text-fuchsia-200">Clear all filters</button>
        </div>
      </section>

      {/* Explore Events Section */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-8 flex flex-col justify-between gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-fuchsia-300">Happening now</p>
              <h2 className="mt-2 text-3xl font-bold text-white sm:text-4xl">Explore Events</h2>
              <p className="mt-2 text-sm text-slate-400">Fresh plans, big stages, and campus energy—picked for you.</p>
            </div>
            <Link to="/explore" className="inline-flex items-center gap-2 text-sm font-semibold text-fuchsia-300 transition-colors hover:text-fuchsia-100">View all events <span aria-hidden="true">→</span></Link>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-pulse w-12 h-12 rounded-full bg-purple-200"></div>
              <p className="mt-4 text-purple-600">Loading featured events...</p>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-purple-500">No events match your current filters.</p>
              <Button
                variant="outline"
                className="mt-4 px-6 py-2"
                onClick={() => {
                  setSearch('');
                  setSelectedCategory('');
                  setSelectedCity('');
                  setSelectedCollege('');
                }}
              >
                Show All Events
              </Button>
            </div>
          ) : (
            <ul className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-12 lg:auto-rows-[290px]">
              {events.map((event, index) => (
                <EventCard key={event.id} event={event} index={index} />
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="relative overflow-hidden rounded-[2rem] border border-fuchsia-300/15 bg-[#100a16] p-6 sm:p-10">
        <div className="relative z-10 flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div className="max-w-xl">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-fuchsia-300">More to discover</p>
            <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">Make campus plans,<br />not just bookmarks.</h2>
            <p className="mt-4 text-slate-400">Find your college community, bring an event to life, or create your Festo account to keep every plan in one place.</p>
          </div>
          <Link to="/explore" className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-fuchsia-600 to-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-fuchsia-900/30 transition hover:from-fuchsia-500 hover:to-violet-500">Explore everything</Link>
        </div>
        <div className="relative z-10 mt-8 grid gap-3 md:grid-cols-3">
          <ActionCard to="/colleges" icon={<MapPin className="h-5 w-5" />} title="Find your college" description="See what is happening on campuses near you." />
          <ActionCard to="/host" icon={<CalendarDays className="h-5 w-5" />} title="Host an event" description="Put your fest, workshop, or meetup on the map." />
          <ActionCard to="/register" icon={<Users className="h-5 w-5" />} title="Join Festo" description="Save events and keep your plans together." />
        </div>
        <div className="pointer-events-none absolute -right-20 -bottom-32 h-80 w-80 rounded-full bg-violet-600/25 blur-[90px]" />
      </section>
    </div>
  );
};

const ActionCard = ({ to, icon, title, description }) => (
  <Link to={to} className="group rounded-2xl border border-white/10 bg-white/[0.035] p-5 transition-all hover:-translate-y-1 hover:border-fuchsia-400/35 hover:bg-fuchsia-500/[0.07]">
    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-fuchsia-500/25 to-violet-500/25 text-fuchsia-200 ring-1 ring-fuchsia-300/20">{icon}</div>
    <h3 className="mt-5 font-semibold text-white transition-colors group-hover:text-fuchsia-200">{title} <span aria-hidden="true">→</span></h3>
    <p className="mt-1 text-sm leading-6 text-slate-400">{description}</p>
  </Link>
);

const EventCard = ({ event, index }) => {
  const [imgError, setImgError] = React.useState(false);
  const formattedDate = dateFormatter(event.start_date);
  const hasPoster = Boolean(event.poster_url?.trim()) && !imgError;
  const bentoClasses = [
    'lg:col-span-5 lg:row-span-2', 'lg:col-span-7', 'lg:col-span-4',
    'lg:col-span-3', 'lg:col-span-5', 'lg:col-span-7',
  ][index % 6];

  return (
    <li className={`group relative min-h-[290px] overflow-hidden rounded-2xl ${bentoClasses}`}>
      <GlowingEffect glow variant={index % 2 ? 'blue' : 'purple'} />
      <article className="relative z-10 flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-950/95 p-1 shadow-2xl shadow-violet-950/20 transition-transform duration-300 group-hover:-translate-y-1">
        <div className="relative flex min-h-[130px] flex-1 items-center justify-center overflow-hidden rounded-xl bg-slate-900">
          {hasPoster ? (
            <>
              <img src={event.poster_url} alt="" aria-hidden="true" referrerPolicy="no-referrer" className="absolute inset-0 h-full w-full scale-105 object-cover opacity-30 blur-md" />
              <img src={event.poster_url} alt={event.title} referrerPolicy="no-referrer" className="relative z-10 h-full w-full object-cover" onError={() => setImgError(true)} />
            </>
          ) : (
            <div className="relative flex h-full w-full flex-col justify-between overflow-hidden bg-gradient-to-br from-[#381035] via-[#25134a] to-[#121638] p-5 sm:p-6">
              <div className="pointer-events-none absolute -right-12 -top-16 h-44 w-44 rounded-full bg-fuchsia-500/30 blur-[55px]" />
              <div className="pointer-events-none absolute -bottom-12 left-1/4 h-36 w-52 rounded-full bg-violet-500/30 blur-[50px]" />
              <div className="relative flex items-center justify-between gap-3 text-[10px] font-bold uppercase tracking-[0.18em] text-fuchsia-100/80">
                <span>Festo presents</span>
                <span className="rounded-full border border-fuchsia-200/20 bg-fuchsia-300/10 px-2 py-1 text-fuchsia-100">{event.category}</span>
              </div>
              <div className="relative">
                <p className="line-clamp-3 text-2xl font-bold leading-tight text-white drop-shadow-sm sm:text-3xl">{event.title}</p>
                <p className="mt-3 flex items-center gap-1.5 truncate text-xs text-fuchsia-100/75"><Building2 className="h-3.5 w-3.5 shrink-0" />{event.college_name}</p>
              </div>
              <div className="relative flex items-center gap-2 text-xs text-fuchsia-100/70"><CalendarDays className="h-4 w-4" />{formattedDate}</div>
            </div>
          )}
        </div>
        <div className="space-y-3 p-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/15 px-2 py-0.5 text-xs font-semibold text-violet-200"><Tag className="h-3 w-3" />{event.category}</span>
            <span className="rounded-full bg-emerald-400/10 px-2 py-0.5 text-xs font-semibold text-emerald-300">REGISTRATION OPEN</span>
          </div>
          {hasPoster && <h3 className="line-clamp-1 text-lg font-bold text-white transition-colors group-hover:text-violet-200">{event.title}</h3>}
          <p className="flex items-center gap-1.5 truncate text-sm text-slate-300"><Building2 className="h-4 w-4 shrink-0 text-violet-300" />{event.college_name}</p>
          <div className="grid grid-cols-2 gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-1.5"><CalendarDays className="h-4 w-4 text-violet-300" /><span>{formattedDate}</span></div>
            <div className="flex items-center gap-1.5 truncate"><MapPin className="h-4 w-4 shrink-0 text-violet-300" /><span>{event.venue || 'TBD'}</span></div>
          </div>
          <Link to={`/events/${event.slug}`} className="inline-block w-full rounded-lg bg-violet-600 px-4 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-violet-500">View Event Details</Link>
        </div>
      </article>
    </li>
  );
};
