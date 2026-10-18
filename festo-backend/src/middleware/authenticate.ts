import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.js';
import { pool } from '../db/pool.js';
import { AuthUser } from '../types/index.js';

export const AUTH_COOKIE_NAME = 'festo_token';

interface TokenPayload {
  id: string;
  email: string;
  role: string;
}

/**
 * Mandatory authentication middleware
 * Verifies JWT from HTTP-only cookie, checks user in DB and status
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined = req.cookies?.[AUTH_COOKIE_NAME];

    // Optional fallback for Bearer header if provided
    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Authentication required. Please sign in.',
      });
      return;
    }

    const decoded = verifyToken<TokenPayload>(token);
    if (!decoded || !decoded.id) {
      res.status(401).json({
        success: false,
        message: 'Session expired or invalid. Please sign in again.',
      });
      return;
    }

    // Fetch user from DB to verify existence, active status, and latest role/college
    const userResult = await pool.query<AuthUser>(
      'SELECT id, email, name, role, college_id, status FROM users WHERE id = $1',
      [decoded.id]
    );

    if (userResult.rows.length === 0) {
      res.status(401).json({
        success: false,
        message: 'User account not found.',
      });
      return;
    }

    const user = userResult.rows[0];

    if (user.status !== 'ACTIVE') {
      res.status(403).json({
        success: false,
        message: 'User account is suspended.',
      });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Optional authentication middleware for public browsing routes.
 * If token is present and valid, attaches req.user.
 * If token is absent or invalid, attaches req.user = null and proceeds.
 */
export const optionalAuthenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined = req.cookies?.[AUTH_COOKIE_NAME];
    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = verifyToken<TokenPayload>(token);
    if (!decoded || !decoded.id) {
      req.user = null;
      return next();
    }

    const userResult = await pool.query<AuthUser>(
      'SELECT id, email, name, role, college_id, status FROM users WHERE id = $1',
      [decoded.id]
    );

    if (userResult.rows.length > 0 && userResult.rows[0].status === 'ACTIVE') {
      req.user = userResult.rows[0];
    } else {
      req.user = null;
    }

    next();
  } catch (_error) {
    req.user = null;
    next();
  }
};
