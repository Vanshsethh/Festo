import { pool } from '../../db/pool.js';

export interface CollegeMember {
  id: string;
  college_id: string;
  user_id: string;
  role: string;
  created_at: Date | string;
  name?: string;
  email?: string;
  status?: string;
  college_owner_id?: string;
}

export const listMembersByCollege = async (collegeId: string): Promise<CollegeMember[]> => {
  const query = `
    SELECT cm.id, cm.college_id, cm.user_id, cm.role, cm.created_at,
           u.name, u.email, u.status
    FROM college_members cm
    JOIN users u ON cm.user_id = u.id
    WHERE cm.college_id = $1
    ORDER BY cm.created_at ASC
  `;
  const result = await pool.query<CollegeMember>(query, [collegeId]);
  return result.rows;
};

export const findMemberById = async (memberId: string): Promise<CollegeMember | null> => {
  const query = `
    SELECT cm.*, u.email, u.name, c.applied_by as college_owner_id
    FROM college_members cm
    JOIN users u ON cm.user_id = u.id
    JOIN colleges c ON cm.college_id = c.id
    WHERE cm.id = $1
  `;
  const result = await pool.query<CollegeMember>(query, [memberId]);
  return result.rows[0] || null;
};
