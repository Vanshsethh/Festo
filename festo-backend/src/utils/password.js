import argon2 from 'argon2';

/**
 * Hash a plain text password using Argon2id
 * @param {string} password
 * @returns {Promise<string>}
 */
export const hashPassword = async (password) => {
  return argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 2 ** 16, // 64 MB
    timeCost: 3,
    parallelism: 1,
  });
};

/**
 * Verify a plain text password against an Argon2id hash
 * @param {string} hash
 * @param {string} password
 * @returns {Promise<boolean>}
 */
export const verifyPassword = async (hash, password) => {
  try {
    return await argon2.verify(hash, password);
  } catch (err) {
    return false;
  }
};
