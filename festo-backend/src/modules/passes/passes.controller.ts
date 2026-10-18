import * as ticketsService from './passes.service.js';

export const listMyTickets = async (req, res, next) => {
  try {
    const tickets = await ticketsService.listMyTickets(req.user);
    return res.json({ success: true, data: { tickets } });
  } catch (error) {
    return next(error);
  }
};

export const getMyTicket = async (req, res, next) => {
  try {
    const ticket = await ticketsService.getMyTicket(req.user, req.params.id);
    return res.json({ success: true, data: { ticket } });
  } catch (error) {
    return next(error);
  }
};