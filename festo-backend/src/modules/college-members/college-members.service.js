import * as membersRepo from './college-members.repo.js';
import { findUserByEmail } from '../auth/auth.repo.js';
import { withTransaction } from '../../db/transaction.js';
import { hasOwnership } from '../../middleware/authorize.js';

export const listMembers = async (user, collegeId) => {
  // Check if user has ownership of the college (they applied for it)
  if (!hasOwnership(user, collegeId)) {
    const error = new Error('You do not have access to view members for this college.');
    error.statusCode = 403;
    throw error;
  }

  const members = await membersRepo.listMembersByCollege(collegeId);
  return members;
};

export const addOrganizer = async (user, collegeId, { email, role = 'ORGANIZER' }) => {
  // Only the college owner (organizer who applied) can add organizers
  if (!hasOwnership(user, collegeId)) {
    const error = new Error('Only the college organizer can add organizers.');
    error.statusCode = 403;
    throw error;
  }

  const targetUser = await findUserByEmail(email);
  if (!targetUser) {
    const error = new Error(`User with email "${email}" not found. Please ensure they have registered a Festo account first.`);
    error.statusCode = 404;
    throw error;
  }

  if (targetUser.college_id && targetUser.college_id !== collegeId) {
    const error = new Error('This user is already a member of another college.');
    error.statusCode = 400;
    throw error;
  }

  return await withTransaction(async (client) => {
    // Check if already a member of this college
    const checkRes = await client.query(
      'SELECT id FROM college_members WHERE college_id = $1 AND user_id = $2',
      [collegeId, targetUser.id]
    );

    if (checkRes.rows.length > 0) {
      const error = new Error('This user is already a member of this college.');
      error.statusCode = 409;
      throw error;
    }

    // Insert into college_members
    const insertRes = await client.query(
      `INSERT INTO college_members (college_id, user_id, role)
       VALUES ($1, $2, $3)
       RETURNING id, college_id, user_id, role, created_at`,
      [collegeId, targetUser.id, role]
    );

    // Update users table with college_id and role
    await client.query(
      `UPDATE users
       SET college_id = $1, role = $2, updated_at = now()
       WHERE id = $3`,
      [collegeId, role, targetUser.id]
    );

    return {
      ...insertRes.rows[0],
      name: targetUser.name,
      email: targetUser.email,
    };
  });
};

export const removeOrganizer = async (user, collegeId, memberId) => {
  // Only the college owner can remove organizers
  if (!hasOwnership(user, collegeId)) {
    const error = new Error('Only the college organizer can remove organizers.');
    error.statusCode = 403;
    throw error;
  }

  const member = await membersRepo.findMemberById(memberId);
  if (!member || member.college_id !== collegeId) {
    const error = new Error('Member not found in this college.');
    error.statusCode = 404;
    throw error;
  }

  // Prevent removing the primary owner (the one who applied for the college)
  const college = await membersRepo.findCollegeById(collegeId);
  if (member.user_id === college.applied_by) {
    const error = new Error('Cannot remove the primary organizer who created the college.');
    error.statusCode = 400;
    throw error;
  }

  return await withTransaction(async (client) => {
    // Delete from college_members
    await client.query('DELETE FROM college_members WHERE id = $1', [memberId]);

    // Revert user role to USER and clear college_id
    await client.query(
      `UPDATE users
       SET college_id = NULL, role = 'USER', updated_at = now()
       WHERE id = $1`,
      [member.user_id]
    );

    return { message: 'Organizer removed successfully.' };
  });
};