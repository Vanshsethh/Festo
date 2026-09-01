import { Router } from 'express';
import * as membersController from './college-members.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { validateBody } from '../../middleware/validate.js';
import { addMemberSchema } from './college-members.schema.js';

const router = Router({ mergeParams: true });

router.use(authenticate);

// Get members of the college - only organizers can view
router.get(
  '/',
  authorize(['ORGANIZER']),
  membersController.listMembers
);

// Add an organizer to the college - only organizers can add
router.post(
  '/',
  authorize(['ORGANIZER']),
  validateBody(addMemberSchema),
  membersController.addMember
);

// Remove an organizer from the college - only organizers can remove
router.delete(
  '/:memberId',
  authorize(['ORGANIZER']),
  membersController.removeMember
);

export default router;