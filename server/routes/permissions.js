import express from "express";
import PermissionRequest from "../models/PermissionRequest.js";
import { requireAdminAuth } from "../middleware/auth.js";

const router = express.Router();
const OWNER_EMAIL = (process.env.ADMIN_EMAIL || "aky952372@gmail.com").toLowerCase();

// Submit a permission/access request (Public from sidebar)
router.post("/request", async (req, res) => {
  try {
    const { name, email, phone, reason } = req.body;
    if (!name?.trim() || !email?.trim()) {
      return res.status(400).json({ message: "Full name and email address are required." });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if an existing request already exists
    let existing = await PermissionRequest.findOne({ email: cleanEmail });
    if (existing) {
      if (existing.status === "approved") {
        return res.json({
          message: "Your access request has already been approved!",
          request: existing,
          status: "approved"
        });
      }
      existing.name = name.trim();
      existing.phone = phone?.trim() || existing.phone;
      existing.reason = reason?.trim() || existing.reason;
      await existing.save();
      return res.status(200).json({
        message: "Your access request has been updated and is currently under review.",
        request: existing,
        status: existing.status
      });
    }

    const newRequest = await PermissionRequest.create({
      name: name.trim(),
      email: cleanEmail,
      phone: phone?.trim() || "",
      reason: reason?.trim() || "Requesting partner/volunteer access",
      ownerEmail: OWNER_EMAIL,
      status: "pending"
    });

    res.status(201).json({
      message: "Your access request has been submitted successfully. Our team will review your application.",
      request: newRequest,
      status: "pending"
    });
  } catch (err) {
    console.error("Permission request error:", err);
    res.status(500).json({ message: "Unable to submit access request at this time." });
  }
});

// Check/verify if a user's email or access code is approved
router.post("/verify", async (req, res) => {
  try {
    const { email, accessCode } = req.body;
    const cleanEmail = email ? email.trim().toLowerCase() : "";

    let query = {};
    if (cleanEmail) query.email = cleanEmail;
    if (accessCode) query.accessCode = accessCode.trim().toUpperCase();

    if (!cleanEmail && !accessCode) {
      return res.status(400).json({ message: "Email or Access Code is required to verify." });
    }

    const record = await PermissionRequest.findOne(query);
    if (!record) {
      return res.json({ approved: false, message: "No access record found. Please submit an access request." });
    }

    if (record.status === "approved") {
      return res.json({
        approved: true,
        name: record.name,
        email: record.email,
        accessCode: record.accessCode,
        message: "Access granted."
      });
    }

    res.json({
      approved: false,
      status: record.status,
      message: record.status === "pending"
        ? "Your request is currently pending administrative review."
        : "Your request was declined."
    });
  } catch (err) {
    res.status(500).json({ message: "Verification failed." });
  }
});

// Get all permission requests (Protected: Admin authentication required)
router.get("/", requireAdminAuth, async (req, res) => {
  try {
    const requests = await PermissionRequest.find().sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: "Unable to load permission requests." });
  }
});

// Admin approves or rejects a request (Protected: Admin authentication required)
router.patch("/:id", requireAdminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    if (!["approved", "rejected", "pending"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const accessCode = status === "approved" ? "ACC-" + Math.floor(100000 + Math.random() * 900000) : "";
    const updated = await PermissionRequest.findByIdAndUpdate(
      req.params.id,
      { status, accessCode },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Request not found" });
    }

    res.json({
      message: `Access request marked as ${status}.`,
      request: updated
    });
  } catch (err) {
    res.status(500).json({ message: "Unable to update access status" });
  }
});

export default router;
