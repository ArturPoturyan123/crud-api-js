const express = require("express");
const User = require("../models/user.model.js");
const { verifyToken } = require('../middleware/auth');
const router = express.Router();

// Clear all users (protected: admin only)
router.delete("/api/admin/users", verifyToken, async (req, res) => {
  try {
    // Fetch freshest role from DB to avoid stale JWT role issues
    const actor = await User.findById(req.user.userId);
    if (!actor || actor.role !== 'admin') {
      return res.status(403).json({ message: 'Admin role required' });
    }

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
router.delete("/api/admin/clear-all", verifyToken, async (req, res) => {
  try {
    const actor = await User.findById(req.user.userId);
    if (!actor || actor.role !== 'admin') {
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

    // Delete a single user by ID (admin only)
router.delete('/api/admin/users/:id', verifyToken, async (req, res) => {
  try {
    const actor = await User.findById(req.user.userId);
    if (!actor || actor.role !== 'admin') {
      return res.status(403).json({ message: 'Admin role required' });
    }

    const { id } = req.params;
    console.log('Admin delete single user requested by:', actor && { userId: actor._id, email: actor.email });

    const user = await User.findByIdAndDelete(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({
      message: 'User deleted successfully',
      deletedUserId: id,
      requestedBy: { userId: actor._id, email: actor.email }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 
