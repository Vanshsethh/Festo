import * as registrationsService from './registrations.service.js';

export const create = async (req, res, next) => {
  try {
    const quantity = req.body?.quantity ? Number(req.body.quantity) : 1;
    const registration = await registrationsService.registerForEvent(req.user, req.params.eventId, quantity);
    return res.status(201).json({ success: true, data: { registration } });
  } catch (error) {
    next(error);
  }
};
export const listMine = async (req, res, next) => {
  try { const registrations = await registrationsService.getMyRegistrations(req.user); return res.json({ success: true, data: { registrations } }); } catch (error) { next(error); }
};
export const cancel = async (req, res, next) => {
  try { const registration = await registrationsService.cancelRegistration(req.user, req.params.id); return res.json({ success: true, data: { registration } }); } catch (error) { next(error); }
};
