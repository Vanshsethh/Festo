import { pool } from '../../db/pool.js';

const selectEvent = `
  SELECT e.*, c.name AS college_name, c.slug AS college_slug, c.logo_url AS college_logo_url,
         c.verification_status AS college_verification_status,
         u.name AS creator_name
  FROM events e
  JOIN colleges c ON c.id = e.college_id
  JOIN users u ON u.id = e.created_by`;

export const findById = async (id) => {
  const result = await pool.query(`${selectEvent} WHERE e.id = $1`, [id]);
  return result.rows[0] || null;
};

export const findBySlug = async (slug) => {
  const result = await pool.query(`${selectEvent} WHERE e.slug = $1`, [slug]);
  return result.rows[0] || null;
};

export const findBySlugRaw = async (slug) => {
  const result = await pool.query('SELECT id FROM events WHERE slug = $1', [slug]);
  return result.rows[0] || null;
};

export const create = async (data) => {
  const result = await pool.query(
    `INSERT INTO events (college_id, title, slug, description, category, poster_url, poster_public_id, venue, address, start_date, end_date, registration_deadline, capacity, created_by)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING *`,
    [data.college_id, data.title, data.slug, data.description || null, data.category, data.poster_url || null, data.poster_public_id || null, data.venue || null, data.address || null, data.start_date, data.end_date, data.registration_deadline, data.capacity ?? null, data.created_by]
  );
  return findById(result.rows[0].id);
};

export const update = async (id, data) => {
  const fields = [], values = [id];
  let position = 2;
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) { fields.push(`${key} = $${position++}`); values.push(value === '' ? null : value); }
  }
  if (!fields.length) return findById(id);
  fields.push('updated_at = now()');
  await pool.query(`UPDATE events SET ${fields.join(', ')} WHERE id = $1`, values);
  return findById(id);
};

export const updateStatus = async (id, status) => {
  await pool.query('UPDATE events SET status = $2, updated_at = now() WHERE id = $1', [id, status]);
  return findById(id);
};

export const listPublic = async ({ search, category, college_id, limit, offset }) => {
  let query = `${selectEvent} WHERE e.status = 'PUBLISHED' AND c.verification_status = 'VERIFIED'`;
  const values = [];
  if (search) { values.push(`%${search}%`); query += ` AND (e.title ILIKE $${values.length} OR e.description ILIKE $${values.length} OR c.name ILIKE $${values.length})`; }
  if (category) { values.push(category); query += ` AND e.category = $${values.length}`; }
  if (college_id) { values.push(college_id); query += ` AND e.college_id = $${values.length}`; }
  values.push(limit, offset);
  query += ` ORDER BY e.start_date ASC LIMIT $${values.length - 1} OFFSET $${values.length}`;
  return (await pool.query(query, values)).rows;
};

export const countPublic = async ({ search, category, college_id }) => {
  let query = `SELECT COUNT(*) AS total FROM events e JOIN colleges c ON c.id = e.college_id WHERE e.status = 'PUBLISHED' AND c.verification_status = 'VERIFIED'`;
  const values = [];
  if (search) { values.push(`%${search}%`); query += ` AND (e.title ILIKE $${values.length} OR e.description ILIKE $${values.length} OR c.name ILIKE $${values.length})`; }
  if (category) { values.push(category); query += ` AND e.category = $${values.length}`; }
  if (college_id) { values.push(college_id); query += ` AND e.college_id = $${values.length}`; }
  return Number((await pool.query(query, values)).rows[0].total);
};

export const listForCollege = async (collegeId) => (await pool.query(`${selectEvent} WHERE e.college_id = $1 ORDER BY e.updated_at DESC`, [collegeId])).rows;
export const listPending = async () => (await pool.query(`${selectEvent} WHERE e.status = 'PENDING_APPROVAL' ORDER BY e.created_at ASC`)).rows;
