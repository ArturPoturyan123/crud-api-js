const User = require("../models/user.model");
const userService = require('../services/user.service');

/**
 * Get all users (admin only)
 */
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Register new user (delegates to service)
const registerUser = async (req, res) => {
  try {
    const result = await userService.registerUser(req.body);
    res.status(201).json(result);
  } catch (err) {
    console.error('Registration error:', err);
    const status = err.status || 400;
    res.status(status).json({ message: err.message, details: err.details || err.message });
  }
};

// Login user (delegates to service)
const loginUser = async (req, res) => {
  try {
    const result = await userService.loginUser(req.body);
    res.status(200).json(result);
  } catch (err) {
    console.error('Login error:', err);
    const status = err.status || 500;
    res.status(status).json({ message: err.message, details: err.details || err.message });
  }
};

// Create new user (legacy method - keeping for backward compatibility)
const createUser = async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update user
const updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get current user profile
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update current user profile (delegates to service)
const updateCurrentUser = async (req, res) => {
  try {
    const userId = req.user && req.user.userId;
    const result = await userService.updateCurrentUser(userId, req.body);
    res.status(200).json(result);
  } catch (err) {
    console.error('Profile update error:', err);
    const status = err.status || 400;
    res.status(status).json({ message: err.message, details: err.details || err.message });
  }
};

// Delete current user account (delegates to service)
const deleteCurrentUser = async (req, res) => {
  try {
    const userId = req.user && req.user.userId;
    const result = await userService.deleteCurrentUser(userId);
    res.status(200).json(result);
  } catch (err) {
    console.error('Delete account error:', err);
    const status = err.status || 500;
    res.status(status).json({ message: err.message, details: err.details || err.message });
  }
};

// Refresh token (delegates to service)
const refreshToken = async (req, res) => {
  try {
    const userId = req.user && req.user.userId;
    const result = await userService.refreshToken(userId);
    res.status(200).json(result);
  } catch (err) {
    console.error('Token refresh error:', err);
    const status = err.status || 500;
    res.status(status).json({ message: err.message, details: err.details || err.message });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  registerUser,
  loginUser,
  updateUser,
  deleteUser,
  getCurrentUser,
  updateCurrentUser,
  deleteCurrentUser,
  refreshToken
}; 