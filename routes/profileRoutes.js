import express from "express";
import {protect} from "../middleware/authMiddleware.js";
import {changePassword, getProfile} from "../controllers/profileController.js";

const router = express.Router();

// Get logged-in user profile
router.get("/", protect,getProfile);

// Change password
router.put("/password", protect, changePassword);

export default router;
