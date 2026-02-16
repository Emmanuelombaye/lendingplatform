import express from 'express';
import { getProfile, updateProfile, getDashboardData, changePassword, getActivityLogs } from '../controllers/userController';
import { protect } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = express.Router();

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.get('/dashboard', protect, getDashboardData);
router.post('/change-password', protect, changePassword);
router.get('/activity', protect, getActivityLogs);

export default router;
