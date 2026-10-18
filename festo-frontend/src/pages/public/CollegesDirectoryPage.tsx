import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { collegesService } from '../../services/colleges.service.js';
import { CollegeCard } from '../../components/colleges/CollegeCard.jsx';
import { Input } from '../../components/ui/input.jsx';
import { Button } from '../../components/ui/button.jsx';
import {
  Search,
  Building2,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Star,
  MapPin,
  CheckCircle2,
  Filter,
  X,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { INDIAN_COLLEGES } from '../../data/indianColleges.js';

export const CollegesDirectoryPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedCollegeId, setSelectedCollegeId] = useState('');
  const [page, setPage] = useState(1);
  const [recentCollegeHistory] = useState(() => {
    try {
      const now = Date.now();
      const saved = JSON.parse(localStorage.getItem('festo_recent_colleges') || '[]');
      const active = Array.isArray(saved) ? saved.filter((item) => item?.expiresAt > now) : [];
      localStorage.setItem('festo_recent_colleges', JSON.stringify(active));
      return active;
    } catch {
      return [];
    }
  });
  const [myCollege, setMyCollege] = useState(() => {
    try {
      const saved = localStorage.getItem('festo_my_college');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Fetch Festo profiles so their metadata remains available in the directory.
  const { data: allCollegesData } = useQuery({
    queryKey: ['colleges', 'all-verified-list'],
    queryFn: () => collegesService.getVerifiedColleges({ limit: 100 }),
    staleTime: 5 * 60 * 1000,
  });

  const registeredColleges = allCollegesData?.data?.colleges || [];
  // The campus picker intentionally uses the complete local college catalog,
  // not only the small set of colleges that have registered on Festo so far.
  const allDatabaseColleges = useMemo(() => {
    const catalog = INDIAN_COLLEGES.map((college, index) => ({
      id: `catalog-${index}`,
      name: college.name,
      location: college.city,
      // The catalog keeps DTU's historic name while Festo profiles/events use
      // its current official name.
      eventSearchTerm: college.name === 'Delhi College of Engineering (DTU)' ? 'Delhi Technological University' : college.name,
      isCatalogCollege: true,
    }));
    const catalogNames = new Set(catalog.map((college) => college.name.toLowerCase()));
    return [...catalog, ...registeredColleges.filter((college) => !catalogNames.has(college.name.toLowerCase()))];
  }, [registeredColleges]);

  // Determine active query term
  const selectedCollegeObj = allDatabaseColleges.find((c) => c.id === selectedCollegeId);
  const activeQueryTerm = selectedCollegeObj ? selectedCollegeObj.name : search.trim();

  // Query paginated / filtered colleges
  const { data, isLoading, isError } = useQuery({
    queryKey: ['colleges', 'verified', activeQueryTerm, page],
    queryFn: () =>
      collegesService.getVerifiedColleges({
        search: activeQueryTerm || undefined,
        page,
        limit: 12,
      }),
    placeholderData: (prev) => prev,
  });

  const colleges = data?.data?.colleges || [];
  const pagination = data?.data?.pagination || { total: 0, totalPages: 1 };
  const recentlyViewedColleges = recentCollegeHistory
    .map((historyItem) => registeredColleges.find((college) => college.id === historyItem.id))
    .filter(Boolean);

  // Set or clear saved campus
  const handleSetMyCollege = (college) => {
    const payload = {
      id: college.id,
      name: college.name,
      slug: college.slug,
      location: college.location,
    };
    setMyCollege(payload);
    try {
      localStorage.setItem('festo_my_college', JSON.stringify(payload));
      window.dispatchEvent(new Event('festo-college-changed'));
    } catch (e) {
      console.error('Failed to save campus to localStorage', e);
    }
  };

  const handleClearMyCollege = () => {
    setMyCollege(null);
    try {
      localStorage.removeItem('festo_my_college');
      window.dispatchEvent(new Event('festo-college-changed'));
    } catch (e) {
      console.error('Failed to clear campus from localStorage', e);
    }
  };

  // When user selects a college from the database dropdown
  const handleSelectFromDatabase = (collegeId) => {
    setSelectedCollegeId(collegeId);
    if (!collegeId) {
      setSearch('');
    } else {
      const found = allDatabaseColleges.find((c) => c.id === collegeId);
      if (found) {
        setSearch(found.name);
        handleSetMyCollege(found);
        // A catalog entry may not have a Festo profile yet. Explore searches
        // the published event index, so it works for every campus choice.
        navigate(`/explore?q=${encodeURIComponent(found.eventSearchTerm || found.name)}`);
      }
    }
    setPage(1);
  };

  // When user types in direct search input
  const handleDirectSearchChange = (value) => {
    setSearch(value);
    setSelectedCollegeId('');
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearch('');
    setSelectedCollegeId('');
    setPage(1);
  };

  return (
    <div className="space-y-8 py-6">
      {/* 1. Directory Header */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <span>Verified Colleges</span>
        </h2>

        <Button asChild variant="outline" size="sm" className="gap-1.5 text-xs">
          <Link to="/host">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            Host an Event
          </Link>
        </Button>
      </div>

      {/* 2. My Campus Bookmark Banner (if selected) */}
      {myCollege && (
        <div className="rounded-2xl border border-purple-500/30 bg-purple-950/20 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg backdrop-blur-xl">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-purple-600/25 border border-purple-500/40 text-purple-300 flex items-center justify-center shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1">
                  <Star className="w-3 h-3 fill-current text-purple-400" />
                  Your Selected Campus
                </span>
              </div>
              <h3 className="text-base font-bold text-foreground mt-0.5">{myCollege.name}</h3>
              {myCollege.location && (
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-purple-400" />
                  {myCollege.location}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Button asChild size="sm" className="bg-purple-600 hover:bg-purple-500 text-white text-xs gap-1.5">
              <Link to={myCollege.slug ? `/colleges/${myCollege.slug}` : `/explore?q=${encodeURIComponent(myCollege.name)}`}>
                View Campus Events
              </Link>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClearMyCollege}
              className="text-xs text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              Change
            </Button>
          </div>
        </div>
      )}

      {/* 3. Dual Search & College Database Selection Panel */}
      <div className="festo-college-filter rounded-2xl border border-white/10 p-4 sm:p-5 shadow-xl space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
          {/* Option A: Direct Search Bar */}
          <div className="lg:col-span-7 relative">
            <label htmlFor="college-search-input" className="block text-xs font-semibold text-white/80 mb-1.5">
              Direct Search College
            </label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-purple-400 pointer-events-none" />
              <Input
                id="college-search-input"
                type="text"
                value={search}
                onChange={(e) => handleDirectSearchChange(e.target.value)}
                placeholder="Search verified colleges by name or location..."
                className="h-12 border-white/20 bg-white/10 pl-11 pr-11 text-white placeholder:text-white/55 text-sm focus-visible:ring-purple-500/50 caret-purple-400"
                style={{ color: '#ffffff', backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
                aria-label="Search verified colleges by name or location"
              />
              {search && (
                <button
                  type="button"
                  aria-label="Clear college search"
                  onClick={handleClearFilters}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Option B: Select College from Database Dropdown */}
          <div className="lg:col-span-5 relative">
            <label htmlFor="college-database-select" className="block text-xs font-semibold text-white/80 mb-1.5 flex items-center justify-between">
              <span>Search College</span>
              {selectedCollegeId && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="text-[11px] text-purple-300 hover:text-white underline font-normal"
                >
                  Reset selection
                </button>
              )}
            </label>
            <div className="relative">
              <Building2 className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-purple-400 pointer-events-none" />
              <select
                id="college-database-select"
                value={selectedCollegeId}
                onChange={(e) => handleSelectFromDatabase(e.target.value)}
                className="w-full h-12 rounded-xl border border-white/20 bg-[#161722] pl-11 pr-9 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-colors cursor-pointer appearance-none"
                style={{ color: '#ffffff', backgroundColor: '#161722' }}
              >
                <option value="">
                  {allDatabaseColleges.length > 0
                    ? '🏫 Search college...'
                    : 'Loading colleges...'}
                </option>
                <option value="">All Colleges (Show All)</option>
                {allDatabaseColleges.map((col) => (
                  <option key={col.id} value={col.id}>
                    {col.name} {col.location ? `— ${col.location}` : ''}
                  </option>
                ))}
              </select>
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
                ▼
              </div>
            </div>
          </div>
        </div>

        {/* Quick Selection Pills & Status */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-white/10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-white/70 flex items-center gap-1 font-medium mr-1">
              <Filter className="w-3.5 h-3.5 text-purple-400" />
              Quick Pick:
            </span>

            <button
              type="button"
              onClick={handleClearFilters}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                !search && !selectedCollegeId
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-white/10 text-white/80 hover:bg-white/20 hover:text-white'
              }`}
            >
              All Colleges ({allDatabaseColleges.length})
            </button>

            {allDatabaseColleges.slice(0, 4).map((col) => {
              const isSelected = selectedCollegeId === col.id || search === col.name;
              return (
                <button
                  key={col.id}
                  type="button"
                  onClick={() => handleSelectFromDatabase(col.id)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all max-w-[220px] truncate ${
                    isSelected
                      ? 'bg-purple-600 text-white shadow-sm ring-1 ring-purple-400'
                      : 'bg-white/10 text-white/80 hover:bg-white/20 hover:text-white'
                  }`}
                  title={col.name}
                >
                  {col.name}
                </button>
              );
            })}
          </div>

          <p className="text-xs text-white/70">Searches the full Indian college directory.</p>
        </div>
      </div>

      {/* 4. Directory Grid */}
      <div>
        {recentlyViewedColleges.length > 0 && (
          <section className="mb-10 space-y-4">
            <div>
              <h3 className="text-lg font-bold text-foreground">Recently viewed campuses</h3>
              <p className="text-xs text-muted-foreground">Visible for 24 hours after you open one of their events.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {recentlyViewedColleges.map((college) => (
                <CollegeCard
                  key={`recent-${college.id}`}
                  college={college}
                  isMyCollege={myCollege?.id === college.id}
                  onSetMyCollege={handleSetMyCollege}
                />
              ))}
            </div>
          </section>
        )}
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
              {activeQueryTerm
                ? `No verified colleges match "${activeQueryTerm}". Try clearing filters to view all.`
                : 'No verified colleges have been added to the directory yet.'}
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearFilters}
              >
                Clear Filter &amp; View All
              </Button>
              <Button asChild size="sm" className="bg-purple-600 hover:bg-purple-500 text-white">
                <Link to="/host">Host an Event</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {colleges.map((college) => (
              <CollegeCard
                key={college.id}
                college={college}
                isMyCollege={myCollege?.id === college.id}
                onSetMyCollege={handleSetMyCollege}
              />
            ))}
          </div>
        )}

        {/* 5. Pagination Controls */}
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
