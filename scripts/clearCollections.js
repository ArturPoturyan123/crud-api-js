const mongoose = require("mongoose");
const User = require("../models/user.model.js");
const Product = require("../models/product.model.js");

// Database connection string
const MONGODB_URI = "mongodb+srv://poturyan:8FQzQNWl0OHMuuvp@backenddb.ddridhj.mongodb.net/?retryWrites=true&w=majority&appName=BackendDB";

async function clearCollections() {
  try {
    // Connect to database
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to database");

    // Clear specific collections
    const userResult = await User.deleteMany({});
    console.log(`Deleted ${userResult.deletedCount} users`);

    const productResult = await Product.deleteMany({});
    console.log(`Deleted ${productResult.deletedCount} products`);

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