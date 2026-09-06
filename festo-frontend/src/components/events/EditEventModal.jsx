import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  X,
  CalendarDays,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle2,
  Building2,
  Sparkles,
  MapPin,
  Users
} from 'lucide-react';
import { eventsService } from '../../services/events.service.js';
import { Input } from '../ui/input.jsx';
import { Label } from '../ui/label.jsx';
import { Button } from '../ui/button.jsx';

const CATEGORIES = [
  'FEST', 'CULTURAL', 'DANCE', 'MUSIC', 'TECHNICAL', 'SPORTS', 'HACKATHON',
  'WORKSHOP', 'CONCERT', 'COMPETITION', 'QUIZ', 'MUN', 'GAMING', 'LITERARY',
  'DRAMA_THEATRE', 'ART_DESIGN', 'OTHER'
];

const toDateTimeLocal = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return '';
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60 * 1000);
  return localDate.toISOString().slice(0, 16);
};

export const EditEventModal = ({ isOpen, onClose, event, onUpdated }) => {
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    title: '',
    category: 'FEST',
    description: '',
    venue: '',
    address: '',
    start_date: '',
    end_date: '',
    registration_deadline: '',
    capacity: '',
    poster_url: '',
  });

  const [posterPreviewStatus, setPosterPreviewStatus] = useState('idle');
  const [error, setError] = useState(null);

  // Populate form when event changes or modal opens
  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title || '',
        category: event.category || 'FEST',
        description: event.description || '',
        venue: event.venue || '',
        address: event.address || '',
        start_date: toDateTimeLocal(event.start_date),
        end_date: toDateTimeLocal(event.end_date),
        registration_deadline: toDateTimeLocal(event.registration_deadline),
        capacity: event.capacity !== null && event.capacity !== undefined ? String(event.capacity) : '',
        poster_url: event.poster_url || '',
      });
      if (event.poster_url?.trim()) {
        setPosterPreviewStatus('loaded');
      } else {
        setPosterPreviewStatus('idle');
      }
      setError(null);
    }
  }, [event, isOpen]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const updateMutation = useMutation({
    mutationFn: (payload) => eventsService.update(event.id, payload),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['event', event.slug] });
      queryClient.invalidateQueries({ queryKey: ['events', 'mine'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'user'] });
      if (onUpdated) onUpdated(response?.data?.event);
      onClose();
    },
    onError: (err) => {
      const message =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.message ||
        'Failed to update event details.';
      setError(message);
    },
  });

  if (!isOpen || !event) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.title.trim()) {
      setError('Event title is required.');
      return;
    }

    const startDate = new Date(formData.start_date);
    const endDate = new Date(formData.end_date);
    const regDeadline = new Date(formData.registration_deadline);

    if (endDate <= startDate) {
      setError('End date must be after start date.');
      return;
    }

    if (regDeadline >= startDate) {
      setError('Registration deadline must be before the event starts.');
      return;
    }

    const currentRegistered = event.registered_count || 0;
    if (formData.capacity && Number(formData.capacity) < currentRegistered) {
      setError(
        `Capacity cannot be less than current registered count (${currentRegistered} attendees).`
      );
      return;
    }

    let normalizedPosterUrl = formData.poster_url?.trim() || null;
    if (normalizedPosterUrl && !/^https?:\/\//i.test(normalizedPosterUrl)) {
      normalizedPosterUrl = `https://${normalizedPosterUrl}`;
    }

    const payload = {
      title: formData.title.trim(),
      category: formData.category,
      description: formData.description.trim() || null,
      venue: formData.venue.trim() || null,
      address: formData.address.trim() || null,
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      registration_deadline: regDeadline.toISOString(),
      capacity: formData.capacity ? Number(formData.capacity) : null,
      poster_url: normalizedPosterUrl,
    };

    updateMutation.mutate(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-card border border-purple-500/20 shadow-2xl p-6 sm:p-8 space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border/60">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/20 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              Edit Hosted Event
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Modify Event Information</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Updates will take effect immediately on public event listings.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="w-8 h-8 p-0 rounded-full text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {error && (
          <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="edit-title">Event Title *</Label>
            <Input
              id="edit-title"
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>

          {/* Category & Venue */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="edit-category">Category *</Label>
              <select
                id="edit-category"
                value={formData.category}
                onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground text-sm"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-venue">Venue / Location</Label>
              <Input
                id="edit-venue"
                value={formData.venue}
                onChange={(e) => setFormData((prev) => ({ ...prev, venue: e.target.value }))}
                placeholder="e.g. Auditorium 1, Campus Grounds"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="edit-description">Description</Label>
            <textarea
              id="edit-description"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              className="flex w-full rounded-lg border border-border bg-background/50 px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50"
              placeholder="Describe event details, schedule, or prerequisites..."
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="edit-start">Start Date & Time *</Label>
              <Input
                id="edit-start"
                type="datetime-local"
                value={formData.start_date}
                onChange={(e) => setFormData((prev) => ({ ...prev, start_date: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-end">End Date & Time *</Label>
              <Input
                id="edit-end"
                type="datetime-local"
                value={formData.end_date}
                onChange={(e) => setFormData((prev) => ({ ...prev, end_date: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="edit-deadline">Registration Deadline *</Label>
              <Input
                id="edit-deadline"
                type="datetime-local"
                value={formData.registration_deadline}
                onChange={(e) => setFormData((prev) => ({ ...prev, registration_deadline: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-capacity">
                Capacity ({event.registered_count || 0} registered)
              </Label>
              <Input
                id="edit-capacity"
                type="number"
                min={event.registered_count || 1}
                placeholder="Leave blank for unlimited"
                value={formData.capacity}
                onChange={(e) => setFormData((prev) => ({ ...prev, capacity: e.target.value }))}
              />
            </div>
          </div>

          {/* Banner URL & Live Preview */}
          <div className="space-y-2 pt-1">
            <Label htmlFor="edit-poster">Event Banner / Poster URL</Label>
            <div className="relative">
              <ImageIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="edit-poster"
                type="url"
                placeholder="https://.../event-poster.jpg"
                className="pl-10"
                value={formData.poster_url}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData((prev) => ({ ...prev, poster_url: val }));
                  if (val.trim()) {
                    setPosterPreviewStatus('loading');
                  } else {
                    setPosterPreviewStatus('idle');
                  }
                }}
                onBlur={() => {
                  const trimmed = formData.poster_url.trim();
                  if (trimmed && !/^https?:\/\//i.test(trimmed)) {
                    setFormData((prev) => ({ ...prev, poster_url: `https://${trimmed}` }));
                  }
                }}
              />
            </div>

            {/* Live Banner Preview */}
            {formData.poster_url.trim() && (
              <div className="rounded-xl border border-purple-500/20 bg-background/80 p-2.5 space-y-1.5">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="font-semibold text-purple-300 flex items-center gap-1">
                    <ImageIcon className="w-3.5 h-3.5" /> Banner Preview
                  </span>
                  {posterPreviewStatus === 'loaded' && (
                    <span className="text-emerald-400 font-medium">✓ Image loaded</span>
                  )}
                  {posterPreviewStatus === 'error' && (
                    <span className="text-destructive font-medium">✕ Image load error</span>
                  )}
                </div>
                <div className="relative w-full aspect-[16/9] max-h-40 rounded-lg overflow-hidden bg-slate-950 flex items-center justify-center border border-border/50">
                  <img
                    src={formData.poster_url.trim()}
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 w-full h-full object-cover blur-xl opacity-30 scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <img
                    src={formData.poster_url.trim()}
                    alt="Banner Preview"
                    referrerPolicy="no-referrer"
                    className="relative z-10 max-h-full max-w-full object-contain"
                    onLoad={() => setPosterPreviewStatus('loaded')}
                    onError={() => setPosterPreviewStatus('error')}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/60">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={updateMutation.isPending}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 gap-1.5"
            >
              {updateMutation.isPending ? 'Saving Changes…' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
