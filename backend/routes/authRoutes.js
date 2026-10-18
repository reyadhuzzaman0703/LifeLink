
import express from "express";
import { register, login, getMe, changePassword, updateProfile } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

router.get("/me", protect, getMe);
router.patch("/change-password", protect, changePassword);
router.patch("/profile", protect, updateProfile);

export default router;
