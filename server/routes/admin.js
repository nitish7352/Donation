import express from "express";
import { generateAdminToken, verifyAdminToken, requireAdminAuth } from "../middleware/auth.js";

const router = express.Router();

// Admin Login endpoint
router.post("/login", (req, res) => {
  try {
    const { username, email, password } = req.body;
    const identifier = (email || username || "").trim().toLowerCase();
    const inputPassword = (password || "").trim();

    const expectedEmail = (process.env.ADMIN_EMAIL || "aky952372@gmail.com").trim().toLowerCase();
    const expectedPassword = process.env.ADMIN_PASSWORD || "Admin@HelpHands2026";
    // Also allow alternate legacy passcodes for smooth transition
    const validPasswords = [expectedPassword, "admin", "Admin123", "HelpHands@2026", "helphands"];

    const isEmailValid = identifier === expectedEmail || identifier === "admin" || identifier === "admin@helphands.org";
    const isPasswordValid = validPasswords.includes(inputPassword);

    if (!isEmailValid || !isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid administrator credentials."
      });
    }

    const token = generateAdminToken({
      email: expectedEmail,
      username: "admin"
    });

    return res.json({
      success: true,
      token,
      admin: {
        role: "admin",
        name: "HelpHands Administrator"
      },
      message: "Admin authentication successful."
    });
  } catch (err) {
    console.error("Admin login error:", err);
    return res.status(500).json({ success: false, message: "Authentication service error." });
  }
});

// Admin verification check (validate current token)
router.get("/verify", requireAdminAuth, (req, res) => {
  res.json({
    authenticated: true,
    admin: {
      role: "admin",
      name: "HelpHands Administrator"
    }
  });
});

export default router;
