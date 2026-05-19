import { HttpError } from '../utils/httpError.js';
import { sanitizeText } from '../utils/sanitizeInput.js';

const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
const usernamePattern = /^[a-zA-Z0-9_]{3,30}$/;

export const validateCredentials = ({ username, password }, { requireStrongPassword = true } = {}) => {
  const cleanUsername = sanitizeText(username).toLowerCase();

  if (!usernamePattern.test(cleanUsername)) {
    throw new HttpError('Username must be 3-30 characters and use only letters, numbers, or underscores.', 400);
  }

  if (typeof password !== 'string' || !password) {
    throw new HttpError('Password is required.', 400);
  }

  if (requireStrongPassword && !passwordPattern.test(password)) {
    throw new HttpError(
      'Password must be at least 8 characters and include lowercase, uppercase, number, and special character.',
      400
    );
  }

  return {
    username: cleanUsername,
    password
  };
};
