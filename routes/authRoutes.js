import express from "express";
import {logoutUser, registerUser, loginUser, refreshToken} from "../controllers/authController.js";
import {protect} from "../middleware/authMiddleware.js";


const router = express.Router();

// Routes

//Register
router.post("/register", registerUser); // Supervisor / QC Officer / Client

//Login
router.post("/login", loginUser);       // All roles can login

// Logout
router.post("/logout",logoutUser);


// Refresh
router.post("/refresh", refreshToken);

export default router;