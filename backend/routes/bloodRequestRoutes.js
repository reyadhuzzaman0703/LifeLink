
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { createBloodRequest, getMyBloodRequests,  getActiveBloodRequests, cancelBloodRequest, updateBloodRequest,  getMatchingDonors, sendNextDonorNotification, getBloodRequestRoute,} from "../controllers/bloodRequestController.js";

const router = express.Router();

router.post("/", protect, createBloodRequest);
router.get("/my", protect, getMyBloodRequests);
router.get("/", protect, getActiveBloodRequests);
router.patch("/:id/cancel", protect, cancelBloodRequest);
router.patch("/:id", protect, updateBloodRequest);
router.get("/:id/donors", protect, getMatchingDonors);
router.post("/:id/notify-next-donor", protect, sendNextDonorNotification);
router.get("/:id/route", protect, getBloodRequestRoute);

export default router;
