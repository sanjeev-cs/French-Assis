import { findUserById, getAuthCookieName, verifyToken } from '../services/authService.js';
import { HttpError } from '../utils/httpError.js';

export const requireAuth = async (req, res, next) => {
  try {
    const token = req.cookies?.[getAuthCookieName()];

    if (!token) {
      throw new HttpError('Authentication required.', 401);
    }

    const payload = verifyToken(token);
    const user = await findUserById(payload.sub);

    if (!user) {
      throw new HttpError('Authentication required.', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      next(new HttpError('Authentication required.', 401));
      return;
    }

    next(error);
  }
};
