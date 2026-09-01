import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { collegesService } from '../../services/colleges.service.js';
import { Building2, MapPin, Calendar, ArrowLeft, Globe, Share2, Sparkles, PlusCircle } from 'lucide-react';
import { VerifiedBadge } from '../../components/colleges/VerifiedBadge.jsx';
import { Button } from '../../components/ui/button.jsx';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card.jsx';
import { useAuth } from '../../hooks/useAuth.jsx';

export const CollegeDetailPage = () => {
  const { identifier } = useParams();
  const { user } = useAuth();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['college', identifier],
    queryFn: () => collegesService.getCollege(identifier),
  });

  const college = data?.data?.college;
  const isCollegeAdmin = user && (user.role === 'SUPER_ADMIN' || user.college_id === college?.id);

  if (isLoading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (isError || !college) {
    return (
      <div className="max-w-md mx-auto my-16 text-center space-y-4">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center">
          <Building2 className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold">College Not Found</h2>
        <p className="text-sm text-muted-foreground">
          The requested college profile does not exist or has not been verified yet.
        </p>
        <Button asChild variant="outline">
          <Link to="/colleges">Back to Colleges</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Back navigation */}
      <div>
        <Link
          to="/colleges"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Colleges
        </Link>
      </div>

      {/* College Banner Header */}
      <div className="relative rounded-3xl border border-border overflow-hidden bg-card/90 shadow-2xl">
        {/* Cover Photo */}
        <div className="h-48 sm:h-72 w-full bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 relative overflow-hidden">
          {college.cover_url ? (
            <img
              src={college.cover_url}
              alt={`${college.name} banner`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center opacity-20">
              <Building2 className="w-20 h-20 text-purple-400" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        </div>

        {/* Profile Details Header */}
        <div className="p-6 sm:p-8 pt-0 relative -mt-16 sm:-mt-20">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="flex items-end gap-4 sm:gap-6">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl bg-card border-4 border-background p-2 shadow-2xl overflow-hidden flex items-center justify-center shrink-0">
                {college.logo_url ? (
                  <img
                    src={college.logo_url}
                    alt={college.name}
                    className="w-full h-full object-contain rounded-2xl"
                  />
                ) : (
                  <Building2 className="w-12 h-12 text-purple-400" />
                )}
              </div>

              <div className="space-y-1.5 pb-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                    {college.name}
                  </h1>
                  {college.verification_status === 'VERIFIED' && <VerifiedBadge size="md" />}
                </div>

                {college.location && (
                  <div className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 text-purple-400 shrink-0" />
                    <span>{college.location}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Organizer Quick Actions */}
            {isCollegeAdmin && (
              <div className="flex items-center gap-2 pt-2 sm:pt-0">
                <Button asChild className="bg-purple-600 hover:bg-purple-500 gap-1.5">
                  <Link to="/college/dashboard">
                    <Sparkles className="w-4 h-4" /> Organizer Portal
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Events & About */}
        <div className="lg:col-span-2 space-y-6">
          {/* About College */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">About the Campus</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {college.description ||
                  'No description has been provided for this college profile yet.'}
              </p>
            </CardContent>
          </Card>

          {/* Hosted Events Section */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-400" /> Hosted College Events
              </CardTitle>
              {isCollegeAdmin && (
                <Button asChild size="sm" variant="outline" className="gap-1.5 text-xs">
                  <Link to="/college/dashboard">
                    <PlusCircle className="w-3.5 h-3.5 text-purple-400" /> Create Event
                  </Link>
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <div className="p-8 text-center rounded-2xl bg-muted/20 border border-dashed border-border/80 space-y-2">
                <Calendar className="w-8 h-8 text-muted-foreground mx-auto" />
                <p className="text-sm font-semibold">Events list will be activated in Phase 4</p>
                <p className="text-xs text-muted-foreground">
                  All published events created by {college.name} will appear here.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right 1 Col: Quick Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">
                Institutional Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="flex items-center justify-between py-2 border-b border-border/60">
                <span className="text-muted-foreground">Status</span>
                {college.verification_status === 'VERIFIED' ? (
                  <VerifiedBadge />
                ) : (
                  <span className="font-semibold capitalize text-amber-400">
                    {college.verification_status}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border/60">
                <span className="text-muted-foreground">Organizer</span>
                <span className="font-semibold text-foreground">{college.applied_by_name}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-muted-foreground">Member Since</span>
                <span className="font-semibold text-foreground">
                  {new Date(college.created_at).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                  })}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
