import * as registrationsRepo from './registrations.repo.js';
import { withTransaction } from '../../db/transaction.js';
import { AppError } from '../../middleware/errorHandler.js';
import { enqueueTicketGeneration } from '../../workers/queues.js';
import { generateTicketsForRegistration } from '../passes/passes.service.js';
import { createPending } from '../notifications/notifications.repo.js';
import { enqueueNotificationSafely } from '../notifications/notifications.service.js';

export const registerForEvent = async (user, eventId, quantity = 1) => {
  // Validate quantity
  if (quantity < 1) {
    throw new AppError('Quantity must be at least 1', 400);
  }
  if (quantity > 10) {
    throw new AppError('Maximum 10 tickets per registration', 400);
  }

  const { registration, notification } = await withTransaction(async (client) => {
    const event = await registrationsRepo.lockEvent(client, eventId);
    if (!event) throw new AppError('Event not found.', 404);
    if (event.status !== 'PUBLISHED') throw new AppError('Registration is not available for this event.', 409);
    if (new Date() >= new Date(event.registration_deadline)) throw new AppError('Registration for this event has closed.', 409);
    if (new Date() >= new Date(event.start_date)) throw new AppError('This event has already started.', 409);
    if (event.capacity !== null && event.registered_count + quantity > event.capacity) throw new AppError('Not enough tickets available for this event.', 409);

    const registration = await registrationsRepo.createConfirmed(client, user.id, eventId, quantity);
    if (!registration) throw new AppError('You are already registered for this event.', 409);
    await registrationsRepo.incrementRegisteredCount(client, eventId, quantity);
    const createdNotification = await createPending(client, {
      userId: user.id,
      type: 'REGISTRATION_CONFIRMED',
      payload: { registration_id: registration.id, event_id: event.id, event_title: event.title, quantity },
    });
    return { registration, notification: createdNotification };
  });

  // This is deliberately after COMMIT. Redis is not source of truth, so an
  // unavailable queue must never undo a valid registration.
  try {
    await enqueueTicketGeneration(registration.id, quantity);
  } catch (error) {
    console.warn(`Redis queue failed, generating ${quantity} ticket(s) directly:`, error.message);
    await generateTicketsForRegistration(registration.id, quantity);
  }
  await enqueueNotificationSafely(notification?.id);

  return registration;
};

export const cancelRegistration = async (user, registrationId) => {
  // Obtain the event identifier before the transaction, then lock the event first.
  // Registration and cancellation therefore share the same lock order: event → registration.
  const existing = await registrationsRepo.findById(registrationId);
  if (!existing || existing.user_id !== user.id) throw new AppError('Registration not found.', 404);

  return withTransaction(async (client) => {
    const event = await registrationsRepo.lockEvent(client, existing.event_id);
    if (!event) throw new AppError('Event not found.', 404);
    const registration = await registrationsRepo.findForCancellation(client, registrationId, user.id);
    if (!registration) throw new AppError('Registration not found.', 404);
    if (registration.status !== 'CONFIRMED') throw new AppError('Only confirmed registrations can be cancelled.', 409);
    if (new Date() >= new Date(event.start_date)) throw new AppError('Registrations cannot be cancelled after an event starts.', 409);

    await registrationsRepo.cancel(client, registrationId);
    await registrationsRepo.decrementRegisteredCount(client, event.id, existing.quantity);
    return { ...registration, status: 'CANCELLED' };
  });
};

export const getMyRegistrations = (user) => registrationsRepo.listForUser(user.id);

export const getRegistrationById = async (registrationId) => {
  const result = await registrationsRepo.findById(registrationId);
  return result;
};