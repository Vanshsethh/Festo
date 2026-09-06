import { pool } from '../../db/pool.js';

export const getStudentOverview = async (userId) => {
  const [metricsResult, hostedResult, participatedResult] = await Promise.all([
    pool.query(
      `SELECT
         (SELECT COUNT(*)::int FROM events WHERE created_by = $1) AS total_hosted_events,
         (SELECT COALESCE(SUM(registered_count), 0)::int FROM events WHERE created_by = $1) AS total_attendees_hosted,
         (SELECT COUNT(*)::int FROM registrations WHERE user_id = $1) AS total_registrations,
         (SELECT COUNT(*) FILTER (WHERE status = 'CONFIRMED')::int FROM registrations WHERE user_id = $1) AS confirmed_registrations,
         (SELECT COUNT(*) FILTER (WHERE status = 'ATTENDED')::int FROM registrations WHERE user_id = $1) AS attended_registrations,
         (SELECT COUNT(*) FILTER (WHERE status = 'CANCELLED')::int FROM registrations WHERE user_id = $1) AS cancelled_registrations,
         (SELECT COUNT(*)::int FROM registrations r JOIN events e ON e.id = r.event_id WHERE r.user_id = $1 AND r.status = 'CONFIRMED' AND e.start_date > now()) AS upcoming_registrations,
         (SELECT COUNT(*)::int FROM tickets t JOIN registrations r ON r.id = t.registration_id WHERE r.user_id = $1 AND r.status = 'CONFIRMED') AS total_passes
      `,
      [userId]
    ),
    pool.query(
      `SELECT e.id, e.title, e.slug, e.category, e.poster_url, e.venue,
              e.start_date, e.end_date, e.capacity, e.registered_count, e.status,
              e.created_at,
              c.name AS college_name, c.slug AS college_slug
       FROM events e
       JOIN colleges c ON c.id = e.college_id
       WHERE e.created_by = $1
       ORDER BY e.created_at DESC`,
      [userId]
    ),
    pool.query(
      `SELECT r.id AS registration_id, r.quantity, r.status AS registration_status, r.registered_at,
              e.id AS event_id, e.title, e.slug, e.category, e.poster_url, e.venue,
              e.start_date, e.end_date, e.status AS event_status,
              c.name AS college_name, c.slug AS college_slug,
              COUNT(t.id)::int AS ticket_count
       FROM registrations r
       JOIN events e ON e.id = r.event_id
       JOIN colleges c ON c.id = e.college_id
       LEFT JOIN tickets t ON t.registration_id = r.id
       WHERE r.user_id = $1 AND r.status = 'CONFIRMED'
       GROUP BY r.id, r.quantity, r.status, r.registered_at,
                e.id, e.title, e.slug, e.category, e.poster_url, e.venue,
                e.start_date, e.end_date, e.status, c.name, c.slug
       ORDER BY e.start_date ASC`,
      [userId]
    ),
  ]);

  return {
    metrics: metricsResult.rows[0] || {},
    hosted_events: hostedResult.rows,
    participated_events: participatedResult.rows,
    upcoming_events: participatedResult.rows,
    upcoming_tickets: participatedResult.rows,
  };
};

export const getCollegeOverview = async (collegeId) => {
  const [metricsResult, upcomingResult, checkinsResult] = await Promise.all([
    pool.query(
      `SELECT
         (SELECT COUNT(*)::int FROM events WHERE college_id = $1) AS total_events,
         (SELECT COUNT(*)::int FROM events WHERE college_id = $1 AND status = 'PUBLISHED') AS published_events,
         (SELECT COALESCE(SUM(registered_count), 0)::int FROM events WHERE college_id = $1) AS registrations,
         (SELECT COUNT(*)::int FROM check_ins ci JOIN tickets p ON p.id = ci.pass_id JOIN registrations r ON r.id = p.registration_id JOIN events e ON e.id = r.event_id WHERE e.college_id = $1) AS check_ins`,
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
       JOIN tickets p ON p.id = ci.pass_id
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