import express from "express";
import {protect,authorizeRoles} from "../middleware/authMiddleware.js";
import {fetchUsers,getPendingUsers,approveUser,rejectUser} from "../controllers/userController.js";

const router = express.Router();

// get all users data (moderator+admin)

router.get("/", protect,authorizeRoles("MODERATOR","ADMIN"),fetchUsers);

router.get("/pending", protect,authorizeRoles("MODERATOR","ADMIN"),getPendingUsers);

router.put("/:id/approve", protect,authorizeRoles("MODERATOR","ADMIN"),approveUser);

router.put("/reject", protect,authorizeRoles("MODERATOR","ADMIN"),rejectUser);

export default router;
