import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { standardRateLimiter } from './middleware/rateLimiter.js';
import authRoutes from './modules/auth/auth.routes.js';
import usersRoutes from './modules/users/users.routes.js';
import collegesRoutes from './modules/colleges/colleges.routes.js';
import collegeMembersRoutes from './modules/college-members/college-members.routes.js';
import eventsRoutes from './modules/events/events.routes.js';
import registrationsRoutes from './modules/registrations/registrations.routes.js';
import passesRoutes from './modules/passes/passes.routes.js';
import checkinsRoutes from './modules/checkins/checkins.routes.js';
import dashboardRoutes from './modules/dashboard/dashboard.routes.js';
import mediaRoutes from './modules/media/media.routes.js';
import { pool } from './db/pool.js';

export const createApp = () => {
  const app = express();
  app.disable('x-powered-by');
  if (env.NODE_ENV === 'production') app.set('trust proxy', 1);
  const corsOrigins = env.CORS_ORIGIN.split(',').map((origin) => origin.trim());
  if (env.NODE_ENV === 'development') corsOrigins.push('http://localhost:5174');

  // Basic security & parsing middleware
  app.use(
    cors({
      origin: corsOrigins,
      credentials: true,
    })
  );
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(self), microphone=()');
    next();
  });
  app.use(cookieParser());
  app.use(express.json({ limit: '7mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(standardRateLimiter);

  // Health check endpoint
  app.get('/health', async (_req, res) => {
    try {
      await pool.query('SELECT 1');
      res.status(200).json({
        success: true,
        data: {
          status: 'healthy',
          service: 'festo-api',
          timestamp: new Date().toISOString(),
        },
        });
    } catch {
      res.status(503).json({ success: false, message: 'Database unavailable' });
    }
  });

  // Base API router check
  app.get('/api', (_req, res) => {
    res.status(200).json({
      success: true,
      data: {
        name: 'Festo API',
        version: '1.0.0',
        environment: env.NODE_ENV,
      },
    });
  });

  // API Module Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/users', usersRoutes);
  app.use('/api/colleges/:collegeId/members', collegeMembersRoutes);
  app.use('/api/colleges', collegesRoutes);
  // Removed admin routes as Super Admin workflow is not needed for MVP
  app.use('/api/events', eventsRoutes);
  app.use('/api/registrations', registrationsRoutes);
  app.use('/api/passes', passesRoutes);
  app.use('/api/checkins', checkinsRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/media', mediaRoutes);

  // Catch-all 404 for unhandled routes
  app.use((_req, res) => {
    res.status(404).json({
      success: false,
      message: 'Endpoint not found',
    });
  });

  // Central error handler
  app.use(errorHandler);

  return app;
};

export const app = createApp();
