import express from 'express';
import { addBudget, listBudgets, editBudget, removeBudget } from '../controllers/budgetController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/', addBudget);
router.get('/', listBudgets);
router.patch('/:id', editBudget);
router.delete('/:id', removeBudget);

export default router;