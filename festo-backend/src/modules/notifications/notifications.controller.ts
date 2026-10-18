import * as notificationsRepo from './notifications.repo.js';

export const listMine = async (req, res, next) => {
  try {
    const notifications = await notificationsRepo.listForUser(req.user.id);
    return res.json({ success: true, data: { notifications } });
  } catch (error) {
    next(error);
  }
};
