import express from 'express';
import { categoryBreakdown, monthlyTrend, overview } from '../controllers/summaryController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/category', categoryBreakdown);
router.get('/trend', monthlyTrend);
router.get('/overview', overview);

export default router;