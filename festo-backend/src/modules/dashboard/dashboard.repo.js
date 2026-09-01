import { pool } from '../../db/pool.js';

export const getStudentOverview = async (userId) => {
  const [metricsResult, upcomingResult] = await Promise.all([
    pool.query(
      `SELECT COUNT(*)::int AS total_registrations,
              COUNT(*) FILTER (WHERE status = 'CONFIRMED')::int AS confirmed_registrations,
              COUNT(*) FILTER (WHERE status = 'ATTENDED')::int AS attended_registrations,
              COUNT(*) FILTER (WHERE status = 'CANCELLED')::int AS cancelled_registrations,
              (SELECT COUNT(*)::int FROM registrations r JOIN events e ON e.id = r.event_id WHERE r.user_id = $1 AND r.status = 'CONFIRMED' AND e.start_date > now()) AS upcoming_registrations
       FROM registrations WHERE user_id = $1`,
      [userId]
    ),
    pool.query(
      `SELECT r.id AS registration_id, r.status AS registration_status,
              p.id AS pass_id, e.id AS event_id, e.title, e.slug, e.category, e.venue, e.start_date,
              c.name AS college_name
       FROM registrations r
       JOIN events e ON e.id = r.event_id
       JOIN colleges c ON c.id = e.college_id
       LEFT JOIN passes p ON p.registration_id = r.id
       WHERE r.user_id = $1 AND r.status = 'CONFIRMED' AND e.start_date > now()
       ORDER BY e.start_date ASC LIMIT 5`,
      [userId]
    ),
  ]);
  return { metrics: metricsResult.rows[0], upcoming_events: upcomingResult.rows };
};

export const getCollegeOverview = async (collegeId) => {
  const [metricsResult, upcomingResult, checkinsResult] = await Promise.all([
    pool.query(
      `SELECT
         (SELECT COUNT(*)::int FROM events WHERE college_id = $1) AS total_events,
         (SELECT COUNT(*)::int FROM events WHERE college_id = $1 AND status = 'PUBLISHED') AS published_events,
         (SELECT COALESCE(SUM(registered_count), 0)::int FROM events WHERE college_id = $1) AS registrations,
         (SELECT COUNT(*)::int FROM check_ins ci JOIN passes p ON p.id = ci.pass_id JOIN registrations r ON r.id = p.registration_id JOIN events e ON e.id = r.event_id WHERE e.college_id = $1) AS check_ins`,
      [collegeId]
    ),
    pool.query(
      `SELECT id, title, slug, category, start_date, venue, capacity, registered_count, status
       FROM events
       WHERE college_id = $1 AND start_date > now() AND status NOT IN ('CANCELLED')
       ORDER BY start_date ASC LIMIT 5`,
      [collegeId]
    ),
    pool.query(
      `SELECT ci.checked_in_at, e.id AS event_id, e.title AS event_title, u.name AS attendee_name,
              scanner.name AS checked_in_by_name
       FROM check_ins ci
       JOIN passes p ON p.id = ci.pass_id
       JOIN registrations r ON r.id = p.registration_id
       JOIN events e ON e.id = r.event_id
       JOIN users u ON u.id = r.user_id
       JOIN users scanner ON scanner.id = ci.checked_in_by
       WHERE e.college_id = $1
       ORDER BY ci.checked_in_at DESC LIMIT 8`,
      [collegeId]
    ),
  ]);
  return { metrics: metricsResult.rows[0], upcoming_events: upcomingResult.rows, recent_check_ins: checkinsResult.rows };
};

export const getOrganizerOverview = async (userId) => {
  // Get overview for organizers (replaces admin overview for MVP)
  const [metricsResult, collegesResult, eventsResult] = await Promise.all([
    pool.query(
      `SELECT
         (SELECT COUNT(*)::int FROM users) AS total_users,
         (SELECT COUNT(*)::int FROM users WHERE role = 'ORGANIZER') AS organizers,
         (SELECT COUNT(*)::int FROM colleges) AS total_colleges,
         (SELECT COUNT(*)::int FROM events) AS total_events,
         (SELECT COUNT(*)::int FROM registrations WHERE status IN ('CONFIRMED', 'ATTENDED')) AS registrations,
         (SELECT COUNT(*)::int FROM check_ins) AS check_ins`
    ),
    pool.query(
      `SELECT id, name, slug, location, created_at
       FROM colleges
       ORDER BY created_at ASC LIMIT 5`
    ),
    pool.query(
      `SELECT e.id, e.title, e.slug, e.category, e.start_date, c.name AS college_name
       FROM events e JOIN colleges c ON c.id = e.college_id
       ORDER BY e.created_at ASC LIMIT 5`
    ),
  ]);
  return { metrics: metricsResult.rows[0], recent_colleges: collegesResult.rows, recent_events: eventsResult.rows };
};