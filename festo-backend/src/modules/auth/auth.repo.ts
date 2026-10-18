import { pool } from '../../db/pool.js';
import { User } from '../../types/index.js';

export interface UserRow extends User {
  password_hash: string;
}

/**
 * Find user by email (includes password_hash for authentication)
 */
export const findUserByEmail = async (email: string): Promise<UserRow | null> => {
  const query = `
    SELECT id, email, password_hash, name, role, college_id, status, created_at, updated_at
    FROM users
    WHERE LOWER(email) = LOWER($1)
  `;
  const result = await pool.query<UserRow>(query, [email]);
  return result.rows[0] || null;
};

/**
 * Find user by ID (excludes password_hash)
 */
export const findUserById = async (id: string): Promise<User | null> => {
  const query = `
    SELECT id, email, name, role, college_id, status, created_at, updated_at
    FROM users
    WHERE id = $1
  `;
  const result = await pool.query<User>(query, [id]);
  return result.rows[0] || null;
};

/**
 * Insert a new user
 */
export const createUser = async ({
  email,
  passwordHash,
  name,
  role = 'USER',
}: {
  email: string;
  passwordHash: string;
  name: string;
  role?: string;
}): Promise<User> => {
  const query = `
    INSERT INTO users (email, password_hash, name, role, status)
    VALUES (LOWER($1), $2, $3, $4, 'ACTIVE')
    RETURNING id, email, name, role, college_id, status, created_at, updated_at
  `;
  const result = await pool.query<User>(query, [email, passwordHash, name, role]);
  return result.rows[0];
};

export const replacePasswordResetToken = async ({
  userId,
  tokenHash,
  expiresAt,
}: {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
}): Promise<void> => {
  await pool.query('DELETE FROM password_reset_tokens WHERE user_id = $1', [userId]);
  await pool.query(
    `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
     VALUES ($1, $2, $3)`,
    [userId, tokenHash, expiresAt]
  );
};

export const deletePasswordResetTokensForUser = async (userId: string): Promise<void> => {
  await pool.query('DELETE FROM password_reset_tokens WHERE user_id = $1', [userId]);
};

export const consumePasswordResetToken = async ({
  tokenHash,
  passwordHash,
}: {
  tokenHash: string;
  passwordHash: string;
}): Promise<boolean> => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const tokenResult = await client.query<{ user_id: string }>(
      `UPDATE password_reset_tokens
       SET used_at = now()
       WHERE token_hash = $1 AND used_at IS NULL AND expires_at > now()
       RETURNING user_id`,
      [tokenHash]
    );
    const token = tokenResult.rows[0];
    if (!token) {
      await client.query('ROLLBACK');
      return false;
    }
    await client.query(
      'UPDATE users SET password_hash = $2, updated_at = now() WHERE id = $1',
      [token.user_id, passwordHash]
    );
    await client.query('COMMIT');
    return true;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};
