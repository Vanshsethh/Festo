import { pool } from '../../db/pool.js';

export const createPendingCollege = async ({
  name,
  slug,
  description = null,
  location = null,
  logo_url = null,
  logo_public_id = null,
  cover_url = null,
  cover_public_id = null,
  applied_by,
}) => {
  // For MVP, colleges are verified immediately upon application
  const query = `
    INSERT INTO colleges (
      name, slug, description, location,
      logo_url, logo_public_id, cover_url, cover_public_id,
      verification_status, applied_by
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'VERIFIED', $9)
    RETURNING *
  `;
  const result = await pool.query(query, [
    name,
    slug,
    description,
    location,
    logo_url,
    logo_public_id,
    cover_url,
    cover_public_id,
    applied_by,
  ]);
  return result.rows[0];
};

export const findCollegeById = async (id) => {
  const query = `
    SELECT c.*, u.name as applied_by_name, u.email as applied_by_email
    FROM colleges c
    JOIN users u ON c.applied_by = u.id
    WHERE c.id = $1
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
};

export const findCollegeBySlug = async (slug) => {
  const query = `
    SELECT c.*, u.name as applied_by_name, u.email as applied_by_email
    FROM colleges c
    JOIN users u ON c.applied_by = u.id
    WHERE c.slug = $1
  `;
  const result = await pool.query(query, [slug]);
  return result.rows[0] || null;
};

export const findApplicationByUser = async (userId) => {
  const query = `
    SELECT * FROM colleges
    WHERE applied_by = $1
    ORDER BY created_at DESC
    LIMIT 1
  `;
  const result = await pool.query(query, [userId]);
  return result.rows[0] || null;
};

export const findVerifiedColleges = async ({ search, limit = 20, offset = 0 }) => {
  let query = `
    SELECT c.id, c.name, c.slug, c.description, c.location,
           c.logo_url, c.cover_url, c.verification_status, c.created_at,
           (SELECT COUNT(*) FROM events e WHERE e.college_id = c.id AND e.status = 'PUBLISHED') as published_events_count
    FROM colleges c
    WHERE c.verification_status = 'VERIFIED'
  `;
  const params = [];

  if (search) {
    params.push(`%${search}%`);
    query += ` AND (c.name ILIKE $${params.length} OR c.location ILIKE $${params.length})`;
  }

  query += ` ORDER BY c.name ASC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
  params.push(limit, offset);

  const result = await pool.query(query, params);
  return result.rows;
};

export const countVerifiedColleges = async ({ search }) => {
  let query = `
    SELECT COUNT(*) as total
    FROM colleges c
    WHERE c.verification_status = 'VERIFIED'
  `;
  const params = [];

  if (search) {
    params.push(`%${search}%`);
    query += ` AND (c.name ILIKE $${params.length} OR c.location ILIKE $${params.length})`;
  }

  const result = await pool.query(query, params);
  return parseInt(result.rows[0]?.total || '0', 10);
};

export const verifyCollege = async (collegeId) => {
  // For MVP, this is a no-op since colleges are already verified
  // But we'll keep the function for compatibility
  const query = `
    UPDATE colleges
    SET verification_status = 'VERIFIED', updated_at = now()
    WHERE id = $1
    RETURNING *
  `;
  const result = await pool.query(query, [collegeId]);
  return result.rows[0] || null;
};

export const updateCollege = async (id, data) => {
  const fields = [];
  const values = [id];
  let idx = 2;

  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      fields.push(`${key} = $${idx}`);
      values.push(value);
      idx++;
    }
  }

  if (fields.length === 0) return findCollegeById(id);

  fields.push(`updated_at = now()`);

  const query = `
    UPDATE colleges
    SET ${fields.join(', ')}
    WHERE id = $1
    RETURNING *
  `;
  const result = await pool.query(query, values);
  return result.rows[0] || null;
};