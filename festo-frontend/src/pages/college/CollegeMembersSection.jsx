import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collegesService } from '../../services/colleges.service.js';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card.jsx';
import { Button } from '../../components/ui/button.jsx';
import { Input } from '../../components/ui/input.jsx';
import { Label } from '../../components/ui/label.jsx';
import { Users, UserPlus, Trash2, Shield, Mail, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.jsx';

export const CollegeMembersSection = ({ collegeId }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('COLLEGE_STAFF');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['colleges', collegeId, 'members'],
    queryFn: () => collegesService.getMembers(collegeId),
    enabled: Boolean(collegeId),
  });

  const members = data?.data?.members || [];

  const addMutation = useMutation({
    mutationFn: (payload) => collegesService.addMember(collegeId, payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['colleges', collegeId, 'members'] });
      setEmail('');
      setError(null);
      setSuccess(res?.data?.message || 'Member added successfully!');
      setTimeout(() => setSuccess(null), 4000);
    },
    onError: (err) => {
      setError(err.response?.data?.message || 'Failed to add staff member.');
    },
  });

  const removeMutation = useMutation({
    mutationFn: (memberId) => collegesService.removeMember(collegeId, memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['colleges', collegeId, 'members'] });
    },
  });

  const handleAdd = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setError(null);
    addMutation.mutate({ email, role });
  };

  const isCollegeAdmin = user?.role === 'COLLEGE_ADMIN' || user?.role === 'SUPER_ADMIN';

  return (
    <Card className="border-border">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-400" /> College Staff & Door Check-In Team
          </CardTitle>
          <CardDescription>
            Authorize students or staff to assist with event check-in scanning and gate operations.
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Add Member Form (Admins only) */}
        {isCollegeAdmin && (
          <form onSubmit={handleAdd} className="p-4 rounded-2xl bg-muted/30 border border-border/80 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <UserPlus className="w-3.5 h-3.5" /> Add Staff Member
            </h4>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Registered student email (e.g. staff@college.edu)"
                  className="pl-10 h-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="h-10 rounded-lg border border-border bg-background/50 px-3 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50"
              >
                <option value="COLLEGE_STAFF">Gate Staff (Scan QR)</option>
                <option value="COLLEGE_ADMIN">Co-Admin</option>
              </select>

              <Button
                type="submit"
                disabled={addMutation.isPending}
                size="sm"
                className="bg-purple-600 hover:bg-purple-500 text-white shrink-0 h-10 px-5"
              >
                {addMutation.isPending ? 'Adding...' : 'Add Member'}
              </Button>
            </div>
          </form>
        )}

        {/* Member List */}
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-14 rounded-xl bg-card border border-border animate-pulse" />
            ))}
          </div>
        ) : members.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">No team members added yet.</p>
        ) : (
          <div className="divide-y divide-border/60 rounded-xl border border-border overflow-hidden">
            {members.map((member) => (
              <div
                key={member.id}
                className="p-3.5 sm:px-4 flex items-center justify-between gap-3 bg-card/50 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center font-bold text-xs">
                    {member.name ? member.name[0].toUpperCase() : 'M'}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-foreground flex items-center gap-2">
                      <span>{member.name}</span>
                      <span
                        className={`text-[10px] px-2 py-0.2 rounded-full font-bold border ${
                          member.role === 'COLLEGE_ADMIN'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                        }`}
                      >
                        {member.role === 'COLLEGE_ADMIN' ? 'Admin' : 'Gate Staff'}
                      </span>
                    </div>
                    <div className="text-[11px] text-muted-foreground">{member.email}</div>
                  </div>
                </div>

                {isCollegeAdmin && member.user_id !== user.id && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeMutation.mutate(member.id)}
                    disabled={removeMutation.isPending}
                    className="text-muted-foreground hover:text-destructive text-xs h-8 w-8 p-0"
                    title="Remove member"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
