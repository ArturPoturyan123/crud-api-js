const express = require("express");
const User = require("../models/user.model.js");
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

// Clear all collections (users only)
router.delete("/api/admin/clear-all", async (req, res) => {
  try {
    const userResult = await User.deleteMany({});
    
    res.json({ 
      message: "All collections cleared successfully",
      usersDeleted: userResult.deletedCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 