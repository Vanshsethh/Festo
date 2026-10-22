import { Pool } from 'pg';
import { env } from './src/config/env.js';
import { seedCollegeDirectory } from './seed-directory.js';

const pool = new Pool({ connectionString: env.DATABASE_URL });

seedCollegeDirectory(pool)
  .then(() => console.log('Seeded the verified college directory.'))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
