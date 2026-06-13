const mongoose = require("mongoose");
require('dotenv').config();
const User = require("../models/user.model.js");

// Database connection string from environment
const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Missing MONGO_URI environment variable. Set it in your .env or in the environment.');
  process.exit(1);
}

async function clearCollections() {
  try {
    // Connect to database
    await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("Connected to database");

    // Clear specific collections
    const userResult = await User.deleteMany({});
    console.log(`Deleted ${userResult.deletedCount} users`);

    // no product collection in this site; only users cleared

    console.log("Collections cleared successfully!");
    
  } catch (error) {
    console.error("Error clearing collections:", error);
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log("Database connection closed");
    process.exit(0);
  }
}

// Run the script
clearCollections(); 