import express from 'express';
import { listHistory, removeHistory } from '../controllers/historyController.js';

const router = express.Router();

router.get('/history', listHistory);
router.delete('/history/:id', removeHistory);

export default router;
