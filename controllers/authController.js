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
    
    if(role == "CLIENT" || role == "QC_OFFICER" || role == "SUPERVISOR"){
      newUser.status = "PENDING";      
    }else{
      newUser.status = null;
    }

    await newUser.save();

    res.status(201).json({
      message: "User registered successfully",
      user: {
        _id: newUser._id,
        name: newUser.name,
        workEmail: newUser.workEmail,
        role: newUser.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { workEmail, password, platform } = req.body;

    // Check if user exists
    const user = await User.findOne({ workEmail });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Verify password
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    //Platform + Role check
    if (platform === "WEB") {
      if (user.role !== "ADMIN" && user.role !== "MODERATOR") {
        return res.status(403).json({ message: "Access denied. Only Moderators and Admins can login from web." });
      }
    } 
    else if (platform === "MOBILE") {
      if (user.role !== "SUPERVISOR" && user.role !== "QC_OFFICER" && user.role !== "CLIENT") {
        return res.status(403).json({ message: "Access denied. Only Supervisors, QC Officers, or Clients can login from mobile." });
      }

      // Also check approval status for mobile roles
      if (user.status !== "APPROVED") {
        return res.status(403).json({ message: `Your account is ${user.status}. Contact admin for support.` });
      }
    } 
    else {
      return res.status(400).json({ message: "Platform not specified or invalid (use WEB or MOBILE)" });
    }

      if (user.status) {
    user.status = undefined;
    await user.save();
  }
  
    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Save refresh token in DB
    user.refreshToken = refreshToken;
    await user.save();

    // Set cookies
        res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 60 * 1000, // 30 min
    });


    // Send tokens (access token in response, refresh in HttpOnly cookie)
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Send tokens
    res.status(201).json({
      message: "User logged in successfully",
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
