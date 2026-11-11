
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getMyDonorNotifications,
  getDonorNotificationDetails,
} from "../controllers/donorNotificationController.js";

const router = express.Router();

router.get("/", protect, getMyDonorNotifications);
router.get("/:id", protect, getDonorNotificationDetails);

export default router;
