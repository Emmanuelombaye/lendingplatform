import express from 'express';
import { 
    initiateProcessingFeePayment, 
    flutterwaveWebhook,
    initiatePesaPalPayment,
    pesapalCallback
} from '../controllers/paymentController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.post('/initiate-processing-fee/:applicationId', protect, initiateProcessingFeePayment);
router.post('/webhook', flutterwaveWebhook);

// PesaPal Routes
router.post('/pesapal/initiate/:applicationId', protect, initiatePesaPalPayment);
router.get('/pesapal-callback', pesapalCallback);

export default router;
