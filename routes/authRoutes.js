import express from "express";
import { registerUser, loginUser } from "../controller/authController.js";

const router = express.Router();

// Routes
router.post("/register", registerUser); // Supervisor / QC Officer / Client
router.post("/login", loginUser);       // All roles can login

export default router;
