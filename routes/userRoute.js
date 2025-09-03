import express from "express";
import {protect,authorizeRoles} from "../middleware/authMiddleware.js";
import {fetchUsers} from "../controllers/userController.js";

const router = express.Router();

// get all users data (moderator+admin)

router.get("/", protect,authorizeRoles("MODERATOR","ADMIN"),fetchUsers);

export default router;
