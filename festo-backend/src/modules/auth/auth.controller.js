import * as authService from './auth.service.js';
import { env } from '../../config/env.js';
import { AUTH_COOKIE_NAME } from '../../middleware/authenticate.js';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/',
};

export const register = async (req, res, next) => {
  try {
    const { user, token } = await authService.register(req.body);

    res.cookie(AUTH_COOKIE_NAME, token, COOKIE_OPTIONS);

    return res.status(201).json({
      success: true,
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { user, token } = await authService.login(req.body);

    res.cookie(AUTH_COOKIE_NAME, token, COOKIE_OPTIONS);

    return res.status(200).json({
      success: true,
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (_req, res, next) => {
  try {
    res.clearCookie(AUTH_COOKIE_NAME, {
      ...COOKIE_OPTIONS,
      maxAge: 0,
    });

    return res.status(200).json({
      success: true,
      data: {
        message: 'Logged out successfully.',
      },
    });
  } catch (error) {
    next(error);
  }
};

export const me = async (req, res, next) => {
  try {
    const user = await authService.getMe(req.user.id);

    return res.status(200).json({
      success: true,
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};
