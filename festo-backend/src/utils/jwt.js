import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

/**
 * Sign a payload into a JWT
 * @param {object} payload
 * @param {string} [expiresIn]
 * @returns {string}
 */
export const signToken = (payload, expiresIn = env.JWT_EXPIRES_IN) => {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn });
};

/**
 * Verify and decode a JWT
 * @param {string} token
 * @returns {object|null}
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, env.JWT_SECRET);
  } catch (err) {
    return null;
  }
};
