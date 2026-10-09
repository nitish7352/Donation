
import express from "express";
import mongoose from "mongoose";
import Donation from "../models/Donation.js";
import Campaign from "../models/Campaign.js";

const router = express.Router();

// List demo donations
router.get("/", async (req, res) => {
  try {
    const donations = await Donation.find()
      .populate("campaign", "title")
      .sort({ createdAt: -1 });

    res.json(donations);
  } catch {
    res.status(500).json({
      message: "Unable to load donations"
    });
  }
});

// Record a demo donation; no money is transferred
router.post("/", async (req, res) => {
  try {
    const { campaignId, donorName, email, amount, message } =
      req.body;

    const numericAmount = Number(amount);

    if (
      !mongoose.isValidObjectId(campaignId) ||
      !donorName?.trim() ||
      !Number.isFinite(numericAmount) ||
      numericAmount <= 0 ||
      numericAmount > 10000000
    ) {
      return res.status(400).json({
        message: "Enter valid donation details"
      });
    }

    const campaign = await Campaign.findById(campaignId);

    if (!campaign || campaign.status !== "active") {
      return res.status(404).json({
        message: "Campaign not found or inactive"
      });
    }

    const donation = await Donation.create({
      campaign: campaign._id,
      donorName: donorName.trim(),
      email: email || "",
      amount: numericAmount,
      message: message || "",
      isDemo: true,
      status: "demo"
    });

    // Demo totals only, not real funds collected
    campaign.collectedAmount += numericAmount;
    await campaign.save();

    res.status(201).json({
      message: "Demo donation recorded successfully",
      donation
    });
  } catch {
    res.status(500).json({
      message: "Unable to record donation"
    });
  }
});

export default router;