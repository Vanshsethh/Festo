import { Router } from 'express';
import * as collegesController from './colleges.controller.js';
import { authenticate, optionalAuthenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { validateBody, validateQuery } from '../../middleware/validate.js';
import { applyCollegeSchema, updateCollegeSchema, collegeQuerySchema } from './colleges.schema.js';

const router = Router();

// Public / optional auth routes
router.get('/', validateQuery(collegeQuerySchema), collegesController.listVerified);
router.get('/my-application', authenticate, collegesController.myApplication);
router.get('/:identifier', optionalAuthenticate, collegesController.getOne);

// Authenticated user application route (users can apply to become organizers)
router.post(
  '/apply',
  authenticate,
  authorize(['USER']), // Changed from STUDENT to USER
  validateBody(applyCollegeSchema),
  collegesController.apply
);

// College update route (ORGANIZER only - based on ownership)
router.patch(
  '/:id',
  authenticate,
  authorize(['ORGANIZER']), // Changed from COLLEGE_ADMIN/SUPER_ADMIN to ORGANIZER (ownership checked in service)
  validateBody(updateCollegeSchema),
  collegesController.update
);

export default router;