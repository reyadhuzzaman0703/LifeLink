
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { createBloodRequest, getMyBloodRequests,  getActiveBloodRequests, cancelBloodRequest, updateBloodRequest,  getMatchingDonors,} from "../controllers/bloodRequestController.js";

const router = express.Router();

router.post("/", protect, createBloodRequest);
router.get("/my", protect, getMyBloodRequests);
router.get("/", protect, getActiveBloodRequests);
router.patch("/:id/cancel", protect, cancelBloodRequest);
router.patch("/:id", protect, updateBloodRequest);
router.get("/:id/donors", protect, getMatchingDonors);

export default router;
