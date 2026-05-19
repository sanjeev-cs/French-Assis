import express from 'express';
import { aiChat, aiTip, phonetics } from '../controllers/aiController.js';

const router = express.Router();

router.post('/phonetics', phonetics);
router.post('/ai-tip', aiTip);
router.post('/ai-chat', aiChat);

export default router;
