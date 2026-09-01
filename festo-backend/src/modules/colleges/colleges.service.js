import * as collegesRepo from './colleges.repo.js';
import { slugify } from '../../utils/slug.js';
import { hasOwnership } from '../../middleware/authorize.js';
import { pool } from '../../db/pool.js';

export const applyCollege = async (user, data) => {
  // Check if user is already a college organizer or has a college
  if (user.role === 'ORGANIZER' || user.college_id) {
    const error = new Error('You are already associated with a college.');
    error.statusCode = 400;
    throw error;
  }

  // Check if user has an existing pending application
  const existingApp = await collegesRepo.findApplicationByUser(user.id);
  if (existingApp && existingApp.verification_status === 'PENDING') {
    const error = new Error('You already have a pending college onboarding application.');
    error.statusCode = 409;
    throw error;
  }

  // Generate unique slug
  let baseSlug = slugify(data.name);
  if (!baseSlug) baseSlug = 'college';
  let slug = baseSlug;
  let counter = 1;

  while (await collegesRepo.findCollegeBySlug(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  const college = await collegesRepo.createPendingCollege({
    ...data,
    slug,
    applied_by: user.id,
  });

  // For MVP, automatically verify the college and set the user as organizer
  await collegesRepo.verifyCollege(college.id);
  await updateUserRoleAndCollege(user.id, 'ORGANIZER', college.id);

  return college;
};

export const getVerifiedColleges = async ({ search, page = 1, limit = 20 }) => {
  const offset = (page - 1) * limit;
  const [colleges, total] = await Promise.all([
    collegesRepo.findVerifiedColleges({ search, limit, offset }),
    collegesRepo.countVerifiedColleges({ search }),
  ]);

  return {
    colleges,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};

export const getCollege = async (identifier, currentUser = null) => {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);
  const college = isUuid
    ? await collegesRepo.findCollegeById(identifier)
    : await collegesRepo.findCollegeBySlug(identifier);

  if (!college) {
    const error = new Error('College not found.');
    error.statusCode = 404;
    throw error;
  }

  // For MVP, all colleges are verified, so no restrictions needed
  // But we'll still check ownership for safety
  if (currentUser && !hasOwnership(currentUser, college.applied_by)) {
    const error = new Error('College not found.');
    error.statusCode = 404;
    throw error;
  }

  return college;
};

export const getMyApplication = async (userId) => {
  const application = await collegesRepo.findApplicationByUser(userId);
  return application;
};

export const updateCollege = async (user, collegeId, data) => {
  if (!hasOwnership(user, collegeId)) {
    const error = new Error('You are not authorized to update this college profile.');
    error.statusCode = 403;
    throw error;
  }

  const updated = await collegesRepo.updateCollege(collegeId, data);
  return updated;
};

// Helper function to update user role and college_id
async function updateUserRoleAndCollege(userId, role, collegeId) {
  // This would typically be done through the users service/repo
  // For simplicity in this MVP, we'll update directly
  // In a real implementation, this should go through the proper user service
  await pool.query(
    'UPDATE users SET role = $1, college_id = $2, updated_at = now() WHERE id = $3',
    [role, collegeId, userId]
  );
}