const mongoose = require("mongoose");
const User = require("../models/user.model.js");
const Product = require("../models/product.model.js");

// Database connection string
const MONGODB_URI = "mongodb+srv://poturyan:8FQzQNWl0OHMuuvp@backenddb.ddridhj.mongodb.net/?retryWrites=true&w=majority&appName=BackendDB";

async function clearDatabase() {
  try {
    // Connect to database
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to database");

    // Clear all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    for (const collection of collections) {
      await mongoose.connection.db.dropCollection(collection.name);
      console.log(`Dropped collection: ${collection.name}`);
    }

    console.log("Database cleared successfully!");
    
  } catch (error) {
    console.error("Error clearing database:", error);
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log("Database connection closed");
    process.exit(0);
  }
}

// Run the script
clearDatabase(); 