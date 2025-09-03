import User from '../models/User.js';
import {hashPassword} from "../utils/authUtill.js";
import { sendEmail } from '../utils/mailer.js';

const createAdmin = async (req, res) => {
    try {
      const { name, workEmail, password } = req.body;
  
      // check duplicate
      const userExists = await User.findOne({ workEmail });
      if (userExists) {
        return res.status(400).json({ message: "User already exists" });
      }
  
      // hash password
      const hashedPassword = await hashPassword(password);
      
    // Send credentials via email
    const emailContent = `
      <h2>Welcome to Our Platform</h2>
      <p>Hello ${name},</p>
      <p>Your admin account has been created. Here are your login details:</p>
      <ul>
        <li><strong>Email:</strong> ${workEmail}</li>
        <li><strong>Temporary Password:</strong> ${password}</li>
      </ul>
      <p>Please login and change your password immediately.</p>
    `;

    await sendEmail(workEmail, "Your Admin Account Credentials", emailContent);

          // create new admin
      const newAdmin = await User.create({
        name,
        workEmail,
        password: hashedPassword,
        role: "ADMIN",
      });
      
      res.status(201).json({
         message: "Admin created successfully & credentials sent via email",
        admin: {
          _id: newAdmin._id,
          name: newAdmin.name,
          workEmail: newAdmin.workEmail,
          role: newAdmin.role,
        },
        
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }  
}

const fetchAdmins = async (req, res) => {
    try {
    const admins = await User.find({ role: "ADMIN" }).select("-password");
   res.json({ message: "Admins fetched successfully", admins });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }  
}

const updateAdmin = async (req, res) => {
  try {
    const { name, workEmail, password } = req.body;

    const admin = await User.findById(req.params.id);
    if (!admin || admin.role !== "ADMIN") {
      return res.status(404).json({ message: "Admin not found" });
    }

    if (name) admin.name = name;
    if (workEmail) admin.workEmail = workEmail;
    if (password) {
      admin.password = await hashPassword(password);
    }

        // Send credentials via email
    const emailContent = `
      <h2>Welcome to Our Platform DarziFlow</h2>
      <p>Hello ${name},</p>
      <p>Your admin account has been updated. Here are your new login details:</p>
      <ul>
        <li><strong>Name:</strong> ${name}</li>
        <li><strong>Email:</strong> ${workEmail}</li>
        <li><strong>Password:</strong> ${password}</li>
      </ul>
      <p>Please login and change your password immediately.</p>
    `;

    await sendEmail(workEmail, "Your Admin Account Credentials", emailContent);


    await admin.save();
    res.json({ message: "Admin updated successfully", admin });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

const deleteAdmin = async (req, res) => {
    try {
    const admin = await User.findById(req.params.id);
    if (!admin || admin.role !== "ADMIN") {
      return res.status(404).json({ message: "Admin not found" });
    }

    await admin.deleteOne();
    res.json({ message: "Admin deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }  
}

export { createAdmin, fetchAdmins, updateAdmin, deleteAdmin };