
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";
import {
  createEmergencyBulletin,
  updateEmergencyBulletin,
  closeEmergencyBulletin,
  getActiveEmergencyBulletins,
  getEmergencyBulletinDetails,
} from "../controllers/adminBulletinController.js";

const router = express.Router();

router.get("/", protect, getActiveEmergencyBulletins);
router.get("/:id", protect, getEmergencyBulletinDetails);

router.post("/", protect, adminOnly, createEmergencyBulletin);
router.patch("/:id", protect, adminOnly, updateEmergencyBulletin);
router.patch("/:id/close", protect, adminOnly, closeEmergencyBulletin);

export default router;
