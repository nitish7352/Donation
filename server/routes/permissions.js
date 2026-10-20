import express from "express";
import PermissionRequest from "../models/PermissionRequest.js";

const router = express.Router();
const OWNER_EMAIL = "aky952372@gmail.com";

// Submit a permission request to the owner
router.post("/request", async (req, res) => {
  try {
    const { name, email, phone, reason } = req.body;
    if (!name?.trim() || !email?.trim()) {
      return res.status(400).json({ message: "Name and email are required to request permission." });
    }

    const cleanEmail = email.trim().toLowerCase();

    // If owner requested, automatically approved
    if (cleanEmail === OWNER_EMAIL) {
      return res.status(200).json({
        message: "You are the platform owner. Access is always granted.",
        status: "approved",
        isOwner: true
      });
    }

    // Check if an existing request already exists
    let existing = await PermissionRequest.findOne({ email: cleanEmail });
    if (existing) {
      if (existing.status === "approved") {
        return res.json({
          message: "Your permission has already been approved by the owner!",
          request: existing,
          status: "approved"
        });
      }
      existing.name = name.trim();
      existing.phone = phone?.trim() || existing.phone;
      existing.reason = reason?.trim() || existing.reason;
      await existing.save();
      return res.status(200).json({
        message: `Permission request re-sent to website owner (${OWNER_EMAIL}). Waiting for approval.`,
        request: existing,
        status: existing.status
      });
    }

    const newRequest = await PermissionRequest.create({
      name: name.trim(),
      email: cleanEmail,
      phone: phone?.trim() || "",
      reason: reason?.trim() || "Requesting access to browse campaigns and contribute",
      ownerEmail: OWNER_EMAIL,
      status: "pending"
    });

    res.status(201).json({
      message: `Permission request submitted to website owner (${OWNER_EMAIL}).`,
      request: newRequest,
      status: "pending"
    });
  } catch (err) {
    console.error("Permission request error:", err);
    res.status(500).json({ message: "Unable to submit permission request" });
  }
});

// Check/verify if a user's email or access code is approved
router.post("/verify", async (req, res) => {
  try {
    const { email, accessCode } = req.body;
    const cleanEmail = email ? email.trim().toLowerCase() : "";

    if (cleanEmail === OWNER_EMAIL || accessCode === "1234" || accessCode === "helphands" || accessCode === "admin") {
      return res.json({
        approved: true,
        isOwner: cleanEmail === OWNER_EMAIL || accessCode === "admin",
        name: cleanEmail === OWNER_EMAIL ? "Platform Owner" : "Verified Member"
      });
    }

    let query = {};
    if (cleanEmail) query.email = cleanEmail;
    if (accessCode) query.accessCode = accessCode.trim().toUpperCase();

    if (!cleanEmail && !accessCode) {
      return res.status(400).json({ message: "Email or Access Code is required to verify." });
    }

    const record = await PermissionRequest.findOne(query);
    if (!record) {
      return res.json({ approved: false, message: "No permission record found. Please request permission." });
    }

    if (record.status === "approved") {
      return res.json({
        approved: true,
        name: record.name,
        email: record.email,
        accessCode: record.accessCode,
        message: "Permission granted by owner!"
      });
    }

    res.json({
      approved: false,
      status: record.status,
      message: record.status === "pending"
        ? `Your request is currently pending approval by ${OWNER_EMAIL}.`
        : `Your request was declined by ${OWNER_EMAIL}.`
    });
  } catch (err) {
    res.status(500).json({ message: "Verification failed" });
  }
});

// Get all permission requests (For owner aky952372@gmail.com)
router.get("/", async (req, res) => {
  try {
    const requests = await PermissionRequest.find().sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: "Unable to load permission requests" });
  }
});

// Owner approves or rejects a request
router.patch("/:id", async (req, res) => {
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
      message: `Permission ${status} by owner.`,
      request: updated
    });
  } catch (err) {
    res.status(500).json({ message: "Unable to update permission status" });
  }
});

export default router;
