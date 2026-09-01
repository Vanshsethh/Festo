import { AppError } from '../../middleware/errorHandler.js';
import * as dashboardRepo from './dashboard.repo.js';
import { hasOwnership } from '../../middleware/authorize.js';

export const getStudentDashboard = (user) => dashboardRepo.getStudentOverview(user.id);

export const getCollegeDashboard = (user) => {
  if (!user.college_id) throw new AppError('You are not associated with a college.', 403);
  return dashboardRepo.getCollegeOverview(user.college_id);
};

// Replaced admin dashboard with organizer dashboard
export const getOrganizerDashboard = (user) => {
  // For MVP, organizers can see overview of the whole platform
  // In the future, we might restrict this to their own college events
  return dashboardRepo.getOrganizerOverview(user.id);
};