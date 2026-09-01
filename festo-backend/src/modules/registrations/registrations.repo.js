import { pool } from '../../db/pool.js';

export const lockEvent = async (client, eventId) => {
  const result = await client.query('SELECT * FROM events WHERE id = $1 FOR UPDATE', [eventId]);
  return result.rows[0] || null;
};

export const createConfirmed = async (client, userId, eventId, quantity = 1) => {
  const result = await client.query(
    `INSERT INTO registrations (user_id, event_id, status, quantity)
     VALUES ($1, $2, 'CONFIRMED', $3)
     ON CONFLICT (user_id, event_id) DO NOTHING
     RETURNING *`,
    [userId, eventId, quantity]
  );
  return result.rows[0] || null;
};

export const incrementRegisteredCount = (client, eventId, quantity = 1) =>
  client.query('UPDATE events SET registered_count = registered_count + $1, updated_at = now() WHERE id = $2', [quantity, eventId]);

export const findForCancellation = async (client, registrationId, userId) => {
  const result = await client.query(
    'SELECT *, quantity FROM registrations WHERE id = $1 AND user_id = $2 FOR UPDATE',
    [registrationId, userId]
  );
  return result.rows[0] || null;
};

export const cancel = (client, registrationId) =>
  client.query(`UPDATE registrations SET status = 'CANCELLED' WHERE id = $1`, [registrationId]);

export const decrementRegisteredCount = (client, eventId, quantity = 1) =>
  client.query(
    'UPDATE events SET registered_count = GREATEST(registered_count - $1, 0), updated_at = now() WHERE id = $2',
    [quantity, eventId]
  );

export const findById = async (registrationId) => {
  const result = await pool.query('SELECT * FROM registrations WHERE id = $1', [registrationId]);
  return result.rows[0] || null;
};

export const listForUser = async (userId) => {
  const result = await pool.query(
    `SELECT r.id, r.status AS registration_status, r.registered_at, r.quantity,
            e.id AS event_id, e.title, e.slug, e.category, e.poster_url, e.venue,
            e.start_date, e.end_date, e.registration_deadline, e.capacity, e.registered_count,
            e.status AS event_status, c.id AS college_id, c.name AS college_name, c.slug AS college_slug
     FROM registrations r
     JOIN events e ON e.id = r.event_id
     JOIN colleges c ON c.id = e.college_id
     WHERE r.user_id = $1
     ORDER BY e.start_date ASC`,
    [userId]
  );
  return result.rows;
};