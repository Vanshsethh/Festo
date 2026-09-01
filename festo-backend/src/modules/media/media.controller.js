import * as mediaService from './media.service.js';

export const upload = async (req, res, next) => {
  try { return res.status(201).json({ success: true, data: { media: await mediaService.uploadMedia(req.user, req.body) } }); } catch (error) { return next(error); }
};
