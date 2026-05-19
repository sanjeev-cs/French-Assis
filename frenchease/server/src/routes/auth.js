import express from 'express';
import { login, logout, me, register } from '../controllers/authController.js';

const router = express.Router();

router.post('/auth/register', register);
router.post('/auth/login', login);
router.post('/auth/logout', logout);
router.get('/auth/me', me);

export default router;
