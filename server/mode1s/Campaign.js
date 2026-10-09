
import mongoose from "mongoose";

const campaignSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    category: {
      type: String,
      default: "General"
    },
    image: {
      type: String,
      default: ""
    },
    targetAmount: {
      type: Number,
      required: true,
      min: 1
    },
    collectedAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    status: {
      type: String,
      enum: ["active", "completed"],
      default: "active"
    }
  },
  { timestamps: true }
);

export default mongoose.model("Campaign", campaignSchema);