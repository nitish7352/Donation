import express from "express";
import Contact from "../models/Contact.js";
import { requireAdminAuth } from "../middleware/auth.js";

const router = express.Router();

// Submit a contact inquiry / message
router.post("/", async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return res.status(400).json({
        message: "Name, email, and message are required."
      });
    }

    const contact = await Contact.create({
      name: name.trim(),
      email: email.trim(),
      phone: phone?.trim() || "",
      subject: subject?.trim() || "General Inquiry",
      message: message.trim()
    });

    res.status(201).json({
      message: "Your message has been sent successfully! Our team will contact you soon.",
      contact
    });
  } catch (err) {
    console.error("Contact submission error:", err);
    res.status(500).json({ message: "Unable to send message right now." });
  }
});

// Get all contact messages (Admin view - Protected)
router.get("/", requireAdminAuth, async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json(contacts);
  } catch (err) {
    console.error("Error fetching contacts:", err);
    res.status(500).json({ message: "Unable to load contact messages." });
  }
});

// Update message status (Admin view - Protected)
router.patch("/:id", requireAdminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await Contact.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ message: "Message not found" });
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Unable to update message status" });
  }
});

export default router;
