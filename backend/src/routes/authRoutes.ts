import express from 'express';
import { register, login, getProfile, googleLogin, facebookLogin, telegramLogin } from '../controllers/authController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
router.post('/facebook', facebookLogin);
router.post('/telegram', telegramLogin);
router.get('/profile', protect, getProfile);

export default router;
