
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";

import {
  getAdminDashboardStats,
} from "../controllers/adminStatsController.js";

import {
  getAllUsers,
  updateUserStatus,
} from "../controllers/adminUserController.js";

import {
  getAllBloodRequests,
  getAdminBloodRequestDetails,
} from "../controllers/adminBloodRequestController.js";

const router = express.Router();

router.get(
  "/dashboard/stats",
  protect,
  adminOnly,
  getAdminDashboardStats
);

router.get(
  "/users",
  protect,
  adminOnly,
  getAllUsers
);

router.patch(
  "/users/:id/status",
  protect,
  adminOnly,
  updateUserStatus
);

router.get(
  "/blood-requests",
  protect,
  adminOnly,
  getAllBloodRequests
);

router.get(
  "/blood-requests/:id",
  protect,
  adminOnly,
  getAdminBloodRequestDetails
);

export default router;
