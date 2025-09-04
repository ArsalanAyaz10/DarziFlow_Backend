import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    // Emails
    workEmail: { type: String, required: true, unique: true },
    personalEmail: { type: String }, // optional (only for Moderators/Admins if needed)

    password: { type: String, required: true },

    // Role
    role: {
      type: String,
      enum: ["MODERATOR", "ADMIN", "SUPERVISOR", "QC_OFFICER", "CLIENT"],
      required: true,
    },

    // Auth-related
    refreshToken: { type: String, default: null }, // store refresh token for session management

    // Approval workflow
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
    },
    rejectionReason: { type: String, default: null },


    // Metadata
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// 🔎 Indexes for faster lookups
userSchema.index({ role: 1 });
userSchema.index({ workEmail: 1 });
userSchema.index({ department: 1 });

export default mongoose.model("User", userSchema);
