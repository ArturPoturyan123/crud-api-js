const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Get all users
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

// Register new user
const registerUser = async (req, res) => {
  try {
    const { name, email, password, age, address } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        message: "User with this email already exists",
        details: "Please use a different email address or try logging in"
      });
    }

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ 
        message: "Email and password are required",
        details: "Please provide both email and password"
      });
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password,
      age,
      address
    });

    // Generate JWT token with proper payload (no exp field)
    const tokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      iat: Math.floor(Date.now() / 1000)
    };

    const token = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      message: "User registered successfully",
      user: userResponse,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({ 
      message: "Registration failed",
      details: error.message
    });
  }
};

// Login user
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ 
        message: "Email and password are required",
        details: "Please provide both email and password"
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ 
        message: "Invalid email or password",
        details: "No user found with this email address"
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        message: "Invalid email or password",
        details: "The provided password is incorrect"
      });
    }

    // Generate JWT token with proper payload (no exp field)
    const tokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      iat: Math.floor(Date.now() / 1000)
    };

    const token = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({
      message: "Login successful",
      user: userResponse,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: "Login failed",
      details: error.message
    });
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

// Update current user profile
const updateCurrentUser = async (req, res) => {
  try {
    const { name, age, address } = req.body;
    
    // Validate user ID from token
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ 
        message: "Authentication failed",
        details: "User ID not found in token"
      });
    }

    // Validate input data
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (age !== undefined) {
      if (age && (isNaN(age) || age < 1 || age > 120)) {
        return res.status(400).json({ 
          message: "Invalid age value",
          details: "Age must be a number between 1 and 120"
        });
      }
      updateData.age = age;
    }
    if (address !== undefined) updateData.address = address;

    // Check if user exists before updating
    const existingUser = await User.findById(req.user.userId);
    if (!existingUser) {
      return res.status(404).json({ 
        message: "User not found",
        details: "The user associated with this token no longer exists"
      });
    }

    // Update user
    const user = await User.findByIdAndUpdate(
      req.user.userId, 
      updateData, 
      { 
        new: true,
        runValidators: true
      }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ 
        message: "User not found",
        details: "Failed to update user profile"
      });
    }

    res.status(200).json({
      message: "Profile updated successfully",
      user
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(400).json({ 
      message: "Failed to update profile",
      details: error.message
    });
  }
};

// Delete current user account
const deleteCurrentUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Refresh token
const refreshToken = async (req, res) => {
  try {
    // Find the user to ensure they still exist
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ 
        message: "User not found",
        details: "The user associated with this token no longer exists"
      });
    }

    // Generate new JWT token (no exp field)
    const tokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      iat: Math.floor(Date.now() / 1000)
    };

    const newToken = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.status(200).json({
      message: "Token refreshed successfully",
      token: newToken,
      user
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ 
      message: "Failed to refresh token",
      details: error.message
    });
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