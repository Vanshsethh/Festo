import * as checkinsService from './checkins.service.js';
import type { NextFunction, Request, Response } from 'express';

export const scan = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await checkinsService.scanPass(req.user!, req.body.qr_token);
    return res.json({ success: true, data: result });
  } catch (error) {
    return next(error);
  }
};
