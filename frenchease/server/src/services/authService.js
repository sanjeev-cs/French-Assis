import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { HttpError } from '../utils/httpError.js';

const COOKIE_NAME = 'frenchease_token';
const TOKEN_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

const publicUser = (user) => ({
  id: user._id,
  username: user.username
});

const requireJwtSecret = () => {
  if (!env.jwtSecret) {
    throw new Error('JWT_SECRET is required');
  }
};

export const createToken = (user) => {
  requireJwtSecret();

  return jwt.sign({ sub: user._id.toString(), username: user.username }, env.jwtSecret, {
    expiresIn: '7d'
  });
};

export const verifyToken = (token) => {
  requireJwtSecret();
  return jwt.verify(token, env.jwtSecret);
};

export const getCookieOptions = () => ({
  httpOnly: true,
  secure: env.nodeEnv === 'production',
  sameSite: env.nodeEnv === 'production' ? 'none' : 'lax',
  maxAge: TOKEN_MAX_AGE_MS,
  path: '/'
});

export const setAuthCookie = (res, token) => {
  res.cookie(COOKIE_NAME, token, getCookieOptions());
};

export const clearAuthCookie = (res) => {
  res.clearCookie(COOKIE_NAME, {
    ...getCookieOptions(),
    maxAge: undefined
  });
};

export const getAuthCookieName = () => COOKIE_NAME;

export const registerUser = async ({ username, password }) => {
  const existingUser = await User.findOne({ username });

  if (existingUser) {
    throw new HttpError('Username is already taken.', 409);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ username, passwordHash });

  return publicUser(user);
};

export const loginUser = async ({ username, password }) => {
  const user = await User.findOne({ username });

  if (!user) {
    throw new HttpError('Invalid username or password.', 401);
  }

  const isValidPassword = await bcrypt.compare(password, user.passwordHash);

  if (!isValidPassword) {
    throw new HttpError('Invalid username or password.', 401);
  }

  return {
    user: publicUser(user),
    token: createToken(user)
  };
};

export const findUserById = async (id) => {
  const user = await User.findById(id).select('_id username');
  return user ? publicUser(user) : null;
};
