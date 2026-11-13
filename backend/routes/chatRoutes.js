
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  startChat,
  getChatMessages,
  sendMessage,
} from "../controllers/chatController.js";
import {
  submitDonationConfirmation,
} from "../controllers/donationConfirmationController.js";

const router = express.Router();

router.post(
  "/notification/:notificationId/start",
  protect,
  startChat
);

router.get("/:chatId/messages", protect, getChatMessages);

router.post("/:chatId/messages", protect, sendMessage);

router.post(
  "/:chatId/confirmation",
  protect,
  submitDonationConfirmation
);

export default router;
