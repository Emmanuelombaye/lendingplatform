import express from "express";
import {
  register,
  login,
  getProfile,
  googleLogin,
  facebookLogin,
  telegramLogin,
  verifyOTP,
  resendOTP,
  requestEmailOTP,
} from "../controllers/authController";
import { protect } from "../middleware/auth";
import {
  validateDatabaseConnection,
  validateFormData,
  validateEmail,
  validatePhone,
  checkDuplicateUser,
  validatePasswordStrength,
  logFormSubmission,
} from "../middleware/formHandler";

const router = express.Router();

// Apply database validation to all routes
router.use(validateDatabaseConnection);

router.post(
  "/register",
  logFormSubmission("user_registration"),
  validateFormData(["fullName", "email", "password"]),
  validateEmail,
  validatePhone,
  validatePasswordStrength,
  checkDuplicateUser,
  register,
);

router.post("/verify-otp", verifyOTP);
router.post("/resend-otp", resendOTP);
router.post("/request-email-otp", requestEmailOTP);

router.post(
  "/login",
  logFormSubmission("user_login"),
  validateFormData(["email", "password"]),
  validateEmail,
  login,
);

router.post(
  "/google",
  logFormSubmission("google_login"),
  validateFormData(["email", "googleId", "fullName"]),
  validateEmail,
  googleLogin,
);

router.post(
  "/facebook",
  logFormSubmission("facebook_login"),
  validateFormData(["facebookId", "fullName"]),
  validateEmail,
  facebookLogin,
);

router.post(
  "/telegram",
  logFormSubmission("telegram_login"),
  validateFormData(["id", "first_name"]),
  telegramLogin,
);

router.get("/profile", protect, getProfile);

export default router;
