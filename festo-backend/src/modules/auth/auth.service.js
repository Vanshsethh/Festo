import { findUserByEmail, findUserById, createUser } from './auth.repo.js';
import { hashPassword, verifyPassword } from '../../utils/password.js';
import { signToken } from '../../utils/jwt.js';

export const register = async ({ name, email, password }) => {
  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    const error = new Error('An account with this email already exists.');
    error.statusCode = 409;
    throw error;
  }

  const passwordHash = await hashPassword(password);
  const user = await createUser({
    name,
    email,
    passwordHash,
    role: 'USER', // Changed from 'STUDENT' to 'USER'
  });

  const token = signToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  return { user, token };
};

export const login = async ({ email, password }) => {
  const user = await findUserByEmail(email);
  if (!user) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    throw error;
  }

  if (user.status !== 'ACTIVE') {
    const error = new Error('Your account has been suspended.');
    error.statusCode = 403;
    throw error;
  }

  const isPasswordValid = await verifyPassword(user.password_hash, password);
  if (!isPasswordValid) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    throw error;
  }

  const token = signToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  // Strip password_hash from return payload
  const { password_hash: _hash, ...userProfile } = user;

  return { user: userProfile, token };
};

export const getMe = async (userId) => {
  const user = await findUserById(userId);
  if (!user) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }
  return user;
};