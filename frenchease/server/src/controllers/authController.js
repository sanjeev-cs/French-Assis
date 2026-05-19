import {
  clearAuthCookie,
  findUserById,
  getAuthCookieName,
  loginUser,
  registerUser,
  setAuthCookie,
  verifyToken
} from '../services/authService.js';
import { validateCredentials } from '../validators/authValidator.js';

export const register = async (req, res, next) => {
  try {
    const credentials = validateCredentials(req.body);
    await registerUser(credentials);
    const session = await loginUser(credentials);

    setAuthCookie(res, session.token);
    res.status(201).json({ user: session.user });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const credentials = validateCredentials(req.body, { requireStrongPassword: false });
    const session = await loginUser(credentials);

    setAuthCookie(res, session.token);
    res.status(200).json({ user: session.user });
  } catch (error) {
    next(error);
  }
};

export const logout = (req, res) => {
  clearAuthCookie(res);
  res.status(200).json({ message: 'Logged out.' });
};

export const me = async (req, res, next) => {
  try {
    const token = req.cookies?.[getAuthCookieName()];

    if (!token) {
      res.status(200).json({ user: null });
      return;
    }

    const payload = verifyToken(token);
    const user = await findUserById(payload.sub);

    res.status(200).json({ user });
  } catch {
    clearAuthCookie(res);
    res.status(200).json({ user: null });
  }
};
