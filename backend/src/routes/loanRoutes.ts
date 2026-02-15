import express from 'express';
import { getActiveLoan, repayLoan } from '../controllers/loanController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.get('/active', protect, getActiveLoan);
router.post('/repay', protect, repayLoan);

export default router;
