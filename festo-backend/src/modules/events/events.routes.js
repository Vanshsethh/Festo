import { Router } from 'express';
import * as controller from './events.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { validateBody, validateQuery } from '../../middleware/validate.js';
import { createEventSchema, eventsQuerySchema, updateEventSchema } from './events.schema.js';
import * as registrationsController from '../registrations/registrations.controller.js';

const router = Router();
router.get('/', validateQuery(eventsQuerySchema), controller.list);
router.get('/mine', authenticate, authorize(['USER', 'ORGANIZER']), controller.mine);
router.post('/', authenticate, authorize(['USER', 'ORGANIZER']), validateBody(createEventSchema), controller.create);
router.patch('/:id', authenticate, authorize(['USER', 'ORGANIZER']), validateBody(updateEventSchema), controller.update);
router.post('/:id/cancel', authenticate, authorize(['USER', 'ORGANIZER']), controller.cancel);
router.delete('/:id', authenticate, authorize(['USER', 'ORGANIZER', 'ADMIN']), controller.remove);
// Removed submit, approve, reject endpoints as they're not needed for MVP
router.post('/:eventId/register', authenticate, authorize(['USER']), registrationsController.create);
router.get('/:slug', controller.getOne);
export default router;