import * as eventsService from './events.service.js';
const handle = (fn) => async (req, res, next) => { try { await fn(req, res); } catch (error) { next(error); } };
export const list = handle(async (req, res) => res.json({ success: true, data: await eventsService.listPublicEvents(req.query) }));
export const getOne = handle(async (req, res) => res.json({ success: true, data: { event: await eventsService.getPublicEvent(req.params.slug) } }));
export const mine = handle(async (req, res) => res.json({ success: true, data: { events: await eventsService.listMyEvents(req.user) } }));
export const create = handle(async (req, res) => res.status(201).json({ success: true, data: { event: await eventsService.createEvent(req.user, req.body) } }));
export const update = handle(async (req, res) => res.json({ success: true, data: { event: await eventsService.updateEvent(req.user, req.params.id, req.body) } }));
export const cancel = handle(async (req, res) => res.json({ success: true, data: { event: await eventsService.cancelEvent(req.user, req.params.id) } }));
export const remove = handle(async (req, res) => res.json({ success: true, data: await eventsService.deleteEvent(req.user, req.params.id) }));
// Removed submit, pending, approve, reject functions as they're not needed for MVP
// Events are published immediately upon creation
export default {};