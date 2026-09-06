import crypto from 'node:crypto';
import { Resend } from 'resend';
import { findUserByEmail, findUserById, createUser, replacePasswordResetToken, deletePasswordResetTokensForUser, consumePasswordResetToken } from './auth.repo.js';
import { hashPassword, verifyPassword } from '../../utils/password.js';
import { signToken } from '../../utils/jwt.js';
import { env } from '../../config/env.js';

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

const resetMessage = 'If an account exists for that email, we have sent a password-reset link.';
const escapeHtml = (value) => String(value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));

export const requestPasswordReset = async ({ email }) => {
  const user = await findUserByEmail(email);
  // Always return the same response to prevent account enumeration.
  if (!user || user.status !== 'ACTIVE') return { message: resetMessage };

  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
  await replacePasswordResetToken({ userId: user.id, tokenHash, expiresAt });

  const resetUrl = new URL('/reset-password', env.FRONTEND_URL);
  resetUrl.searchParams.set('token', token);
  const html = `<p>Hi ${escapeHtml(user.name)},</p><p>Use the link below to reset your Festo password. It expires in one hour and can only be used once.</p><p><a href="${resetUrl.toString()}">Reset your password</a></p><p>If you did not request this, you can ignore this email.</p>`;

  if (env.RESEND_API_KEY) {
    try {
      const { error: deliveryError } = await new Resend(env.RESEND_API_KEY).emails.send({
        from: env.EMAIL_FROM,
        to: user.email,
        subject: 'Reset your Festo password',
        html,
      });
      if (deliveryError) throw new Error(deliveryError.message || 'Unable to send password reset email.');
    } catch (error) {
      // Do not leave a usable token behind if delivery failed.
      await deletePasswordResetTokensForUser(user.id);
      throw error;
    }
  } else if (env.NODE_ENV !== 'production') {
    // Allows local development without an email provider; never enabled in production.
    console.info(`Password reset link for ${user.email}: ${resetUrl.toString()}`);
  } else {
    const error = new Error('Password reset email is not configured.');
    error.statusCode = 503;
    throw error;
  }

  return { message: resetMessage };
};

export const resetPassword = async ({ token, password }) => {
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const passwordHash = await hashPassword(password);
  const updated = await consumePasswordResetToken({ tokenHash, passwordHash });
  if (!updated) {
    const error = new Error('This password-reset link is invalid or has expired.');
    error.statusCode = 400;
    throw error;
  }
  return { message: 'Password reset successfully. You can now sign in.' };
};
