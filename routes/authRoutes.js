import express from "express";
import {registerUser, loginUser, refreshToken} from "../controllers/authController.js";

const router = express.Router();

// Routes

//Register
router.post("/register", registerUser); // Supervisor / QC Officer / Client

//Login
router.post("/login", loginUser);       // All roles can login

// Refresh
router.post("/refresh", refreshToken);

export default router;