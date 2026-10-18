import React from 'react';
import { Users } from 'lucide-react';

export const AvailabilityBar = ({ capacity, registeredCount, className = '', showLabel = true }) => {
  if (!capacity) {
    return (
      <div className={`flex items-center gap-1.5 text-xs text-emerald-400 font-semibold ${className}`}>
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>Open Capacity (Unlimited)</span>
      </div>
    );
  }

  const registered = Math.min(registeredCount || 0, capacity);
  const percent = Math.min(100, Math.round((registered / capacity) * 100));
  const remaining = Math.max(0, capacity - registered);

  // Color dynamics: Green (<60%), Amber (60-85%), Coral/Red (>85% or sold out)
  const tone =
    percent >= 100
      ? 'from-rose-500 to-red-600'
      : percent >= 80
      ? 'from-amber-500 to-rose-500'
      : percent >= 50
      ? 'from-cyan-500 to-emerald-400'
      : 'from-emerald-500 to-teal-400';

  const badgeColor =
    percent >= 100
      ? 'text-rose-400 bg-rose-500/10 border-rose-500/20'
      : percent >= 80
      ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
      : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';

  return (
    <div className={`space-y-1.5 ${className}`}>
      {showLabel && (
        <div className="flex items-center justify-between text-xs font-medium">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span>{percent}% booked</span>
          </span>
          <span className={`px-2 py-0.5 rounded-full border text-[11px] font-bold ${badgeColor}`}>
            {remaining === 0 ? 'Sold Out' : `${remaining} left`}
          </span>
        </div>
      )}

      {/* Progress Track */}
      <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden p-[1px]">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${tone} transition-all duration-700 ease-out`}
          style={{ width: `${Math.max(percent > 0 ? 6 : 0, percent)}%` }}
        />
      </div>
    </div>
  );
};
