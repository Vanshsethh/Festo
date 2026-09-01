import { pool } from '../../db/pool.js';

/**
 * Find user by email (includes password_hash for authentication)
 * @param {string} email
 */
export const findUserByEmail = async (email) => {
  const query = `
    SELECT id, email, password_hash, name, role, college_id, status, created_at, updated_at
    FROM users
    WHERE LOWER(email) = LOWER($1)
  `;
  const result = await pool.query(query, [email]);
  return result.rows[0] || null;
};

/**
 * Find user by ID (excludes password_hash)
 * @param {string} id
 */
export const findUserById = async (id) => {
  const query = `
    SELECT id, email, name, role, college_id, status, created_at, updated_at
    FROM users
    WHERE id = $1
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
};

/**
 * Insert a new user
 * @param {object} params
 * @param {string} params.email
 * @param {string} params.passwordHash
 * @param {string} params.name
 * @param {string} [params.role='USER']
 */
export const createUser = async ({ email, passwordHash, name, role = 'USER' }) => {
  const query = `
    INSERT INTO users (email, password_hash, name, role, status)
    VALUES (LOWER($1), $2, $3, $4, 'ACTIVE')
    RETURNING id, email, name, role, college_id, status, created_at, updated_at
  `;
  const result = await pool.query(query, [email, passwordHash, name, role]);
  return result.rows[0];
};