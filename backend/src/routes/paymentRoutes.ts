import express from 'express';
import { initiateProcessingFeePayment, flutterwaveWebhook } from '../controllers/paymentController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.post('/initiate-processing-fee/:applicationId', protect, initiateProcessingFeePayment);
router.post('/webhook', flutterwaveWebhook);

export default router;
