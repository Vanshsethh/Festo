import { Router } from 'express';
import * as authController from './auth.controller.js';
import { validateBody } from '../../middleware/validate.js';
import { authenticate } from '../../middleware/authenticate.js';
import { registerSchema, loginSchema } from './auth.schema.js';
import { authRateLimiter } from '../../middleware/rateLimiter.js';

const router = Router();

router.post('/register', authRateLimiter, validateBody(registerSchema), authController.register);
router.post('/login', authRateLimiter, validateBody(loginSchema), authController.login);
router.post('/logout', authController.logout);
router.get('/me', authenticate, authController.me);

export default router;
