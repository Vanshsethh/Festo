import { pool } from '../../db/pool.js';

export const listMembersByCollege = async (collegeId) => {
  const query = `
    SELECT cm.id, cm.college_id, cm.user_id, cm.role, cm.created_at,
           u.name, u.email, u.status
    FROM college_members cm
    JOIN users u ON cm.user_id = u.id
    WHERE cm.college_id = $1
    ORDER BY cm.created_at ASC
  `;
  const result = await pool.query(query, [collegeId]);
  return result.rows;
};

export const findMemberById = async (memberId) => {
  const query = `
    SELECT cm.*, u.email, u.name, c.applied_by as college_owner_id
    FROM college_members cm
    JOIN users u ON cm.user_id = u.id
    JOIN colleges c ON cm.college_id = c.id
    WHERE cm.id = $1
  `;
  const result = await pool.query(query, [memberId]);
  return result.rows[0] || null;
};
