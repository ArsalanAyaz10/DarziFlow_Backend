import express from "express";
import {protect,authorizeRoles} from "../middleware/authMiddleware.js";
import { getDepartments, createDepartment,updateDepartment, deleteDepartment } from "../controllers/DepartmentController.js";

const router = express.Router();

// Read
router.get("/", protect,authorizeRoles("MODERATOR","ADMIN","SUPERVISOR"), getDepartments);

// Get logged-in user profile
router.post("/create", protect,authorizeRoles("MODERATOR","ADMIN","SUPERVISOR"),createDepartment);

// Update
router.put("/:id", protect,authorizeRoles("MODERATOR","ADMIN","SUPERVISOR"), updateDepartment);

// Delete
router.delete("/:id", protect,authorizeRoles("MODERATOR","ADMIN","SUPERVISOR"), deleteDepartment);

export default router;
