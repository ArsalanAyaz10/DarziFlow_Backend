import express from "express";
import User from "../models/User.js"; 
import {protect} from "../middleware/authMiddleware.js";
import bcrypt from "bcryptjs";

const router = express.Router();

// Get logged-in user profile
router.get("/", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password"); // don’t send password
    if (!user) return res.status(404).json({ msg: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).send("Server error");
  }
});

// Change password
router.put("/password", protect, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    // verify old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid old password" });

    // hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();
    res.json({ msg: "Password updated successfully" });

  } catch (err) {
    res.status(500).send("Server error");
  }
});


export default router;
