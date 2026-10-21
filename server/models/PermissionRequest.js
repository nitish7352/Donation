import mongoose from "mongoose";

const permissionRequestSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      default: "",
      trim: true
    },
    reason: {
      type: String,
      default: "Requesting permission to view campaigns and donate",
      trim: true
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    },
    accessCode: {
      type: String,
      default: ""
    },
    ownerEmail: {
      type: String,
      default: "admin@helphands.org"
    }
  },
  { timestamps: true }
);

export default mongoose.model("PermissionRequest", permissionRequestSchema);
