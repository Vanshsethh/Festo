import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventsService } from '../../services/events.service.js';
import { collegesService } from '../../services/colleges.service.js';
import { useAuth } from '../../hooks/useAuth.jsx';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/card.jsx';
import { Input } from '../../components/ui/input.jsx';
import { Label } from '../../components/ui/label.jsx';
import { Button } from '../../components/ui/button.jsx';
import { Building2, Sparkles, AlertCircle, CheckCircle2, Clock, MapPin, ShieldCheck, ArrowRight, Image as ImageIcon, CalendarDays, Users } from 'lucide-react';
import { VerifiedBadge } from '../../components/colleges/VerifiedBadge.jsx';

export const HostEventPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    college_id: '',
    description: '',
    category: 'FEST',
    venue: '',
    address: '',
    start_date: '',
    end_date: '',
    registration_deadline: '',
    capacity: '',
    poster_url: '',
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const { data: collegeData } = useQuery({
    queryKey: ['colleges'],
    queryFn: () => collegesService.getVerifiedColleges({ limit: 100 }),
  });
  const colleges = collegeData?.data?.colleges || [];

  const createEventMutation = useMutation({
    mutationFn: (data) => eventsService.create({
      ...data,
      capacity: data.capacity ? Number(data.capacity) : null,
      start_date: new Date(data.start_date).toISOString(),
      end_date: new Date(data.end_date).toISOString(),
      registration_deadline: new Date(data.registration_deadline).toISOString(),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['events', 'mine'] });
      setSuccess('Event created successfully! It is now published and available for registration.');
      setFormData({
        title: '',
        slug: '',
        college_id: '',
        description: '',
        category: 'FEST',
        venue: '',
        address: '',
        start_date: '',
        end_date: '',
        registration_deadline: '',
        capacity: '',
        poster_url: '',
      });
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Basic validation
    if (!formData.title.trim()) {
      setError('Event title is required.');
      return;
    }

    if (!formData.college_id) {
      setError('Please choose a college.');
      return;
    }

    if (!formData.start_date) {
      setError('Start date is required.');
      return;
    }

    if (!formData.end_date) {
      setError('End date is required.');
      return;
    }

    if (!formData.registration_deadline) {
      setError('Registration deadline is required.');
      return;
    }

    try {
      await createEventMutation.mutateAsync(formData);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.message ||
        'Failed to create event.';
      setError(message);
    }
  };

  // Handle automatic slug generation from title
  const handleTitleChange = (e) => {
    const title = e.target.value;
    setFormData(prev => ({
      ...prev,
      title: title,
      // Auto-generate slug from title if slug is empty
      ...(!prev.slug.trim() && {
        slug: title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')
          .substring(0, 50)
      })
    }));
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 space-y-8">
      {/* Header Headline */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/20">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          Host an Event
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
          Create & Publish Your Event Instantly
        </h1>
        <p className="text-sm text-muted-foreground max-w-xl mx-auto">
          Design your event, set details, and publish immediately - no approval wait times.
          Events are discoverable by students right after creation.
        </p>
      </div>

      {/* Event Creation Form */}
      <Card className="border-purple-500/20 bg-card/90 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-60 h-60 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-xl">Event Details</CardTitle>
              <CardDescription>Fill in the details and publish instantly.</CardDescription>
            </div>
          </div>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {error && (
              <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-emerald-10/10 border border-emerald-500/20 text-emerald-700 text-sm">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="college_id">Host College *</Label>
              <select id="college_id" required value={formData.college_id} onChange={(e) => setFormData(prev => ({ ...prev, college_id: e.target.value }))} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground">
                <option value="">Choose a college</option>
                {colleges.map((college) => <option key={college.id} value={college.id}>{college.name}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Event Title *</Label>
              <Input
                id="title"
                placeholder="e.g. Spring Hackathon 2026 or Annual Cultural Fest"
                value={formData.title}
                onChange={handleTitleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Event URL Slug *</Label>
              <Input
                id="slug"
                placeholder="e.g. spring-hackathon-2026 (auto-generated from title)"
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Used in the event URL: ______.festo.app/events/<span className="font-mono">{formData.slug || 'your-event-slug'}</span>
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Event Description</Label>
              <textarea
                id="description"
                rows={4}
                className="flex w-full rounded-lg border border-border bg-background/50 px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50 focus-visible:border-purple-500 transition-all shadow-sm"
                placeholder="Describe what attendees will experience, activities, speakers, and any special details..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Event Category</Label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full pl-3 pr-10 py-2 border border-purple-200 rounded-lg bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="FEST">Fest</option>
                  <option value="CULTURAL">Cultural</option>
                  <option value="DANCE">Dance</option>
                  <option value="MUSIC">Music</option>
                  <option value="TECHNICAL">Technical</option>
                  <option value="SPORTS">Sports</option>
                  <option value="HACKATHON">Hackathon</option>
                  <option value="WORKSHOP">Workshop</option>
                  <option value="CONCERT">Concert</option>
                  <option value="COMPETITION">Competition</option>
                  <option value="QUIZ">Quiz</option>
                  <option value="MUN">Model UN</option>
                  <option value="GAMING">Gaming</option>
                  <option value="LITERARY">Literary</option>
                  <option value="DRAMA_THEATRE">Drama & Theatre</option>
                  <option value="ART_DESIGN">Art & Design</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="venue">Venue / Location</Label>
                <Input
                  id="venue"
                  placeholder="e.g. Main Auditorium, Campus Grounds, Virtual"
                  value={formData.venue}
                  onChange={(e) => setFormData(prev => ({ ...prev, venue: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="address">Full Address</Label>
                <Input
                  id="address"
                  placeholder="e.g. 123 University Ave, City, State ZIP"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="start_date">Start Date & Time</Label>
                <Input
                  id="start_date"
                  type="datetime-local"
                  value={formData.start_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="end_date">End Date & Time</Label>
                <Input
                  id="end_date"
                  type="datetime-local"
                  value={formData.end_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="registration_deadline">Registration Deadline</Label>
                <Input
                  id="registration_deadline"
                  type="datetime-local"
                  value={formData.registration_deadline}
                  onChange={(e) => setFormData(prev => ({ ...prev, registration_deadline: e.target.value }))}
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Students can register until this time. After this, registration closes.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="capacity">Maximum Attendance (optional)</Label>
              <Input
                id="capacity"
                type="number"
                min="1"
                placeholder="Leave unlimited for no cap"
                value={formData.capacity}
                onChange={(e) => setFormData(prev => ({ ...prev, capacity: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Leave blank for unlimited capacity. Otherwise, set maximum number of attendees.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="poster_url">Event Poster Image URL (optional)</Label>
              <div className="relative">
                <ImageIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="poster_url"
                  type="url"
                  placeholder="https://.../event-poster.jpg"
                  className="pl-10"
                  value={formData.poster_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, poster_url: e.target.value }))}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Recommended aspect ratio: 16:9 or 3:2. Displays on event cards and detail page.
              </p>
            </div>

            <div className="rounded-xl bg-purple-500/5 border border-purple-500/20 p-4 text-xs text-muted-foreground">
              Your event will be live immediately. Capacity is the total number of tickets users can claim.
            </div>
          </CardContent>

          <CardFooter className="flex items-center justify-between pt-2">
            <Button asChild variant="outline">
              <Link to="/explore">Browse Events</Link>
            </Button>
            <Button
              type="submit"
              disabled={createEventMutation.isPending}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-600/30 gap-2"
            >
              {createEventMutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Publishing Event...
                </>
              ) : (
                <>
                  Publish Event Now <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};
