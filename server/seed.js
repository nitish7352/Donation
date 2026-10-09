
require("dotenv").config();

const mongoose = require("mongoose");
const Campaign = require("./models/Campaign");

async function seedCampaign() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    await Campaign.create({
      title: "Education for Every Child",
      description:
        "Help children access books, school supplies, and learning opportunities.",
      targetAmount: 100000,
      category: "Education",
      imageUrl: "",
      status: "active"
    });

    console.log("Test campaign created");
  } catch (error) {
    console.error(error.message);
  } finally {
    await mongoose.disconnect();
  }
}

seedCampaign();