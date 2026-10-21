
import express from "express";
import Campaign from "../models/Campaign.js";
import { requireAdminAuth } from "../middleware/auth.js";

const router = express.Router();

// Get all campaigns
router.get("/", async (req, res) => {
  try {
    const campaigns = await Campaign.find().sort({
      createdAt: -1
    });
    res.json(campaigns);
  } catch {
    res.status(500).json({
      message: "Unable to load campaigns"
    });
  }
});

// Add a campaign (Protected: Admin authentication required)
router.post("/", requireAdminAuth, async (req, res) => {
  try {
    const { title, description, category, image, targetAmount } =
      req.body;

    if (
      !title?.trim() ||
      !description?.trim() ||
      !Number.isFinite(Number(targetAmount)) ||
      Number(targetAmount) <= 0
    ) {
      return res.status(400).json({
        message: "Enter valid campaign details"
      });
    }

    const campaign = await Campaign.create({
      title: title.trim(),
      description: description.trim(),
      category,
      image,
      targetAmount: Number(targetAmount)
    });

    res.status(201).json(campaign);
  } catch {
    res.status(500).json({
      message: "Unable to create campaign"
    });
  }
});

export default router;