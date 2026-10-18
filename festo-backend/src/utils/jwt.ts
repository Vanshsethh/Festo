import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';
import { env } from '../config/env.js';

/**
 * Sign a payload into a JWT
 */
export const signToken = (
  payload: object,
  expiresIn: string | number = env.JWT_EXPIRES_IN
): string => {
  const options: SignOptions = {
    expiresIn: expiresIn as SignOptions['expiresIn'],
  };
  return jwt.sign(payload, env.JWT_SECRET, options);
};

/**
 * Verify and decode a JWT
 */
export const verifyToken = <T = JwtPayload>(token: string): (T & JwtPayload) | null => {
  try {
    return jwt.verify(token, env.JWT_SECRET) as T & JwtPayload;
  } catch (_err) {
    return null;
  }
};
