import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, CalendarDays, MapPin, Users, ChevronRight } from 'lucide-react';
import { eventsService } from '../../services/events.service.js';
import { Input } from '../../components/ui/input.jsx';
import { Card, CardContent } from '../../components/ui/card.jsx';
import { Button } from '../../components/ui/button.jsx';
import { Link } from 'react-router-dom';

const dateFormatter = (value) => new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

export const HomePage = () => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['featured-events', search, selectedCategory],
    queryFn: () => eventsService.list({
      search: search || undefined,
      category: selectedCategory || undefined,
      limit: 6 // Show 6 featured events on homepage
    })
  });

  const events = data?.data?.events || [];
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
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-violet-950 via-slate-950 to-indigo-950 min-h-[600px] border border-violet-500/20 rounded-3xl">
        <div className="relative z-10 flex min-h-[600px] flex-col items-center justify-center px-6 py-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-white sm:text-5xl">
            Discover College Events
          </h1>
          <p className="mb-6 max-w-xl text-lg text-slate-300">
            Find and register for upcoming fests, workshops, competitions, and more from colleges near you
          </p>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 w-full max-w-2xl">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400" />
              <Input
                className="pl-10 w-full"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search events by title, college, or location..."
              />
            </div>

            <div className="relative w-full sm:w-auto">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-3 pr-10 py-2 border border-violet-500/30 rounded-lg bg-slate-900 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.name}
                  </option>
                ))}
              </select>
              <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400 pointer-events-none" />
            </div>

            <Button
              variant="outline"
              className="w-full sm:w-auto px-6 py-2"
              onClick={() => {
                setSearch('');
                setSelectedCategory('');
              }}
            >
              Reset Filters
            </Button>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-[200px] bg-gradient-to-t from-violet-950 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 w-full h-[200px] bg-gradient-to-b from-indigo-950 via-transparent to-transparent" />
        </div>
      </section>

      {/* Featured Events Section */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="mb-8 text-3xl font-bold text-center text-white">
            Featured Events
          </h2>

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
                }}
              >
                Show All Events
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-slate-900/70 border-y border-violet-500/10 py-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="mb-8 text-3xl font-bold text-white">
            How Festo Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8 text-left">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <CalendarDays className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-white">Discover Events</h3>
              </div>
              <p className="text-slate-300">
                Browse upcoming college events by category, date, or location. All events are free to attend in V1.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-white">Register Free</h3>
              </div>
              <p className="text-slate-300">
                Register for events instantly with just a few clicks. Get your digital pass with QR code immediately.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-white">Attend & Check-in</h3>
              </div>
              <p className="text-slate-300">
                Show your QR pass at the event entrance for quick contactless check-in using our scanner app.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="mb-6 text-2xl font-bold text-white">
            Ready to explore college events?
          </h2>
          <p className="mb-8 text-slate-300 max-w-xl mx-auto">
            Start discovering amazing events happening at colleges near you. It's free and easy to get started.
          </p>
          <div className="flex flex-col sm:flex-row sm:justify-center sm:gap-4">
            <Link
              to="/explore"
              className="flex-1 sm:w-auto px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              Browse All Events
            </Link>
            <Link
              to="/register"
              className="flex-1 sm:w-auto px-6 py-3 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors font-medium"
            >
              Create an Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

const EventCard = ({ event }) => {
  const [imgError, setImgError] = React.useState(false);
  const formattedDate = dateFormatter(event.start_date);
  const hasPoster = Boolean(event.poster_url?.trim()) && !imgError;

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-200 border-border/60 flex flex-col">
      <div className="relative aspect-[16/9] w-full bg-slate-950 overflow-hidden flex items-center justify-center">
        {hasPoster ? (
          <>
            <img
              src={event.poster_url}
              alt=""
              aria-hidden="true"
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover blur-md opacity-30 scale-105"
            />
            <img
              src={event.poster_url}
              alt={event.title}
              referrerPolicy="no-referrer"
              className="relative z-10 w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-900/30 to-indigo-900/20 flex flex-col items-center justify-center text-purple-300">
            <CalendarDays className="w-10 h-10 mb-1" />
            <span className="text-[10px] font-semibold tracking-wider uppercase text-purple-400/80">{event.category}</span>
          </div>
        )}
      </div>
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center space-x-2 mb-2">
          <span className="px-2 py-0.5 text-xs font-semibold bg-purple-100 text-purple-800 rounded-full">
            {event.category}
          </span>
          <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-100 text-emerald-800 rounded-full">
            REGISTRATION OPEN
          </span>
        </div>

        <h3 className="text-xl font-bold text-purple-900 hover:text-purple-700 transition-colors">
          {event.title}
        </h3>

        <p className="text-purple-600 line-clamp-2">
          Hosted by {event.college_name}
        </p>

        <div className="grid grid-cols-2 gap-4 text-sm text-purple-500">
          <div className="flex items-center space-x-2">
            <CalendarDays className="w-4 h-4" />
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4" />
            <span>{event.venue || 'TBD'}</span>
          </div>
        </div>

        <div className="mt-4">
          <Link
            to={`/events/${event.slug}`}
            className="w-full inline-block text-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium text-sm"
          >
            View Event Details
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};
