const User = require('../models/user.model');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * Create JWT token with user payload
 * @param {Object} payload - Token payload
 * @returns {String} JWT token
 */
function createToken(payload) {
  return jwt.sign(
    payload,
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '24h' }
  );
}

/**
 * Validate password strength
 * @param {String} password - Password to validate
 * @returns {Object} { isValid, errors }
 */
function validatePassword(password) {
  const errors = [];

  if (!password || password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Register a new user
 * @param {Object} dto - User data (name, email, password, age, address)
 * @returns {Object} { message, user, token }
 */
async function registerUser(dto) {
  const { name, email, password, age, address } = dto;

  if (mongoose.connection.readyState !== 1) {
    const err = new Error('Database not connected');
    err.status = 503;
    throw err;
  }

  if (!email || !password) {
    const err = new Error('Email and password are required');
    err.status = 400;
    throw err;
  }

  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    const err = new Error('Password does not meet requirements');
    err.status = 400;
    err.details = passwordValidation.errors;
    throw err;
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const err = new Error('User with this email already exists');
    err.status = 400;
    throw err;
  }

  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash(password, salt);

  const user = await User.create({
    name,
    email,
    password: hashed,
    age,
    address
  });

  const tokenPayload = {
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
    iat: Math.floor(Date.now() / 1000)
  };

  const token = createToken(tokenPayload);

  const userResponse = user.toObject();
  delete userResponse.password;

  return { message: 'User registered successfully', user: userResponse, token };
}

/**
 * Login user with email and password
 * @param {Object} dto - { email, password }
 * @returns {Object} { message, user, token }
 */
async function loginUser(dto) {
  const { email, password } = dto;
  if (!email || !password) {
    const err = new Error('Email and password are required');
    err.status = 400;
    throw err;
  }

  const user = await User.findOne({ email });
  if (!user) {
    const err = new Error('Invalid email or password');
    err.status = 401;
    throw err;
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    const err = new Error('Invalid email or password');
    err.status = 401;
    throw err;
  }

  const tokenPayload = {
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
    iat: Math.floor(Date.now() / 1000)
  };

  const token = createToken(tokenPayload);

  const userResponse = user.toObject();
  delete userResponse.password;

  return { message: 'Login successful', user: userResponse, token };
}

/**
 * Update current user profile
 * @param {String} userId - User ID
 * @param {Object} dto - { name, age, address }
 * @returns {Object} { message, user }
 */
async function updateCurrentUser(userId, dto) {
  const { name, age, address } = dto;

  if (!userId) {
    const err = new Error('Authentication failed');
    err.status = 401;
    throw err;
  }

  const updateData = {};
  if (name !== undefined) updateData.name = name;
  if (age !== undefined) {
    if (age && (isNaN(age) || age < 1 || age > 120)) {
      const err = new Error('Invalid age value');
      err.status = 400;
      throw err;
    }
    updateData.age = age;
  }
  if (address !== undefined) updateData.address = address;

  const existingUser = await User.findById(userId);
  if (!existingUser) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }

  const user = await User.findByIdAndUpdate(userId, updateData, { new: true, runValidators: true }).select('-password');
  if (!user) {
    const err = new Error('Failed to update user profile');
    err.status = 404;
    throw err;
  }

  return { message: 'Profile updated successfully', user };
}

/**
 * Delete user account
 * @param {String} userId - User ID to delete
 * @returns {Object} { message }
 */
async function deleteCurrentUser(userId) {
  if (!userId) {
    const err = new Error('Authentication failed');
    err.status = 401;
    throw err;
  }

  const user = await User.findByIdAndDelete(userId);
  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }

  return { message: 'Account deleted successfully' };
}

/**
 * Refresh JWT token for authenticated user
 * @param {String} userId - User ID
 * @returns {Object} { message, token, user }
 */
async function refreshToken(userId) {
  const user = await User.findById(userId).select('-password');
  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }

  const tokenPayload = {
    userId: user._id.toString(),
    email: user.email,
    iat: Math.floor(Date.now() / 1000)
  };

  const token = createToken(tokenPayload);

  return { message: 'Token refreshed successfully', token, user };
}

module.exports = {
  registerUser,
  loginUser,
  updateCurrentUser,
  deleteCurrentUser,
  refreshToken,
  validatePassword
};
