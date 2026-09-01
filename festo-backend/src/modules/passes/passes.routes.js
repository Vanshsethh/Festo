import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import * as controller from './passes.controller.js';

const router = Router();

router.use(authenticate, authorize(['USER', 'ORGANIZER']));
router.get('/', controller.listMyTickets);
router.get('/:id', controller.getMyTicket);

export default router;