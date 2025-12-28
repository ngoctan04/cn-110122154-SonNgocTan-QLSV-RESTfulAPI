import express from "express";
import { register, login, verifyToken, getCurrentUser, logout } from "../controller/authController.js";
import { protectRoute } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);
router.post("/verify-token", verifyToken);

// Protected routes
router.get("/me", protectRoute, getCurrentUser);
router.post("/logout", protectRoute, logout);

export default router;
