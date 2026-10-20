import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import campaignRoutes from "./routes/campaigns.js";
import donationRoutes from "./routes/donations.js";
import contactRoutes from "./routes/contacts.js";
import Campaign from "./models/Campaign.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: "100kb" }));

app.get("/api/health", (req, res) => {
  res.json({ message: "HelpHands API is running", status: "healthy" });
});

app.use("/api/campaigns", campaignRoutes);
app.use("/api/donations", donationRoutes);
app.use("/api/contacts", contactRoutes);

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
  const port = process.env.PORT || 5000;
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
        },
        {
          title: "Marriage Support for Poor Girls",
          description:
            "Help underprivileged families organize marriages with dignity by funding wedding essentials, clothing, and ceremonies.",
          category: "Social Welfare",
          targetAmount: 80000,
          collectedAmount: 32000,
          image: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800"
        }
      ]);
    }

    // Ensure the marriage campaign is created if DB was already seeded
    const marriageExists = await Campaign.findOne({ title: { $regex: /marriage/i } });
    if (!marriageExists) {
      await Campaign.create({
        title: "Marriage Support for Poor Girls",
        description:
          "Help underprivileged families organize marriages with dignity by funding wedding essentials, clothing, and ceremonies.",
        category: "Social Welfare",
        targetAmount: 80000,
        collectedAmount: 32000,
        image: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800"
      });
      console.log("Added 'Marriage Support for Poor Girls' campaign to database.");
    }
  } catch (error) {
    console.warn("MongoDB connection notice:", error.message);
  }

  app.listen(port, () => {
    console.log(`HelpHands API running on port ${port}`);
  });
}

startServer();