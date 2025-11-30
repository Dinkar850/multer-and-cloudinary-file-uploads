require("dotenv").config();
const mongoose = require("mongoose");

const connectToDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Database connected successfully");
  } catch (e) {
    console.error("Error connecting database", e);
    process.exit(1);
  }
};

module.exports = connectToDB;
