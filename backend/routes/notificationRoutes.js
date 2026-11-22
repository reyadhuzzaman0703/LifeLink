
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  registerFCMToken,
  removeFCMToken,
} from "../controllers/notificationController.js";

const router = express.Router();

router.post("/register-token", protect, registerFCMToken);
router.delete("/remove-token", protect, removeFCMToken);

export default router;
