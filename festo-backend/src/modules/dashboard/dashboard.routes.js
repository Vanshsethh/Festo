import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import * as controller from './dashboard.controller.js';

const router = Router();

router.get('/student', authenticate, authorize(['USER']), controller.student);
router.get('/college', authenticate, authorize(['USER', 'ORGANIZER']), controller.college);
// Replaced admin route with organizer route
router.get('/organizer', authenticate, authorize(['ORGANIZER']), controller.organizer);
// Removed admin route as it's not needed for MVP

export default router;