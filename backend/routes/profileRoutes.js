import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getDonationHistory,
  getRequestHistory,
} from "../controllers/profileController.js";

const router = express.Router();

router.get("/donation-history", protect, getDonationHistory);
router.get("/request-history", protect, getRequestHistory);

export default router;