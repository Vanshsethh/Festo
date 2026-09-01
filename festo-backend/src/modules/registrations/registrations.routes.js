import { Router } from 'express';
import * as controller from './registrations.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';

const router = Router();
router.use(authenticate, authorize(['USER']));
router.get('/', controller.listMine);
router.delete('/:id', controller.cancel);
export default router;