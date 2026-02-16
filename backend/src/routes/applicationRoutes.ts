import express from 'express';
import { createApplication, getMyApplications, uploadDocument } from '../controllers/applicationController';
import { protect } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = express.Router();

router.post('/create', protect, createApplication);
router.get('/my', protect, getMyApplications);
router.post('/:id/upload', protect, upload.single('document'), uploadDocument);

export default router;
