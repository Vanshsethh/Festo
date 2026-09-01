import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, MapPin, Calendar, ArrowUpRight } from 'lucide-react';
import { VerifiedBadge } from './VerifiedBadge.jsx';
import { Card } from '../ui/card.jsx';

export const CollegeCard = ({ college }) => {
  return (
    <Card className="group relative overflow-hidden border-border/80 hover:border-purple-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/5 flex flex-col h-full bg-card/90">
      {/* Cover Image Banner */}
      <div className="h-32 w-full bg-gradient-to-r from-purple-950/60 via-slate-900 to-indigo-950/60 relative overflow-hidden">
        {college.cover_url ? (
          <img
            src={college.cover_url}
            alt={`${college.name} cover`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center opacity-30">
            <Building2 className="w-12 h-12 text-purple-400" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
      </div>

      {/* College Info Body */}
      <div className="p-6 pt-0 flex-1 flex flex-col justify-between relative -mt-8">
        <div>
          {/* Logo & Verified Badge */}
          <div className="flex items-end justify-between gap-3 mb-3">
            <div className="w-16 h-16 rounded-2xl bg-card border-2 border-border p-1 shadow-lg shrink-0 overflow-hidden flex items-center justify-center">
              {college.logo_url ? (
                <img
                  src={college.logo_url}
                  alt={college.name}
                  className="w-full h-full object-contain rounded-xl"
                />
              ) : (
                <Building2 className="w-7 h-7 text-purple-400" />
              )}
            </div>

            {college.verification_status === 'VERIFIED' && <VerifiedBadge />}
          </div>

          {/* College Name & Slug */}
          <h3 className="text-lg font-bold text-foreground group-hover:text-purple-300 transition-colors line-clamp-1">
            {college.name}
          </h3>

          {college.location && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1 mb-3">
              <MapPin className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span className="truncate">{college.location}</span>
            </div>
          )}

          {college.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-4">
              {college.description}
            </p>
          )}
        </div>

        {/* Card Footer Action */}
        <div className="pt-4 border-t border-border/60 flex items-center justify-between text-xs">
          <span className="text-muted-foreground flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-purple-400" />
            <span>{college.published_events_count || 0} Events</span>
          </span>

          <Link
            to={`/colleges/${college.slug || college.id}`}
            className="inline-flex items-center gap-1 font-semibold text-purple-400 group-hover:text-purple-300 transition-colors"
          >
            Explore <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </Card>
  );
};
