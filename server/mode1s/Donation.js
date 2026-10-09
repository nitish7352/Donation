
import mongoose from "mongoose";

const donationSchema = new mongoose.Schema(
  {
    campaign: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campaign",
      required: true
    },
    donorName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      default: ""
    },
    amount: {
      type: Number,
      required: true,
      min: 1
    },
    message: {
      type: String,
      default: ""
    },
    isDemo: {
      type: Boolean,
      default: true
    },
    status: {
      type: String,
      enum: ["demo", "pending", "successful", "failed"],
      default: "demo"
    }
  },
  { timestamps: true }
);

export default mongoose.model("Donation", donationSchema);