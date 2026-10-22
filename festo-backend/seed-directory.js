import argon2 from 'argon2';
import { randomBytes } from 'node:crypto';
import { readFile } from 'node:fs/promises';

const directoryOwner = {
  email: 'college-directory@festo.local',
  name: 'Festo College Directory',
};

export async function seedCollegeDirectory(pool) {
  const passwordHash = await argon2.hash(randomBytes(32).toString('hex'));
  await pool.query(
    `INSERT INTO users (email, password_hash, name, role, status)
     VALUES ($1, $2, $3, 'ORGANIZER', 'ACTIVE')
     ON CONFLICT (email) DO UPDATE
     SET password_hash = EXCLUDED.password_hash,
         name = EXCLUDED.name,
         role = 'ORGANIZER',
         status = 'ACTIVE'`,
    [directoryOwner.email, passwordHash, directoryOwner.name],
  );

  const directorySql = await readFile(new URL('./seed-colleges.sql', import.meta.url), 'utf8');
  await pool.query(directorySql);
}
