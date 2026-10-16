import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import campaignRoutes from "./routes/campaigns.js";
import donationRoutes from "./routes/donations.js";
import Campaign from "./models/Campaign.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: "100kb" }));

app.get("/api/health", (req, res) => {
  res.json({ message: "HelpHands API is running" });
});

app.use("/api/campaigns", campaignRoutes);
app.use("/api/donations", donationRoutes);

async function connectDB() {
  const primaryUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/donation";
  const localUri = "mongodb://127.0.0.1:27017/donation";

  try {
    await mongoose.connect(primaryUri, { serverSelectionTimeoutMS: 4000 });
    console.log("Connected to MongoDB successfully");
  } catch (error) {
    if (primaryUri !== localUri) {
      console.warn(`Could not connect to MongoDB URI (${error.message}). Trying local MongoDB fallback...`);
      await mongoose.connect(localUri, { serverSelectionTimeoutMS: 4000 });
      console.log("Connected to local MongoDB (mongodb://127.0.0.1:27017/donation) successfully");
    } else {
      throw error;
    }
  }
}

async function startServer() {
  try {
    await connectDB();

    // Add sample campaigns only when the database is empty
    if ((await Campaign.countDocuments()) === 0) {
      await Campaign.insertMany([
        {
          title: "Education for Every Child",
          description:
            "Support school supplies, books and learning opportunities.",
          category: "Education",
          targetAmount: 100000,
          collectedAmount: 25000
        },
        {
          title: "Food for Needy Families",
          description:
            "Help provide essential meals to families in need.",
          category: "Food",
          targetAmount: 50000,
          collectedAmount: 18000
        },
        {
          title: "Medical Care for Everyone",
          description:
            "Help people access essential medical care and supplies.",
          category: "Healthcare",
          targetAmount: 150000,
          collectedAmount: 60000
        }
      ]);
    }

    const port = process.env.PORT || 5000;

    app.listen(port, () => {
      console.log(`HelpHands API running on port ${port}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
}

startServer();