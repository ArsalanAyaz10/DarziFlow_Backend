import User from '../models/User.js';
import { generateAccessToken,generateRefreshToken } from '../utils/authUtill.js';
import {hashPassword,comparePassword} from "../utils/authUtill.js";

const registerUser = async (req, res) => {
  try {
    const { name,workEmail, password, role } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ workEmail });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashed = await hashPassword(password);

    // Create new user
    const newUser = await User.create({
      name,
      workEmail,
      password: hashed,
      role
    });

    // Generate tokens
    const accessToken = generateAccessToken(newUser);
    const refreshToken = generateRefreshToken(newUser);

    // Optionally save refreshToken in DB (depends on your strategy)
    newUser.refreshToken = refreshToken;
    await newUser.save();

    // Send tokens (access token in response, refresh in HttpOnly cookie)
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        _id: newUser._id,
        name: newUser.name,
        workEmail: newUser.workEmail,
        role: newUser.role,
      },
      accessToken,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { workEmail, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ workEmail });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Verify password
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    // ✅ Check role restriction
    if (user.role !== "ADMIN" && user.role !== "MODERATOR") {
      return res.status(403).json({ message: "Access denied. Only Moderators and Admins can login." });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Optional: Save refresh token in DB (so you can invalidate later if needed)
    user.refreshToken = refreshToken;
    await user.save();

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 min
    });


    // Send tokens (access token in response, refresh in HttpOnly cookie)
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        _id: user._id,
        name: user.name,
        workEmail: user.workEmail,
        role: user.role,
      },
      accessToken,
    });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Refresh token endpoint logic
const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.body.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh Token required" });
    }

    // Verify refresh token
    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: "Invalid Refresh Token" });
      }

      // Find user to ensure they still exist
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Generate new Access Token
      const newAccessToken = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      res.json({ accessToken: newAccessToken });
    });
  } catch (error) {
    console.error("Refresh Token Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const logoutUser = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      // Remove refresh token from DB
      await User.updateOne(
        { refreshToken },
        { $unset: { refreshToken: "" } }
      );
    }

    // Clear cookies (both tokens)
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict"
    });

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict"
    });

    res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export { logoutUser,registerUser, loginUser, refreshToken };
