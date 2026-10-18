import React from 'react';
import { Card, CardContent } from '../ui/card.jsx';

export const MetricCard = ({ label, value, icon: Icon, tone = 'purple' }) => (
  <Card className="overflow-hidden"><CardContent className="p-5 flex items-center justify-between gap-3"><div><p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p><p className="text-2xl font-extrabold mt-1">{value ?? 0}</p></div>{Icon && <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${({ purple: 'bg-purple-500/10 text-purple-400', cyan: 'bg-cyan-500/10 text-cyan-400', emerald: 'bg-emerald-500/10 text-emerald-400', amber: 'bg-amber-500/10 text-amber-400', red: 'bg-red-500/10 text-red-400' })[tone] || 'bg-purple-500/10 text-purple-400'}`}><Icon className="w-5 h-5" /></div>}</CardContent></Card>
);
