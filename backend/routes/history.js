import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { getProjectHistory, getProjectHistoryById } from '../controller/historyController.js';

const router = express.Router();


router.get('/', authMiddleware, getProjectHistory);


router.get('/:id', authMiddleware, getProjectHistoryById);

export default router;