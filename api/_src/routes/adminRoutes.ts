import express from "express";
import { getAllApplications, updateApplicationStatus, confirmProcessingFee, getAllLoans, getAnalytics, getSettings, updateSettings, updateApplicationProgress, getPendingPaymentEvidences, getPendingWithdrawals, updateWithdrawalStatus } from '../controllers/adminController';
import { adminLogin } from '../controllers/authController';
import { protect, admin } from '../middleware/auth';

const router = express.Router();

router.post('/login', adminLogin);
router.get('/applications', protect, admin, getAllApplications);
router.put('/applications/:id/status', protect, admin, updateApplicationStatus);
router.post('/confirm-fee/:applicationId', protect, admin, confirmProcessingFee);
router.get('/loans', protect, admin, getAllLoans);
router.get('/analytics', protect, admin, getAnalytics);
router.get('/settings', protect, admin, getSettings);
router.put('/settings', protect, admin, updateSettings);
router.put('/applications/:id/progress', protect, admin, updateApplicationProgress);
router.get('/pending-payments', protect, admin, getPendingPaymentEvidences);
router.get('/withdrawals', protect, admin, getPendingWithdrawals);
router.put('/withdrawals/:id/status', protect, admin, updateWithdrawalStatus);

export default router;
