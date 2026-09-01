import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { validateBody } from '../../middleware/validate.js';
import { scanPassSchema } from './checkins.schema.js';
import * as controller from './checkins.controller.js';

const router = Router();

router.post('/scan', authenticate, authorize(['ORGANIZER']), validateBody(scanPassSchema), controller.scan);

export default router;