import express from "express"; 
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import { createAdmin, fetchAdmins, updateAdmin, deleteAdmin } from "../controllers/adminController.js";

const router = express.Router();

// Create a new Admin (only MODERATOR can do this) 
router.post("/create", protect, authorizeRoles("MODERATOR"),createAdmin);

// Get all Admins (only MODERATOR can see them)
router.get("/fetch", protect, authorizeRoles("MODERATOR"),fetchAdmins);

//Update an Admin (only MODERATOR can update)
router.put("/:id", protect, authorizeRoles("MODERATOR"),updateAdmin);

//Delete an Admin (only MODERATOR can delete)
router.delete("/:id", protect, authorizeRoles("MODERATOR"),deleteAdmin);

export default router;
