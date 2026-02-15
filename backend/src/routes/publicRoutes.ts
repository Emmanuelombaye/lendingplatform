import express from 'express';
import { getPublicSettings, submitContactForm } from '../controllers/publicController';

const router = express.Router();

router.get('/settings', getPublicSettings);
router.post('/contact', submitContactForm);

export default router;
