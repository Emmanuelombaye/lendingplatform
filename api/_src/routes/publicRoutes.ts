import express from "express";
import {
  healthCheck,
  getPublicSettings,
  submitContactForm,
} from "../controllers/publicController";

const router = express.Router();

router.get("/health", healthCheck);
router.get("/settings", getPublicSettings);
router.post("/contact", submitContactForm);

export default router;
