
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { respondToEmergencyBulletin } from "../controllers/emergencyBulletinResponseController.js";

const router = express.Router();

router.post(
  "/:id/hospitals/:hospitalId/respond",
  protect,
  respondToEmergencyBulletin
);

export default router;
