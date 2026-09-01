import { Pool } from 'pg';
import argon2 from 'argon2';
import { env } from './src/config/env.js';

const pool = new Pool({ connectionString: env.DATABASE_URL });
const categories = ['FEST', 'CULTURAL', 'DANCE', 'MUSIC', 'TECHNICAL', 'SPORTS', 'HACKATHON', 'WORKSHOP', 'CONCERT', 'COMPETITION', 'QUIZ', 'MUN', 'GAMING', 'LITERARY', 'DRAMA_THEATRE', 'ART_DESIGN', 'OTHER'];
const names = {
  FEST: 'Campus Carnival', CULTURAL: 'Culture Connect', DANCE: 'Rhythm Revolution', MUSIC: 'Indie Soundwave', TECHNICAL: 'Future Tech Forum', SPORTS: 'Champions League', HACKATHON: 'Code for Tomorrow', WORKSHOP: 'Build Lab', CONCERT: 'Neon Nights', COMPETITION: 'The Grand Challenge', QUIZ: 'Mind Sprint', MUN: 'Diplomacy Summit', GAMING: 'Arena Clash', LITERARY: 'Ink & Ideas', DRAMA_THEATRE: 'Spotlight Stories', ART_DESIGN: 'Canvas Collective', OTHER: 'Campus Connect',
};
const colleges = [
  { name: 'Guru Gobind Singh Indraprastha University', slug: 'ggsipu', location: 'Dwarka, New Delhi', owner: 'ggsipu.organizer@festo.local', short: 'GGSIPU' },
  { name: 'Delhi Technological University', slug: 'dtu', location: 'Rohini, New Delhi', owner: 'dtu.organizer@festo.local', short: 'DTU' },
];

async function upsertUser(email, name) {
  const passwordHash = await argon2.hash('password123');
  const result = await pool.query(
    `INSERT INTO users (email, password_hash, name, role, status) VALUES ($1, $2, $3, 'ORGANIZER', 'ACTIVE')
     ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, role = 'ORGANIZER' RETURNING id`,
    [email, passwordHash, name],
  );
  return result.rows[0].id;
}

async function seed() {
  for (const college of colleges) {
    const ownerId = await upsertUser(college.owner, `${college.short} Events Team`);
    const result = await pool.query(
      `INSERT INTO colleges (name, slug, description, location, applied_by, verification_status)
       VALUES ($1, $2, $3, $4, $5, 'VERIFIED')
       ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, location = EXCLUDED.location, verification_status = 'VERIFIED'
       RETURNING id`,
      [college.name, college.slug, `Official events hosted by ${college.name}.`, college.location, ownerId],
    );
    college.id = result.rows[0].id;
    college.ownerId = ownerId;
  }

  const now = new Date();
  for (const [collegeIndex, college] of colleges.entries()) {
    for (const [categoryIndex, category] of categories.entries()) {
      const start = new Date(now.getTime() + (categoryIndex * 2 + collegeIndex + 7) * 86400000);
      const end = new Date(start.getTime() + 4 * 3600000);
      const deadline = new Date(start.getTime() - 86400000);
      const slug = `${college.slug}-${category.toLowerCase().replace('_', '-')}-2026`;
      const capacity = 80 + ((categoryIndex * 15 + collegeIndex * 25) % 220);
      await pool.query(
        `INSERT INTO events (college_id, title, slug, description, category, venue, address, start_date, end_date, registration_deadline, capacity, status, created_by)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'PUBLISHED',$12)
         ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description, category = EXCLUDED.category, venue = EXCLUDED.venue, address = EXCLUDED.address, start_date = EXCLUDED.start_date, end_date = EXCLUDED.end_date, registration_deadline = EXCLUDED.registration_deadline, capacity = EXCLUDED.capacity, status = 'PUBLISHED'`,
        [college.id, `${college.short} ${names[category]} 2026`, slug, `Join ${college.short} for ${names[category]}, a live ${category.toLowerCase().replace('_', ' ')} experience for students.`, category, `${college.short} Campus Venue ${categoryIndex + 1}`, college.location, start.toISOString(), end.toISOString(), deadline.toISOString(), capacity, college.ownerId],
      );
    }
  }
  console.log(`Seeded ${colleges.length} colleges and ${colleges.length * categories.length} live events.`);
}

seed().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => pool.end());
