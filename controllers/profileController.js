import User from '../models/User.js';
import {hashPassword,comparePassword} from "../utils/authUtill.js";

const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password"); // don’t send password
        if (!user) return res.status(404).json({ msg: "User not found" });
        res.json(user);
    } catch (err) {
        res.status(500).send("Server error");
    }
}


const changePassword = async (req, res) => {
      try {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    // verify old password
    const isMatch = await comparePassword(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid old password" });

    // hash new password
    user.password = await hashPassword(newPassword);

    await user.save();
    res.json({ msg: "Password updated successfully" });

  } catch (err) {
    res.status(500).send("Server error");
  }
}

export {changePassword,getProfile};