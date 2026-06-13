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

const { verifyToken } = require('../middleware/auth');

// Clear all collections (users only)
router.delete("/api/admin/clear-all", verifyToken, async (req, res) => {
  try {
    // Optional: check role
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin role required' });
    }

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