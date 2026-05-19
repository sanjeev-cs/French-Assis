import express from 'express';
import { changePassword, login, logout, me, register } from '../controllers/authController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/auth/register', register);
router.post('/auth/login', login);
router.post('/auth/logout', logout);
router.get('/auth/me', me);
router.post('/auth/change-password', requireAuth, changePassword);

export default router;
