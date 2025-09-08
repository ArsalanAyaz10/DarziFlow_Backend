import express from "express";
import {protect} from "../middleware/authMiddleware.js";
import { createDepartment } from "../controllers/DepartmentController.js";

const router = express.Router();

// Get logged-in user profile
router.post("/create", protect,createDepartment);

// Read
router.get("/", protect, getDepartments);

// Update
router.put("/:id", protect, updateDepartment);

// Delete
router.delete("/:id", protect, deleteDepartment);

export default router;
