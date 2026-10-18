import { pool } from '../../db/pool.js';

export const createPending = async (client, { userId, type, payload }) => {
  const result = await client.query(
    `INSERT INTO notifications (user_id, type, payload) VALUES ($1, $2, $3)
     ON CONFLICT DO NOTHING RETURNING *`,
    [userId, type, payload]
  );
  return result.rows[0] || null;
};

export const findForDelivery = async (notificationId) => {
  const result = await pool.query(
    `SELECT n.*, u.name, u.email FROM notifications n JOIN users u ON u.id = n.user_id WHERE n.id = $1`,
    [notificationId]
  );
  return result.rows[0] || null;
};

export const markSent = (notificationId) => pool.query(`UPDATE notifications SET status = 'SENT' WHERE id = $1`, [notificationId]);
export const markFailed = (notificationId) => pool.query(`UPDATE notifications SET status = 'FAILED' WHERE id = $1`, [notificationId]);

export const listForUser = async (userId, limit = 20) => {
  const result = await pool.query(
    `SELECT id, type, payload, status, created_at
     FROM notifications
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT $2`,
    [userId, limit]
  );
  return result.rows;
};

export const listConfirmedUsersForEvent = async (eventId) => {
  const result = await pool.query(`SELECT user_id FROM registrations WHERE event_id = $1 AND status = 'CONFIRMED'`, [eventId]);
  return result.rows.map(({ user_id: userId }) => userId);
};

export const findEventForReminder = async (eventId) => {
  const result = await pool.query(`SELECT id, title, start_date, venue FROM events WHERE id = $1`, [eventId]);
  return result.rows[0] || null;
};
