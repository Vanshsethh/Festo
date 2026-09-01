import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { collegesService } from '../../services/colleges.service.js';
import { CollegeCard } from '../../components/colleges/CollegeCard.jsx';
import { Input } from '../../components/ui/input.jsx';
import { Button } from '../../components/ui/button.jsx';
import { Search, Building2, Sparkles, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CollegesDirectoryPage = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['colleges', 'verified', search, page],
    queryFn: () => collegesService.getVerifiedColleges({ search, page, limit: 12 }),
    keepPreviousData: true,
  });

  const colleges = data?.data?.colleges || [];
  const pagination = data?.data?.pagination || { total: 0, totalPages: 1 };

  return (
    <div className="space-y-10 py-6">
      {/* Hero / Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-purple-950/40 via-card to-card border border-purple-500/20 p-8 sm:p-12 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/20">
            <Building2 className="w-3.5 h-3.5 text-purple-400" />
            Verified Campus Communities
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            Colleges & Campuses
          </h1>
          <p className="text-muted-foreground text-base leading-relaxed">
            Discover verified colleges, explore their annual fests, technical symposiums, and cultural competitions across the nation.
          </p>

          {/* Search Bar */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3 max-w-xl">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search colleges by name or location..."
                className="pl-10 h-11 bg-background/80"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            {search && (
              <Button variant="ghost" onClick={() => setSearch('')} className="shrink-0">
                Clear
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Directory Grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <span>Verified Colleges</span>
            <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground">
              {pagination.total} registered
            </span>
          </h2>

          <Button asChild variant="outline" size="sm" className="gap-1.5 text-xs">
            <Link to="/host">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              Host an Event
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-64 rounded-2xl bg-card/40 border border-border animate-pulse" />
            ))}
          </div>
        ) : isError ? (
          <div className="p-12 text-center rounded-2xl border border-destructive/20 bg-destructive/5 text-destructive">
            Failed to load colleges. Please try again.
          </div>
        ) : colleges.length === 0 ? (
          <div className="p-16 text-center rounded-3xl border border-border/60 bg-card/40 space-y-4">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold">No colleges found</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              {search ? `No verified colleges match "${search}".` : 'No verified colleges have been added to the directory yet.'}
            </p>
            <Button asChild className="bg-purple-600 hover:bg-purple-500">
              <Link to="/host">Host an Event</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {colleges.map((college) => (
              <CollegeCard key={college.id} college={college} />
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 pt-10">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="gap-1"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </Button>
            <span className="text-xs text-muted-foreground">
              Page {page} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              className="gap-1"
            >
              Next <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};