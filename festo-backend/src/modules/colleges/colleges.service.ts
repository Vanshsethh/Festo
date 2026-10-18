import * as collegesRepo from './colleges.repo.js';
import { slugify } from '../../utils/slug.js';
import { hasOwnership } from '../../middleware/authorize.js';
import { pool } from '../../db/pool.js';
import { AuthUser, College } from '../../types/index.js';
import { ApplyCollegeInput, CollegeQueryInput, UpdateCollegeInput } from './colleges.schema.js';

export const applyCollege = async (user: AuthUser, data: ApplyCollegeInput): Promise<College> => {
  // Check if user is already a college organizer or has a college
  if (user.role === 'ORGANIZER' || user.college_id) {
    const error: any = new Error('You are already associated with a college.');
    error.statusCode = 400;
    throw error;
  }

  // Check if user has an existing pending application
  const existingApp = await collegesRepo.findApplicationByUser(user.id);
  if (existingApp && existingApp.verification_status === 'PENDING') {
    const error: any = new Error('You already have a pending college onboarding application.');
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

export const getVerifiedColleges = async ({
  search,
  page = 1,
  limit = 20,
}: CollegeQueryInput): Promise<{
  colleges: College[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}> => {
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

export const getCollege = async (
  identifier: string,
  currentUser: AuthUser | null = null
): Promise<College> => {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);
  const college = isUuid
    ? await collegesRepo.findCollegeById(identifier)
    : await collegesRepo.findCollegeBySlug(identifier);

  if (!college) {
    const error: any = new Error('College not found.');
    error.statusCode = 404;
    throw error;
  }

  // Verified college profiles are public. Restrict only profiles that have not
  // been verified yet, so authenticated students can still open search results.
  if (
    college.verification_status !== 'VERIFIED' &&
    (!currentUser || !hasOwnership(currentUser, college.applied_by))
  ) {
    const error: any = new Error('College not found.');
    error.statusCode = 404;
    throw error;
  }

  return college;
};

export const getMyApplication = async (userId: string): Promise<College | null> => {
  const application = await collegesRepo.findApplicationByUser(userId);
  return application;
};

export const updateCollege = async (
  user: AuthUser,
  collegeId: string,
  data: UpdateCollegeInput
): Promise<College | null> => {
  if (!hasOwnership(user, collegeId)) {
    const error: any = new Error('You are not authorized to update this college profile.');
    error.statusCode = 403;
    throw error;
  }

  const updated = await collegesRepo.updateCollege(collegeId, data as Record<string, unknown>);
  return updated;
};

// Helper function to update user role and college_id
async function updateUserRoleAndCollege(
  userId: string,
  role: string,
  collegeId: string
): Promise<void> {
  await pool.query(
    'UPDATE users SET role = $1, college_id = $2, updated_at = now() WHERE id = $3',
    [role, collegeId, userId]
  );
}
