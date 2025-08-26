import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";

dotenv.config();

//connect to database
connectDB(); 

const app = express(); 


app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(cookieParser()); // Parse cookies

app.use(cors({ origin: true,origin: "http://localhost:3000", credentials: true })); 
// (allow CORS, later configure origin properly for frontend)
app.use(helmet()); // Secure HTTP headers

app.use(morgan("dev")); // Logs requests in dev mode

//ROUTES

app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);

// Default route
app.get("/", (req, res) => {
  res.send("API is running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
