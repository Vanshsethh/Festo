import { pool } from '../../db/pool.js';

export const findRegistrationForPassGeneration = async (registrationId) => {
  const result = await pool.query(
    'SELECT id, status FROM registrations WHERE id = $1',
    [registrationId]
  );
  return result.rows[0] || null;
};

export const findByRegistrationId = async (registrationId) => {
  const result = await pool.query('SELECT * FROM tickets WHERE registration_id = $1', [registrationId]);
  return result.rows;
};

export const create = async ({ registrationId, ticketNumber, ticketCode, qrToken }) => {
  const result = await pool.query(
    `INSERT INTO tickets (registration_id, ticket_number, ticket_code, qr_token)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (registration_id, ticket_number) DO NOTHING
     RETURNING *`,
    [registrationId, ticketNumber, ticketCode, qrToken]
  );
  return result.rows[0] || null;
};

export const listForUser = async (userId) => {
  const result = await pool.query(
    `SELECT r.id AS registration_id, r.status AS registration_status, r.registered_at, r.quantity,
            t.id AS ticket_id, t.ticket_number, t.ticket_code, t.qr_token, t.status AS ticket_status, t.created_at AS ticket_created_at,
            e.id AS event_id, e.title, e.slug, e.category, e.poster_url, e.venue,
            e.start_date, e.end_date, e.status AS event_status,
            c.name AS college_name, c.slug AS college_slug
     FROM registrations r
     JOIN events e ON e.id = r.event_id
     JOIN colleges c ON c.id = e.college_id
     JOIN tickets t ON t.registration_id = r.id
     WHERE r.user_id = $1 AND r.status = 'CONFIRMED'
     ORDER BY e.start_date ASC, t.ticket_number ASC`,
    [userId]
  );
  return result.rows;
};

export const findOwnedById = async (ticketId, userId) => {
  const result = await pool.query(
    `SELECT t.id, t.ticket_number, t.ticket_code, t.qr_token, t.status, t.created_at,
            t.registration_id,
            r.id AS registration_id, r.status AS registration_status, r.quantity,
            e.id AS event_id, e.title, e.slug, e.category, e.venue, e.start_date, e.end_date,
            c.name AS college_name
     FROM tickets t
     JOIN registrations r ON r.id = t.registration_id
     JOIN events e ON e.id = r.event_id
     JOIN colleges c ON c.id = e.college_id
     WHERE t.id = $1 AND r.user_id = $2 AND r.status = 'CONFIRMED'`,
    [ticketId, userId]
  );
  return result.rows[0] || null;
};

export const listOutstandingRegistrations = async () => {
  const result = await pool.query(
    `SELECT r.id, r.quantity, COUNT(t.id)::int AS ticket_count
     FROM registrations r
     LEFT JOIN tickets t ON t.registration_id = r.id
     WHERE r.status = 'CONFIRMED'
     GROUP BY r.id, r.quantity
     HAVING COUNT(t.id) < r.quantity`
  );
  return result.rows;
};

export const listOutstandingForUser = async (userId) => {
  const result = await pool.query(
    `SELECT r.id, r.quantity, COUNT(t.id)::int AS ticket_count
     FROM registrations r
     LEFT JOIN tickets t ON t.registration_id = r.id
     WHERE r.user_id = $1 AND r.status = 'CONFIRMED'
     GROUP BY r.id, r.quantity
     HAVING COUNT(t.id) < r.quantity`,
    [userId]
  );
  return result.rows;
};

export const findByRegistrationIdAndNumber = async (registrationId, ticketNumber) => {
  const result = await pool.query(
    'SELECT * FROM tickets WHERE registration_id = $1 AND ticket_number = $2',
    [registrationId, ticketNumber]
  );
  return result.rows[0] || null;
};

export const markTicketAsUsed = async (client, ticketId) => {
  const result = await client.query(
    `UPDATE tickets SET status = 'USED', updated_at = now() WHERE id = $1 RETURNING *`,
    [ticketId]
  );
  return result.rows[0] || null;
};

export const findTicketByQrToken = async (client, qrToken) => {
  const result = await client.query(
    `SELECT t.id AS ticket_id, t.ticket_code, t.qr_token, t.status AS ticket_status,
            t.registration_id,
            r.id AS registration_id, r.status AS registration_status, r.user_id,
            e.id AS event_id, e.title, e.slug, e.category, e.venue, e.start_date, e.end_date, e.college_id,
            u.id AS attendee_id, u.name AS attendee_name,
            ci.id AS check_in_id, ci.checked_in_at
     FROM tickets t
     JOIN registrations r ON r.id = t.registration_id
     JOIN events e ON e.id = r.event_id
     JOIN users u ON u.id = r.user_id
     LEFT JOIN check_ins ci ON ci.pass_id = t.id
     WHERE t.qr_token = $1
     FOR UPDATE OF r`,
    [qrToken]
  );
  return result.rows[0] || null;
};