import express from "express";
import {
  createApplication,
  getMyApplications,
  uploadDocument,
} from "../controllers/applicationController";
import { protect } from "../middleware/auth";
import { upload } from "../middleware/upload";
import {
  validateDatabaseConnection,
  validateFormData,
  handleApplicationSubmission,
  validateFileUpload,
  logFormSubmission,
} from "../middleware/formHandler";

const router = express.Router();

// Apply database validation to all routes
router.use(validateDatabaseConnection);

router.post(
  "/create",
  protect,
  logFormSubmission("loan_application"),
  validateFormData(["loanAmount", "repaymentPeriod"]),
  handleApplicationSubmission,
  createApplication,
);

router.get("/my", protect, getMyApplications);

router.post(
  "/:id/upload",
  protect,
  upload.single("document"),
  validateFileUpload(
    ["image/jpeg", "image/png", "application/pdf"],
    10 * 1024 * 1024,
  ),
  logFormSubmission("document_upload"),
  uploadDocument,
);

export default router;
