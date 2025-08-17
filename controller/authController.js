import { Moderator, Supervisor, QCOfficer, Admin, Client } from "../models/userModels.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Helper: find user by email across all role collections
const findUserByEmail = async (email) => {
  return (
    (await Supervisor.findOne({ email })) ||
    (await QCOfficer.findOne({ email })) ||
    (await Moderator.findOne({ email })) ||
    (await Admin.findOne({ email })) ||
    (await Client.findOne({ email }))
  );
};

// 🔹 Register Supervisor, QC Officer, or Client
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Only allow SUPERVISOR, QC_OFFICER, CLIENT to self-register
    if (!["SUPERVISOR", "QC_OFFICER", "CLIENT"].includes(role)) {
      return res.status(403).json({
        message: "You cannot self-register as Admin or Moderator",
      });
    }

    // Check if email already exists in ANY collection
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    let user;
    if (role === "SUPERVISOR") {
      user = new Supervisor({ name, email, password: hashedPassword });
    } else if (role === "QC_OFFICER") {
      user = new QCOfficer({ name, email, password: hashedPassword });
    } else if (role === "CLIENT") {
      user = new Client({ name, email, password: hashedPassword });
    }

    await user.save();

    res.status(201).json({
      message: `${role} registered successfully`,
      user: { id: user._id, name: user.name, email: user.email, role },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🔹 Login for all roles
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Look in all role collections
    const user = await findUserByEmail(email);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Match password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    // Identify role based on collection name
    let role = "UNKNOWN";
    if (user instanceof Admin) role = "ADMIN";
    else if (user instanceof Moderator) role = "MODERATOR";
    else if (user instanceof Supervisor) role = "SUPERVISOR";
    else if (user instanceof QCOfficer) role = "QC_OFFICER";
    else if (user instanceof Client) role = "CLIENT";

    // Generate token
    const token = jwt.sign(
      { id: user._id, role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role,
        status: user.status,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
