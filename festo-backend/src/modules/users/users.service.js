import { updateUserProfile, updateUserPassword, getUserWithPasswordById } from './users.repo.js';
import { hashPassword, verifyPassword } from '../../utils/password.js';

export const updateProfile = async (userId, { name }) => {
  const updatedUser = await updateUserProfile(userId, { name });
  if (!updatedUser) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }
  return updatedUser;
};

export const changePassword = async (userId, { currentPassword, newPassword }) => {
  const user = await getUserWithPasswordById(userId);
  if (!user) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }

  const isCurrentValid = await verifyPassword(user.password_hash, currentPassword);
  if (!isCurrentValid) {
    const error = new Error('Current password does not match.');
    error.statusCode = 400;
    throw error;
  }

  const newHash = await hashPassword(newPassword);
  await updateUserPassword(userId, newHash);

  return { message: 'Password updated successfully.' };
};
