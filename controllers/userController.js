import User from '../models/User.js';
import {hashPassword} from "../utils/authUtill.js";
import { sendEmail } from '../utils/mailer.js';

const fetchUsers = async (req, res) => {
  try {
    // fetch all users, excluding password
    const users = await User.find().select("-password");

    // aggregate role-based stats
    const roleStats = await User.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } }
    ]);

    // format roleStats into an object like { ADMIN: 3, MODERATOR: 5, USER: 20 }
    const roleCounts = roleStats.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    res.json({ 
      message: "Users fetched successfully", 
      users,
      stats: {
        totalUsers: users.length,
        roles: roleCounts
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

const getPendingUsers = async (req, res) => {
  try {
    const pending = await User.find({ 
      role: { $in: ["SUPERVISOR", "QC_OFFICER"] },
      status: "PENDING"
    }).select("-password");

    res.json(pending);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const approveUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || !["SUPERVISOR", "QC_OFFICER"].includes(user.role)) {
      return res.status(404).json({ message: "User not found or invalid role" });
    }

    user.status = "APPROVED";
    user.approvalMeta = {
      approvedBy: req.user._id,
      approvedAt: new Date()
    };

    await user.save();

    // Send email
    const emailContent = `
      <h2>Account Approved</h2>
      <p>Hello ${user.name},</p>
      <p>Your account as <b>${user.role}</b> has been approved. You can now login to the mobile app.</p>
    `;
    await sendEmail(user.workEmail, "Your Account is Approved", emailContent);

    res.json({ message: "User approved successfully", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const rejectUser = async (req, res) => {
  try {
    const { reason } = req.body;
    const user = await User.findById(req.params.id);
    if (!user || !["SUPERVISOR", "QC_OFFICER"].includes(user.role)) {
      return res.status(404).json({ message: "User not found or invalid role" });
    }

    user.status = "REJECTED";
    user.approvalMeta = {
      rejectedAt: new Date(),
      rejectionReason: reason || "Not specified",
      approvedBy: req.user._id
    };

    await user.save();

    // Send email
    const emailContent = `
      <h2>Account Rejected</h2>
      <p>Hello ${user.name},</p>
      <p>Your account as <b>${user.role}</b> has been rejected.</p>
      <p>Reason: ${reason || "Not specified"}</p>
    `;
    await sendEmail(user.workEmail, "Your Account is Rejected", emailContent);

    res.json({ message: "User rejected successfully", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { fetchUsers,approveUser,rejectUser,getPendingUsers };