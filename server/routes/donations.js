import express from "express";
import mongoose from "mongoose";
import Donation from "../models/Donation.js";
import Campaign from "../models/Campaign.js";
import Razorpay from "razorpay";
import crypto from "crypto";
import { requireAdminAuth } from "../middleware/auth.js";

const router = express.Router();

// Helper to lazily initialize Razorpay when credentials are available
function getRazorpayInstance() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (
    !keyId ||
    !keySecret ||
    keyId.trim() === "" ||
    keyId === "your_key_id" ||
    keySecret === "your_key_secret"
  ) {
    throw new Error(
      "Razorpay credentials are not configured. Please add your real RAZORPAY_KEY_ID (e.g. rzp_test_...) and RAZORPAY_KEY_SECRET in server/.env."
    );
  }
  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
}

// Check if Razorpay is configured
router.get("/razorpay-config", (req, res) => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const isConfigured = Boolean(
    keyId &&
    keyId !== "your_key_id" &&
    process.env.RAZORPAY_KEY_SECRET &&
    process.env.RAZORPAY_KEY_SECRET !== "your_key_secret"
  );
  res.json({
    configured: isConfigured,
    keyId: isConfigured ? keyId : null,
  });
});

// Record a demo donation (simulated college project donation; no payment gateway required)
router.post("/", async (req, res) => {
  try {
    const { campaignId, donorName, email, amount, message } = req.body;
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

    // Demo totals only
    campaign.collectedAmount += numericAmount;
    await campaign.save();

    res.status(201).json({
      message: "Demo donation recorded successfully",
      donation
    });
  } catch (err) {
    console.error("Donation record error:", err);
    res.status(500).json({
      message: "Unable to record donation"
    });
  }
});

// Create a Razorpay order for a donation
router.post("/create-order", async (req, res) => {
  try {
    const { campaignId, donorName, email, amount, message } = req.body;
    const numericAmount = Number(amount);
    if (
      !mongoose.isValidObjectId(campaignId) ||
      !donorName?.trim() ||
      !Number.isFinite(numericAmount) ||
      numericAmount <= 0 ||
      numericAmount > 10000000
    ) {
      return res.status(400).json({ message: "Enter valid donation details" });
    }
    const campaign = await Campaign.findById(campaignId);
    if (!campaign || campaign.status !== "active") {
      return res.status(404).json({ message: "Campaign not found or inactive" });
    }
    const razorpay = getRazorpayInstance();
    const amountInPaise = Math.round(numericAmount * 100);
    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `donation_${Date.now()}`,
    });
    const donation = await Donation.create({
      campaign: campaign._id,
      donorName: donorName.trim(),
      email: email || "",
      amount: numericAmount,
      message: message || "",
      isDemo: false,
      status: "pending",
      razorpayOrderId: order.id,
    });
    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      donationId: donation._id,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error("Create order error:", err.message);
    res.status(500).json({ message: err.message || "Unable to create order" });
  }
});

// Verify Razorpay payment signature and mark donation as successful
router.post("/verify", async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, donationId } = req.body;
    if (!process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({ message: "RAZORPAY_KEY_SECRET is not configured on the server" });
    }
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");
    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid signature" });
    }
    const donation = await Donation.findById(donationId);
    if (!donation) {
      return res.status(404).json({ message: "Donation not found" });
    }
    donation.status = "successful";
    donation.paymentId = razorpay_payment_id;
    await donation.save();
    const campaign = await Campaign.findById(donation.campaign);
    if (campaign) {
      campaign.collectedAmount += donation.amount;
      await campaign.save();
    }
    res.json({ message: "Payment verified and donation recorded", donation });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Verification failed" });
  }
});

// List all donations (admin view)
router.get("/", async (req, res) => {
  try {
    const donations = await Donation.find()
      .populate("campaign", "title")
      .sort({ createdAt: -1 });
    res.json(donations);
  } catch {
    res.status(500).json({ message: "Unable to load donations" });
  }
});

// Clear previous history (Admin only)
router.delete("/clear-all", requireAdminAuth, async (req, res) => {
  try {
    await Donation.deleteMany({});
    res.json({ message: "Previous donation history has been removed." });
  } catch (err) {
    res.status(500).json({ message: "Unable to clear donation history" });
  }
});

export default router;