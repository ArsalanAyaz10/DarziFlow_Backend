import express from "express"; 
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import { createAdmin, fetchAdmins, updateAdmin, deleteAdmin } from "../controllers/adminController.js";

const router = express.Router();

// Create a new Admin (only MODERATOR,ADMIN can do this) 
router.post("/create", protect, authorizeRoles("MODERATOR","ADMIN"),createAdmin);

// Get all Admins (only MODERATOR,ADMIN can see them)
router.get("/fetch", protect, authorizeRoles("MODERATOR","ADMIN"),fetchAdmins);

//Update an Admin (only MODERATOR,ADMIN can update)
router.put("/:id", protect, authorizeRoles("MODERATOR","ADMIN"),updateAdmin);

//Delete an Admin (only MODERATOR,ADMIN can delete)
router.delete("/:id", protect, authorizeRoles("MODERATOR","ADMIN"),deleteAdmin);

export default router;
