import { hasOwnership } from '../../middleware/authorize.js';
import { withTransaction } from '../../db/transaction.js';
import * as checkinsRepo from './checkins.repo.js';

const status = (value, data = {}) => ({ status: value, ...data });

export const scanPass = async (scanner, qrToken) => withTransaction(async (client) => {
  const pass = await checkinsRepo.findPassForScan(client, qrToken);
  if (!pass) return status('INVALID_PASS');
  // Check if scanner owns the event (organizer can only check in tickets for their own events)
  if (!hasOwnership(scanner, pass.created_by)) return status('UNAUTHORIZED');

  if (pass.check_in_id) {
    return status('ALREADY_CHECKED_IN', {
      checked_in_at: pass.checked_in_at,
      event: { id: pass.event_id, title: pass.event_title },
    });
  }
  if (pass.registration_status !== 'CONFIRMED') return status('INVALID_PASS');

  const checkIn = await checkinsRepo.createCheckIn(client, pass.pass_id, scanner.id);
  if (!checkIn) {
    return status('ALREADY_CHECKED_IN', {
      event: { id: pass.event_id, title: pass.event_title },
    });
  }

  await checkinsRepo.markRegistrationAttended(client, pass.registration_id);
  return status('VALID', {
    checked_in_at: checkIn.checked_in_at,
    attendee: { id: pass.attendee_id, name: pass.attendee_name },
    event: { id: pass.event_id, title: pass.event_title },
    pass_code: pass.pass_code,
  });
});