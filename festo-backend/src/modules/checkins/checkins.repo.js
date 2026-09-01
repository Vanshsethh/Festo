export const findPassForScan = async (client, qrToken) => {
  const result = await client.query(
    `SELECT t.id AS pass_id, t.ticket_code,
            r.id AS registration_id, r.status AS registration_status,
            e.id AS event_id, e.title AS event_title, e.college_id, e.created_by,
            u.id AS attendee_id, u.name AS attendee_name,
            ci.id AS check_in_id, ci.checked_in_at
     FROM tickets t
     JOIN registrations r ON r.id = t.registration_id
     JOIN events e ON e.id = r.event_id
     JOIN users u ON u.id = r.user_id
     LEFT JOIN check_ins ci ON ci.pass_id = t.id
     WHERE t.qr_token = $1
     FOR UPDATE OF r`,
    [qrToken]
  );
  return result.rows[0] || null;
};

export const createCheckIn = async (client, passId, checkedInBy) => {
  const result = await client.query(
    `INSERT INTO check_ins (pass_id, checked_in_by)
     VALUES ($1, $2)
     ON CONFLICT (pass_id) DO NOTHING
     RETURNING id, checked_in_at`,
    [passId, checkedInBy]
  );
  return result.rows[0] || null;
};

export const markRegistrationAttended = (client, registrationId) =>
  client.query(`UPDATE registrations SET status = 'ATTENDED' WHERE id = $1`, [registrationId]);