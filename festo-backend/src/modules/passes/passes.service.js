import { AppError } from '../../middleware/errorHandler.js';
import { createTicketCode, createQrDataUrl, createQrToken } from '../../utils/qr.js';
import { enqueueTicketGeneration } from '../../workers/queues.js';
import * as passesRepo from './passes.repo.js';

export const generateTicketsForRegistration = async (registrationId, quantity) => {
  const registration = await passesRepo.findRegistrationForPassGeneration(registrationId);
  if (!registration || registration.status !== 'CONFIRMED') {
    return { status: 'skipped', registrationId };
  }

  // Generate tickets for each quantity
  const tickets = [];
  for (let i = 1; i <= quantity; i++) {
    const existingTicket = await passesRepo.findByRegistrationIdAndNumber(registrationId, i);
    if (existingTicket) {
      tickets.push({ status: 'existing', ticket: existingTicket });
      continue;
    }

    const ticket = await passesRepo.create({
      registrationId,
      ticketNumber: i,
      ticketCode: createTicketCode(),
      qrToken: createQrToken(),
    });

    // A duplicate job can win the insert race; return its already-created ticket.
    if (!ticket) {
      const existingTicket = await passesRepo.findByRegistrationIdAndNumber(registrationId, i);
      tickets.push({ status: 'existing', ticket: existingTicket });
    } else {
      tickets.push({ status: 'created', ticket });
    }
  }

  return { status: 'created', tickets };
};

export const recoverOutstandingTickets = async () => {
  const registrations = await passesRepo.listOutstandingRegistrations();
  await Promise.all(registrations.map(async ({ id, quantity }) => {
    try {
      await enqueueTicketGeneration(id, quantity || 1);
    } catch {
      await generateTicketsForRegistration(id, quantity || 1);
    }
  }));
  return registrations.length;
};

export const listMyTickets = async (user) => {
  // Automatically reconcile tickets if worker has not processed them yet
  const outstanding = await passesRepo.listOutstandingForUser(user.id);
  if (outstanding.length > 0) {
    for (const reg of outstanding) {
      await generateTicketsForRegistration(reg.id, reg.quantity || 1);
    }
  }
  return passesRepo.listForUser(user.id);
};

export const getMyTicket = async (user, ticketId) => {
  const ticket = await passesRepo.findOwnedById(ticketId, user.id);
  if (!ticket) throw new AppError('Ticket not found.', 404);

  const { qr_token, ...safeTicket } = ticket;
  return { ...safeTicket, qr_code_data_url: await createQrDataUrl(qr_token) };
};