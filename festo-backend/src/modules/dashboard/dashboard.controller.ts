import * as dashboardService from './dashboard.service.js';
import type { NextFunction, Request, Response } from 'express';
import type { AuthUser } from '../../types/index.js';

const respond = (service: (user: AuthUser) => Promise<unknown>) => async (req: Request, res: Response, next: NextFunction) => {
  try {
    return res.json({ success: true, data: await service(req.user!) });
  } catch (error) {
    return next(error);
  }
};

export const student = respond(dashboardService.getStudentDashboard);
export const college = respond(dashboardService.getCollegeDashboard);
export const organizer = respond(dashboardService.getOrganizerDashboard);
// Removed admin endpoint as it's not needed for MVP
