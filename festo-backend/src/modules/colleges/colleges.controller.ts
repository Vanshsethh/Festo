import { Request, Response, NextFunction } from 'express';
import * as collegesService from './colleges.service.js';

export const apply = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const college = await collegesService.applyCollege(req.user!, req.body);
    res.status(201).json({
      success: true,
      data: {
        college,
        message: 'College applied successfully! You are now an organizer for this college.',
      },
    });
  } catch (error) {
    next(error);
  }
};

export const listVerified = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await collegesService.getVerifiedColleges(req.query as any);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getOne = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const college = await collegesService.getCollege(req.params.identifier as string, req.user || null);
    res.status(200).json({
      success: true,
      data: {
        college,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const myApplication = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const application = await collegesService.getMyApplication(req.user!.id);
    res.status(200).json({
      success: true,
      data: {
        application,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const college = await collegesService.updateCollege(req.user!, req.params.id as string, req.body);
    res.status(200).json({
      success: true,
      data: {
        college,
      },
    });
  } catch (error) {
    next(error);
  }
};
