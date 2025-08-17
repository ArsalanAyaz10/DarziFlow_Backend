import mongoose from "mongoose";

// 🔹 Common User Schema
const baseUserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
    },
  },
  { timestamps: true }
);

// 🔹 Different Models for Each Role (Separate Collections)
export const Moderator = mongoose.model("Moderator", baseUserSchema, "moderators");
export const Admin = mongoose.model("Admin", baseUserSchema, "admins");
export const Supervisor = mongoose.model("Supervisor", baseUserSchema, "supervisors");
export const QCOfficer = mongoose.model("QCOfficer", baseUserSchema, "qc_officers");
export const Client = mongoose.model("Client", baseUserSchema, "clients");
