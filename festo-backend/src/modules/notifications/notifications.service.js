import { Resend } from 'resend';
import { env } from '../../config/env.js';
import { pool } from '../../db/pool.js';
import { enqueueNotification } from '../../workers/queues.js';
import * as notificationsRepo from './notifications.repo.js';

const isResendConfigured = Boolean(env.RESEND_API_KEY);
const emailFor = (notification) => {
  const payload = notification.payload || {};
  if (notification.type === 'REGISTRATION_CONFIRMED') return { subject: `Registration confirmed: ${payload.event_title}`, html: `<p>Hi ${notification.name},</p><p>Your registration for <strong>${payload.event_title}</strong> is confirmed. Your digital pass is available in Festo.</p>` };
  if (notification.type === 'EVENT_REMINDER') return { subject: `Reminder: ${payload.event_title} is tomorrow`, html: `<p>Hi ${notification.name},</p><p><strong>${payload.event_title}</strong> starts on ${new Date(payload.start_date).toLocaleString()}. Venue: ${payload.venue || 'To be announced'}.</p>` };
  if (notification.type === 'EVENT_PUBLISHED') return { subject: `Your event is published: ${payload.event_title}`, html: `<p>Hi ${notification.name},</p><p>Your event <strong>${payload.event_title}</strong> is now published on Festo.</p>` };
  return { subject: 'Festo notification', html: `<p>Hi ${notification.name},</p><p>You have a new Festo notification.</p>` };
};

export const enqueueNotificationSafely = async (notificationId) => {
  if (!notificationId) return;
  try { await enqueueNotification(notificationId); } catch (error) { console.error(`Could not enqueue notification ${notificationId}:`, error.message); }
};

export const deliverNotification = async (notificationId) => {
  const notification = await notificationsRepo.findForDelivery(notificationId);
  if (!notification || notification.status === 'SENT') return { status: 'skipped', notificationId };
  if (!isResendConfigured) throw new Error('Resend is not configured.');
  const email = emailFor(notification);
  await new Resend(env.RESEND_API_KEY).emails.send({ from: env.EMAIL_FROM, to: notification.email, ...email });
  await notificationsRepo.markSent(notificationId);
  return { status: 'sent', notificationId };
};

export const createEventReminders = async (eventId) => {
  const event = await notificationsRepo.findEventForReminder(eventId);
  if (!event) return 0;
  const users = await notificationsRepo.listConfirmedUsersForEvent(eventId);
  const notifications = await Promise.all(users.map((userId) => notificationsRepo.createPending(pool, { userId, type: 'EVENT_REMINDER', payload: { event_id: event.id, event_title: event.title, start_date: event.start_date, venue: event.venue } })));
  await Promise.all(notifications.filter(Boolean).map((notification) => enqueueNotificationSafely(notification.id)));
  return notifications.filter(Boolean).length;
};
