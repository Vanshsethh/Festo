import * as mediaService from './media.service.js';
import type { NextFunction, Request, Response } from 'express';

export const upload = async (req: Request, res: Response, next: NextFunction) => {
  try { return res.status(201).json({ success: true, data: { media: await mediaService.uploadMedia(req.user!, req.body) } }); } catch (error) { return next(error); }
};
