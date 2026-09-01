import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { cn } from '../../lib/utils.js';

export const VerifiedBadge = ({ className, size = 'sm' }) => {
  const isSm = size === 'sm';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm',
        isSm ? 'text-[11px] px-2.5 py-0.5' : 'text-xs px-3 py-1',
        className
      )}
    >
      <CheckCircle2 className={cn(isSm ? 'w-3 h-3' : 'w-3.5 h-3.5', 'text-emerald-400 shrink-0')} />
      <span>Verified College</span>
    </span>
  );
};
