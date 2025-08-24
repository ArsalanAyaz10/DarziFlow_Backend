import {hashPassword,comparePassword} from "./utils/authUtill.js";
import User from "./models/User.js"; // adjust path
import connectDB from "./config/db.js";
import dotenv from "dotenv";

dotenv.config();

//connect to database
connectDB(); 

const addModerator = async () => {

    // Hash password
    const hashed = await hashPassword("zabkps139");
  console.log("Hashed Password: ", hashed);
  const moderator = new User({
    name: "Arsalan Ayaz",
    workEmail: "arsalanayazkps@gmail.com",
    password: hashed,
    role: "MODERATOR",
  });

  await moderator.save();
  console.log("Moderator added!");
  process.exit();
};

addModerator();
