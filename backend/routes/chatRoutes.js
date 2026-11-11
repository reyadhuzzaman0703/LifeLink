
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { startChat } from "../controllers/chatController.js";

const router = express.Router();

router.post("/notification/:notificationId/start", protect, startChat);

export default router;
