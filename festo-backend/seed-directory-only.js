import { Pool } from 'pg';
import 'dotenv/config';
import { seedCollegeDirectory } from './seed-directory.js';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required');
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

seedCollegeDirectory(pool)
  .then(() => console.log('Seeded the verified college directory.'))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
