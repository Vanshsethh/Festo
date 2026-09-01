import { Router } from 'express';
import * as usersController from './users.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { validateBody } from '../../middleware/validate.js';
import { updateProfileSchema, changePasswordSchema } from './users.schema.js';

const router = Router();

router.patch(
  '/profile',
  authenticate,
  validateBody(updateProfileSchema),
  usersController.updateProfile
);

router.post(
  '/change-password',
  authenticate,
  validateBody(changePasswordSchema),
  usersController.changePassword
);

export default router;
