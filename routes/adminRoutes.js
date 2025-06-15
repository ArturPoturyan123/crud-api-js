const express = require("express");
const User = require("../models/user.model.js");
const Product = require("../models/product.model.js");
const router = express.Router();

// Clear all users
router.delete("/api/admin/users", async (req, res) => {
  try {
    const result = await User.deleteMany({});
    res.json({ 
      message: "All users deleted successfully", 
      deletedCount: result.deletedCount 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Clear all products
router.delete("/api/admin/products", async (req, res) => {
  try {
    const result = await Product.deleteMany({});
    res.json({ 
      message: "All products deleted successfully", 
      deletedCount: result.deletedCount 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Clear all collections
router.delete("/api/admin/clear-all", async (req, res) => {
  try {
    const userResult = await User.deleteMany({});
    const productResult = await Product.deleteMany({});
    
    res.json({ 
      message: "All collections cleared successfully",
      usersDeleted: userResult.deletedCount,
      productsDeleted: productResult.deletedCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 