import express from "express";
import {
  getProfile,
  updateProfile,
  getDashboardData,
  changePassword,
  getActivityLogs,
  getTransactions,
  getCharges,
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  payProcessingFee,
} from "../controllers/userController";
import { protect } from "../middleware/auth";
import { upload } from "../middleware/upload";

const router = express.Router();

router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.get("/dashboard", protect, getDashboardData);
router.post("/change-password", protect, changePassword);
router.get("/activity", protect, getActivityLogs);

// New routes for real data
router.get("/transactions", protect, getTransactions);
router.get("/charges", protect, getCharges);
router.get("/notifications", protect, getNotifications);
router.put(
  "/notifications/:notificationId/read",
  protect,
  markNotificationAsRead,
);
router.put("/notifications/mark-all-read", protect, markAllNotificationsAsRead);
router.post("/pay-processing-fee/:applicationId", protect, payProcessingFee);

export default router;
