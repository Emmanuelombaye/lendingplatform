import express from "express";
import { getAllApplications, updateApplicationStatus, confirmProcessingFee, getLoans, getSettings, updateSettings, getAnalytics, updateProgress, deleteAllUserLoans, autoApproveLoan, getAutoApprovalSettings, updateAutoApprovalSettings } from '../controllers/adminController';
import { adminLogin } from '../controllers/authController';
import { protect, admin } from '../middleware/auth';

const router = express.Router();

router.post('/login', adminLogin);
router.get('/applications', protect, admin, getAllApplications);
router.put('/applications/:id/status', protect, admin, updateApplicationStatus);
router.post('/confirm-fee/:applicationId', protect, admin, confirmProcessingFee);
router.get('/loans', protect, admin, getLoans);
router.get('/settings', protect, admin, getSettings);
router.put('/settings', protect, admin, updateSettings);
router.get('/analytics', protect, admin, getAnalytics);
router.put('/applications/:id/progress', protect, admin, updateProgress);
router.delete('/delete-all-loans', protect, admin, deleteAllUserLoans);
router.post('/auto-approve/:applicationId', protect, admin, autoApproveLoan);
router.get('/auto-approval-settings', protect, admin, getAutoApprovalSettings);
router.put('/auto-approval-settings', protect, admin, updateAutoApprovalSettings);

export default router;
