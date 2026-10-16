import dotenv from "dotenv";
import mongoose from "mongoose";
import Campaign from "./models/Campaign.js";

dotenv.config();

async function seedCampaign() {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/donation";
  try {
    try {
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    } catch {
      console.warn("Primary MongoDB connection failed, trying local MongoDB (mongodb://127.0.0.1:27017/donation)...");
      await mongoose.connect("mongodb://127.0.0.1:27017/donation", { serverSelectionTimeoutMS: 5000 });
    }

    const count = await Campaign.countDocuments();
    if (count === 0) {
      await Campaign.create({
        title: "Education for Every Child",
        description:
          "Help children access books, school supplies, and learning opportunities.",
        targetAmount: 100000,
        category: "Education",
        image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800",
        status: "active"
      });
      console.log("Sample campaign created successfully.");
    } else {
      console.log(`Campaigns already exist (${count} found).`);
    }
  } catch (error) {
    console.error("Seed error:", error.message);
  } finally {
    await mongoose.disconnect();
  }
}

seedCampaign();