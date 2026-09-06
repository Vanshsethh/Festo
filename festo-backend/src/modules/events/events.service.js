import * as eventsRepo from './events.repo.js';
import { slugify } from '../../utils/slug.js';
import { hasOwnership } from '../../middleware/authorize.js';
import { createPending } from '../notifications/notifications.repo.js';
import { enqueueEventReminder } from '../../workers/queues.js';
import { enqueueNotificationSafely } from '../notifications/notifications.service.js';
import { pool } from '../../db/pool.js';

const fail = (message, statusCode) => Object.assign(new Error(message), { statusCode });
const withDisplayStatus = (event) => {
  if (!event) return event;
  const now = new Date();
  if (now >= new Date(event.end_date)) return { ...event, display_status: 'COMPLETED' };
  if (now >= new Date(event.start_date)) return { ...event, display_status: 'ONGOING' };
  const closed = now >= new Date(event.registration_deadline) || (event.capacity !== null && event.registered_count >= event.capacity);
  return { ...event, display_status: closed ? 'REGISTRATION_CLOSED' : 'REGISTRATION_OPEN' };
};

const uniqueSlug = async (title) => {
  const base = slugify(title) || 'event'; let slug = base; let suffix = 1;
  while (await eventsRepo.findBySlugRaw(slug)) slug = `${base}-${suffix++}`;
  return slug;
};
const ownedEvent = async (user, eventId) => {
  const event = await eventsRepo.findById(eventId);
  if (!event) throw fail('Event not found.', 404);
  // Ownership check - user must be the creator of the event
  if (!hasOwnership(user, event.created_by)) throw fail('You are not authorized to manage this event.', 403);
  return event;
};

export const createEvent = async (user, data) => {
  // Users can create events (no college requirement for MVP - organizers can create events without being tied to a college)
  // For MVP, we'll allow users to create events without college affiliation
  // In the future, we might tie events to colleges/organizations
  return eventsRepo.create({
    ...data,
    created_by: user.id,
    slug: await uniqueSlug(data.title),
    status: 'PUBLISHED' // Publish immediately for MVP
  });
};
export const updateEvent = async (user, id, data) => {
  const event = await ownedEvent(user, id);
  // Allow editing of published events for non-critical fields
  // In the future, we might restrict this, but for MVP allow editing
  if (data.capacity !== undefined && data.capacity !== null && data.capacity < event.registered_count) {
    throw fail('Capacity cannot be reduced below the current registration count.', 409);
  }
  const dates = { start_date: data.start_date || event.start_date, end_date: data.end_date || event.end_date, registration_deadline: data.registration_deadline || event.registration_deadline };
  if (new Date(dates.end_date) <= new Date(dates.start_date) || new Date(dates.registration_deadline) >= new Date(dates.start_date)) throw fail('Event dates are invalid.', 400);
  return eventsRepo.update(id, data);
};

// Removed submitEvent, approveEvent, rejectEvent functions as they're not needed for MVP
// Events are published immediately upon creation

export const cancelEvent = async (user, id) => {
  const event = await ownedEvent(user, id);
  if (['COMPLETED', 'CANCELLED'].includes(event.status)) throw fail('This event cannot be cancelled.', 409);
  return eventsRepo.updateStatus(id, 'CANCELLED');
};

export const deleteEvent = async (user, id) => {
  const event = await ownedEvent(user, id);
  await eventsRepo.deleteById(id);
  return { success: true, id };
};

export const autoDeleteConcludedEvents = async () => {
  return eventsRepo.autoDeleteConcluded();
};

export const getPublicEvent = async (slug) => {
  const event = await eventsRepo.findBySlug(slug);
  if (!event) throw fail('Event not found.', 404);
  if (new Date(event.end_date) < new Date()) {
    // Automatically purge concluded event from database and return 404
    await eventsRepo.deleteById(event.id).catch(() => {});
    throw fail('This event has concluded and is no longer available.', 404);
  }
  return withDisplayStatus(event);
};

export const listPublicEvents = async (query) => {
  // Purge concluded events so they never remain on the website
  eventsRepo.autoDeleteConcluded().catch((err) => console.error('Auto-delete concluded events error:', err.message));
  const offset = (query.page - 1) * query.limit;
  const [events, total] = await Promise.all([eventsRepo.listPublic({ ...query, offset }), eventsRepo.countPublic(query)]);
  return { events: events.map(withDisplayStatus), pagination: { total, page: query.page, limit: query.limit, totalPages: Math.max(1, Math.ceil(total / query.limit)) } };
};

export const listMyEvents = async (user) => {
  // For MVP, show all events created by the user
  return (await eventsRepo.listForUser(user.id)).map(withDisplayStatus);
};

// Removed listPendingEvents as it's not needed for MVP
