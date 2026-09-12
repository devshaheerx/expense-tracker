import express from 'express';
import {
  addTransaction,
  listTransactions,
  editTransaction,
  removeTransaction,
} from '../controllers/transactionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Every route here requires a valid logged-in user — applied once to the whole router
// instead of repeating `protect` on each individual line.
router.use(protect);

router.post('/', addTransaction);
router.get('/', listTransactions);
router.patch('/:id', editTransaction);
router.delete('/:id', removeTransaction);

export default router;