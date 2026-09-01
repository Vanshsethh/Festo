import * as checkinsService from './checkins.service.js';

export const scan = async (req, res, next) => {
  try {
    const result = await checkinsService.scanPass(req.user, req.body.qr_token);
    return res.json({ success: true, data: result });
  } catch (error) {
    return next(error);
  }
};
