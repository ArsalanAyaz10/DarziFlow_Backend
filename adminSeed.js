import { Admin } from "./models/User.js";

import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const seedAdmin = async () => {
  try {
    const admin = new Admin({
      name: "Super Admin",
      email: "admin@example.com",
      password: "123456", // hash in real use
    });

    await admin.save();
    console.log("Admin user seeded successfully");
    process.exit();
  } catch (error) {
    console.error("Error seeding admin:", error.message);
    process.exit(1);
  }
};

seedAdmin();
