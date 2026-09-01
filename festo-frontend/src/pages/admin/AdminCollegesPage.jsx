import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collegesService } from '../../services/colleges.service.js';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card.jsx';
import { Button } from '../../components/ui/button.jsx';
import { Input } from '../../components/ui/input.jsx';
import {
  ShieldCheck,
  Building2,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  MapPin,
  Mail,
  User,
  ExternalLink,
  AlertCircle,
  Filter,
} from 'lucide-react';
import { VerifiedBadge } from '../../components/colleges/VerifiedBadge.jsx';

export const AdminCollegesPage = () => {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [selectedCollege, setSelectedCollege] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'colleges', statusFilter, search],
    queryFn: () => collegesService.adminListColleges({ status: statusFilter || undefined, search }),
  });

  const colleges = data?.data?.colleges || [];
  const pagination = data?.data?.pagination || { total: 0 };

  const approveMutation = useMutation({
    mutationFn: (id) => collegesService.adminApproveCollege(id),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'colleges'] });
      setActionSuccess(res?.data?.message || 'College approved successfully!');
      setSelectedCollege(null);
      setTimeout(() => setActionSuccess(null), 4000);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (id) => collegesService.adminRejectCollege(id),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'colleges'] });
      setActionSuccess(res?.data?.message || 'College application rejected.');
      setSelectedCollege(null);
      setTimeout(() => setActionSuccess(null), 4000);
    },
  });

  const pendingCount = colleges.filter((c) => c.verification_status === 'PENDING').length;

  return (
    <div className="space-y-8 py-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" /> Super Admin Console
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">College Onboarding Approvals</h1>
          <p className="text-sm text-muted-foreground">
            Review institution applications, verify campus credentials, and grant organizer permissions.
          </p>
        </div>

        {pendingCount > 0 && (
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-semibold">
            <Clock className="w-4 h-4 animate-pulse" />
            <span>{pendingCount} Pending Review</span>
          </div>
        )}
      </div>

      {actionSuccess && (
        <div className="flex items-center gap-2.5 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex items-center gap-1.5 bg-muted/40 p-1 rounded-xl border border-border">
          <button
            onClick={() => setStatusFilter('')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              statusFilter === ''
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setStatusFilter('PENDING')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              statusFilter === 'PENDING'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Clock className="w-3 h-3" /> Pending
          </button>
          <button
            onClick={() => setStatusFilter('VERIFIED')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              statusFilter === 'VERIFIED'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <CheckCircle2 className="w-3 h-3" /> Verified
          </button>
          <button
            onClick={() => setStatusFilter('REJECTED')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              statusFilter === 'REJECTED'
                ? 'bg-destructive/10 text-destructive border border-destructive/30'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <XCircle className="w-3 h-3" /> Rejected
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, applicant, city..."
            className="pl-10 h-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Applications Table / Cards */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 rounded-2xl bg-card border border-border animate-pulse" />
          ))}
        </div>
      ) : colleges.length === 0 ? (
        <Card className="p-12 text-center space-y-3">
          <Building2 className="w-10 h-10 text-muted-foreground mx-auto" />
          <h3 className="text-base font-bold">No college applications found</h3>
          <p className="text-xs text-muted-foreground">
            No entries match your current status filter or search term.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {colleges.map((college) => (
            <Card
              key={college.id}
              className={`p-5 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                college.verification_status === 'PENDING'
                  ? 'border-amber-500/40 bg-amber-500/5'
                  : 'hover:border-purple-500/30'
              }`}
            >
              {/* College & Applicant Details */}
              <div className="flex items-start gap-4 flex-1">
                <div className="w-12 h-12 rounded-xl bg-card border border-border p-1 shrink-0 flex items-center justify-center">
                  {college.logo_url ? (
                    <img
                      src={college.logo_url}
                      alt={college.name}
                      className="w-full h-full object-contain rounded-lg"
                    />
                  ) : (
                    <Building2 className="w-6 h-6 text-purple-400" />
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-foreground text-base">{college.name}</h3>
                    {college.verification_status === 'VERIFIED' && <VerifiedBadge />}
                    {college.verification_status === 'PENDING' && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                        Pending Review
                      </span>
                    )}
                    {college.verification_status === 'REJECTED' && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-destructive/10 text-destructive border border-destructive/30">
                        Rejected
                      </span>
                    )}
                  </div>

                  {college.location && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-purple-400" /> {college.location}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-400" /> Applied by: {college.applied_by_name}
                    </span>
                    <span className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-slate-400" /> {college.applied_by_email}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0">
                {college.verification_status === 'PENDING' ? (
                  <>
                    <Button
                      size="sm"
                      onClick={() => approveMutation.mutate(college.id)}
                      disabled={approveMutation.isPending || rejectMutation.isPending}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white gap-1.5 shadow-md shadow-emerald-600/20 text-xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Approve & Promote
                    </Button>

                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => rejectMutation.mutate(college.id)}
                      disabled={approveMutation.isPending || rejectMutation.isPending}
                      className="gap-1.5 text-xs"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Reject
                    </Button>
                  </>
                ) : (
                  <Button asChild size="sm" variant="outline" className="text-xs gap-1">
                    <a href={`/colleges/${college.slug || college.id}`} target="_blank" rel="noreferrer">
                      View Public Page <ExternalLink className="w-3 h-3" />
                    </a>
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
