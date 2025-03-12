import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { getProjectHistory, getProjectHistoryById } from '../controller/historyController.js';

const router = express.Router();

// Get all project history (admin only)
router.get('/', authMiddleware, getProjectHistory);

// Get history for a specific project
router.get('/:id', authMiddleware, getProjectHistoryById);

export default router;