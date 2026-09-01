import * as dashboardService from './dashboard.service.js';

const respond = (service) => async (req, res, next) => {
  try {
    return res.json({ success: true, data: await service(req.user) });
  } catch (error) {
    return next(error);
  }
};

export const student = respond(dashboardService.getStudentDashboard);
export const college = respond(dashboardService.getCollegeDashboard);
export const organizer = respond(dashboardService.getOrganizerDashboard);
// Removed admin endpoint as it's not needed for MVP