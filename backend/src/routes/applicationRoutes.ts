import express from 'express';
import { createApplication, getMyApplications } from '../controllers/applicationController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.post('/create', protect, createApplication);
router.get('/my', protect, getMyApplications);

export default router;
