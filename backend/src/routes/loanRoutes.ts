import express from 'express';
import { getActiveLoan, repayLoan, withdrawLoan, getPendingWithdrawal } from '../controllers/loanController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.get('/active', protect, getActiveLoan);
router.post('/repay', protect, repayLoan);
router.post('/withdraw', protect, withdrawLoan);
router.get('/pending-withdrawal', protect, getPendingWithdrawal);

export default router;
