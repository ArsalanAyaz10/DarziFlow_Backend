// routes/testMail.js
import express from "express";
import { sendEmail } from "../utils/mailer.js";

const router = express.Router();

router.get("/test-email", async (req, res) => {
  try {
    await sendEmail("darziflow@gmail", "Test Email", "This is a test", "<b>This is a test</b>");
    res.json({ message: "Email sent successfully" });
  } catch (error) {
    res.status(500).json({ message: "Email could not be sent", error: error.message });
  }
});

export default router;
