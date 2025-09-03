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


export { fetchUsers};