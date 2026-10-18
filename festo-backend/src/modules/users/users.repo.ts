import { pool } from '../../db/pool.js';

export const updateUserProfile = async (id, { name }) => {
  const query = `
    UPDATE users
    SET name = $2, updated_at = now()
    WHERE id = $1
    RETURNING id, email, name, role, college_id, status, created_at, updated_at
  `;
  const result = await pool.query(query, [id, name]);
  return result.rows[0] || null;
};

export const updateUserPassword = async (id, passwordHash) => {
  const query = `
    UPDATE users
    SET password_hash = $2, updated_at = now()
    WHERE id = $1
  `;
  await pool.query(query, [id, passwordHash]);
};

export const getUserWithPasswordById = async (id) => {
  const query = `
    SELECT id, email, password_hash, name, role, college_id, status, created_at, updated_at
    FROM users
    WHERE id = $1
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
};
