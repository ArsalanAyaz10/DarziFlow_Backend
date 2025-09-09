import express from "express";
import {protect} from "../middleware/authMiddleware.js";
import { getDepartments, createDepartment,updateDepartment, deleteDepartment } from "../controllers/DepartmentController.js";

const router = express.Router();

// Read
router.get("/", protect, getDepartments);

// Get logged-in user profile
router.post("/create",createDepartment);

// Update
router.put("/:id", protect, updateDepartment);

// Delete
router.delete("/:id", protect, deleteDepartment);

export default router;
