import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { validateBody } from '../../middleware/validate.js';
import { uploadMediaSchema } from './media.schema.js';
import * as controller from './media.controller.js';

const router = Router();
router.post('/upload', authenticate, authorize(['USER', 'ORGANIZER']), validateBody(uploadMediaSchema), controller.upload);
export default router;