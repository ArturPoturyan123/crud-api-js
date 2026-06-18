const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userService = require('../services/user.service');
const User = require('../models/user.model');

// Mock dependencies
jest.mock('../models/user.model');
jest.mock('jsonwebtoken');
jest.mock('bcryptjs');

describe('User Service - Registration', () => {
  let mockUser;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUser = {
      _id: 'test-user-id',
      name: 'John Doe',
      email: 'john@example.com',
      password: 'hashedPassword123',
      age: 25,
      address: '123 Main St',
      role: 'user',
      toObject: jest.fn().mockReturnValue({
        _id: 'test-user-id',
        name: 'John Doe',
        email: 'john@example.com',
        age: 25,
        address: '123 Main St',
        role: 'user'
      })
    };

    mongoose.connection = { readyState: 1 };
  });

  describe('registerUser - Positive Cases', () => {
    it('should register user successfully with valid data', async () => {
      // Arrange
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'SecurePass123',
        age: 25,
        address: '123 Main St'
      };

      User.findOne.mockResolvedValue(null);
      bcrypt.genSalt.mockResolvedValue('salt123');
      bcrypt.hash.mockResolvedValue('hashedPassword123');
      User.create.mockResolvedValue(mockUser);
      jwt.sign.mockReturnValue('valid-jwt-token');

      // Act
      const result = await userService.registerUser(userData);

      // Assert
      expect(result.message).toBe('User registered successfully');
      expect(result.user).not.toHaveProperty('password');
      expect(result.token).toBe('valid-jwt-token');
      expect(User.create).toHaveBeenCalledWith({
        name: userData.name,
        email: userData.email,
        password: 'hashedPassword123',
        age: userData.age,
        address: userData.address
      });
    });

    it('should hash password with correct salt rounds', async () => {
      // Arrange
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'SecurePass123'
      };

      User.findOne.mockResolvedValue(null);
      bcrypt.genSalt.mockResolvedValue('salt123');
      bcrypt.hash.mockResolvedValue('hashedPassword123');
      User.create.mockResolvedValue(mockUser);
      jwt.sign.mockReturnValue('token');

      // Act
      await userService.registerUser(userData);

      // Assert
      expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
      expect(bcrypt.hash).toHaveBeenCalledWith('SecurePass123', 'salt123');
    });

    it('should generate JWT token with correct payload', async () => {
      // Arrange
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'SecurePass123'
      };

      User.findOne.mockResolvedValue(null);
      bcrypt.genSalt.mockResolvedValue('salt123');
      bcrypt.hash.mockResolvedValue('hashed');
      User.create.mockResolvedValue(mockUser);
      jwt.sign.mockReturnValue('token');

      // Act
      await userService.registerUser(userData);

      // Assert
      expect(jwt.sign).toHaveBeenCalled();
      const callArgs = jwt.sign.mock.calls[0];
      expect(callArgs[0]).toHaveProperty('userId');
      expect(callArgs[0]).toHaveProperty('email', 'john@example.com');
      expect(callArgs[0]).toHaveProperty('role', 'user');
    });
  });

  describe('registerUser - Negative Cases', () => {
    it('should throw error if database is not connected', async () => {
      // Arrange
      mongoose.connection.readyState = 0;
      const userData = {
        email: 'john@example.com',
        password: 'SecurePass123'
      };

      // Act & Assert
      await expect(userService.registerUser(userData)).rejects.toThrow(
        'Database not connected'
      );
    });

    it('should throw error if email is missing', async () => {
      // Arrange
      const userData = {
        name: 'John Doe',
        password: 'SecurePass123'
      };

      // Act & Assert
      await expect(userService.registerUser(userData)).rejects.toThrow(
        'Email and password are required'
      );
    });

    it('should throw error if password is missing', async () => {
      // Arrange
      const userData = {
        name: 'John Doe',
        email: 'john@example.com'
      };

      // Act & Assert
      await expect(userService.registerUser(userData)).rejects.toThrow(
        'Email and password are required'
      );
    });

    it('should throw error if password is too short', async () => {
      // Arrange
      const userData = {
        email: 'john@example.com',
        password: 'Short1'
      };

      // Act & Assert
      const error = await expect(userService.registerUser(userData)).rejects.toThrow();
      expect(error).rejects.toMatchObject({
        status: 400
      });
    });

    it('should throw error if password lacks uppercase letter', async () => {
      // Arrange
      const userData = {
        email: 'john@example.com',
        password: 'lowercase123'
      };

      // Act & Assert
      await expect(userService.registerUser(userData)).rejects.toThrow(
        'Password does not meet requirements'
      );
    });

    it('should throw error if password lacks lowercase letter', async () => {
      // Arrange
      const userData = {
        email: 'john@example.com',
        password: 'UPPERCASE123'
      };

      // Act & Assert
      await expect(userService.registerUser(userData)).rejects.toThrow(
        'Password does not meet requirements'
      );
    });

    it('should throw error if password lacks number', async () => {
      // Arrange
      const userData = {
        email: 'john@example.com',
        password: 'NoNumbers'
      };

      // Act & Assert
      await expect(userService.registerUser(userData)).rejects.toThrow(
        'Password does not meet requirements'
      );
    });

    it('should throw error if email already exists', async () => {
      // Arrange
      const userData = {
        email: 'john@example.com',
        password: 'SecurePass123'
      };

      User.findOne.mockResolvedValue(mockUser);

      // Act & Assert
      const error = await expect(userService.registerUser(userData)).rejects.toThrow(
        'User with this email already exists'
      );
      expect(error).rejects.toMatchObject({ status: 400 });
    });

    it('should not hash password if validation fails', async () => {
      // Arrange
      const userData = {
        email: 'john@example.com',
        password: 'weak'
      };

      User.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(userService.registerUser(userData)).rejects.toThrow();
      expect(bcrypt.genSalt).not.toHaveBeenCalled();
      expect(bcrypt.hash).not.toHaveBeenCalled();
    });

    it('should include detailed error info for weak passwords', async () => {
      // Arrange
      const userData = {
        email: 'john@example.com',
        password: 'weak'
      };

      User.findOne.mockResolvedValue(null);

      // Act & Assert
      try {
        await userService.registerUser(userData);
      } catch (err) {
        expect(err.status).toBe(400);
        expect(err.details).toBeDefined();
        expect(Array.isArray(err.details)).toBe(true);
      }
    });
  });

  describe('loginUser - Positive Cases', () => {
    it('should login user successfully with valid credentials', async () => {
      // Arrange
      const loginData = {
        email: 'john@example.com',
        password: 'SecurePass123'
      };

      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('valid-jwt-token');

      // Act
      const result = await userService.loginUser(loginData);

      // Assert
      expect(result.message).toBe('Login successful');
      expect(result.user.email).toBe('john@example.com');
      expect(result.token).toBe('valid-jwt-token');
      expect(result.user).not.toHaveProperty('password');
    });

    it('should compare password hash correctly', async () => {
      // Arrange
      const loginData = {
        email: 'john@example.com',
        password: 'SecurePass123'
      };

      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('token');

      // Act
      await userService.loginUser(loginData);

      // Assert
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'SecurePass123',
        'hashedPassword123'
      );
    });
  });

  describe('loginUser - Negative Cases', () => {
    it('should throw error if email is missing', async () => {
      // Arrange
      const loginData = {
        password: 'SecurePass123'
      };

      // Act & Assert
      await expect(userService.loginUser(loginData)).rejects.toThrow(
        'Email and password are required'
      );
    });

    it('should throw error if password is missing', async () => {
      // Arrange
      const loginData = {
        email: 'john@example.com'
      };

      // Act & Assert
      await expect(userService.loginUser(loginData)).rejects.toThrow(
        'Email and password are required'
      );
    });

    it('should throw error if user not found', async () => {
      // Arrange
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'SecurePass123'
      };

      User.findOne.mockResolvedValue(null);

      // Act & Assert
      const error = await expect(userService.loginUser(loginData)).rejects.toThrow(
        'Invalid email or password'
      );
      expect(error).rejects.toMatchObject({ status: 401 });
    });

    it('should throw error if password is incorrect', async () => {
      // Arrange
      const loginData = {
        email: 'john@example.com',
        password: 'WrongPassword123'
      };

      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(false);

      // Act & Assert
      const error = await expect(userService.loginUser(loginData)).rejects.toThrow(
        'Invalid email or password'
      );
      expect(error).rejects.toMatchObject({ status: 401 });
    });
  });

  describe('validatePassword - Positive Cases', () => {
    it('should validate password with all requirements', () => {
      // Act
      const result = userService.validatePassword('ValidPass123');

      // Assert
      expect(result.isValid).toBe(true);
      expect(result.errors.length).toBe(0);
    });
  });

  describe('validatePassword - Negative Cases', () => {
    it('should return error for short password', () => {
      // Act
      const result = userService.validatePassword('Short1');

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must be at least 8 characters');
    });

    it('should return multiple errors for weak password', () => {
      // Act
      const result = userService.validatePassword('weakpassword');

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });

    it('should specify exactly which requirements are missing', () => {
      // Act
      const result = userService.validatePassword('noupppercase123');

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'Password must contain at least one uppercase letter'
      );
    });
  });

  describe('updateCurrentUser - Positive Cases', () => {
    it('should update user profile successfully', async () => {
      // Arrange
      const userId = 'test-user-id';
      const updateData = {
        name: 'Updated Name',
        age: 30
      };

      const updatedMockUser = { ...mockUser, name: 'Updated Name', age: 30 };
      User.findById.mockResolvedValue(mockUser);
      User.findByIdAndUpdate.mockResolvedValue(updatedMockUser);

      // Act
      const result = await userService.updateCurrentUser(userId, updateData);

      // Assert
      expect(result.message).toBe('Profile updated successfully');
      expect(result.user).toBeDefined();
    });

    it('should validate age before updating', async () => {
      // Arrange
      const userId = 'test-user-id';
      const updateData = { age: 30 };

      User.findById.mockResolvedValue(mockUser);

      // Act
      await userService.updateCurrentUser(userId, updateData);

      // Assert
      expect(User.findByIdAndUpdate).toHaveBeenCalled();
    });
  });

  describe('updateCurrentUser - Negative Cases', () => {
    it('should throw error if userId is missing', async () => {
      // Arrange
      const updateData = { name: 'Updated Name' };

      // Act & Assert
      await expect(userService.updateCurrentUser(null, updateData)).rejects.toThrow(
        'Authentication failed'
      );
    });

    it('should throw error if age is invalid', async () => {
      // Arrange
      const userId = 'test-user-id';
      const updateData = { age: 150 };

      User.findById.mockResolvedValue(mockUser);

      // Act & Assert
      await expect(userService.updateCurrentUser(userId, updateData)).rejects.toThrow(
        'Invalid age value'
      );
    });

    it('should throw error if user not found', async () => {
      // Arrange
      const userId = 'nonexistent-id';
      const updateData = { name: 'Updated Name' };

      User.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(userService.updateCurrentUser(userId, updateData)).rejects.toThrow(
        'User not found'
      );
    });
  });

  describe('deleteCurrentUser - Positive Cases', () => {
    it('should delete user successfully', async () => {
      // Arrange
      const userId = 'test-user-id';
      User.findByIdAndDelete.mockResolvedValue(mockUser);

      // Act
      const result = await userService.deleteCurrentUser(userId);

      // Assert
      expect(result.message).toBe('Account deleted successfully');
      expect(User.findByIdAndDelete).toHaveBeenCalledWith(userId);
    });
  });

  describe('deleteCurrentUser - Negative Cases', () => {
    it('should throw error if userId is missing', async () => {
      // Act & Assert
      await expect(userService.deleteCurrentUser(null)).rejects.toThrow(
        'Authentication failed'
      );
    });

    it('should throw error if user not found', async () => {
      // Arrange
      const userId = 'nonexistent-id';
      User.findByIdAndDelete.mockResolvedValue(null);

      // Act & Assert
      await expect(userService.deleteCurrentUser(userId)).rejects.toThrow(
        'User not found'
      );
    });
  });

  describe('refreshToken - Positive Cases', () => {
    it('should refresh token successfully', async () => {
      // Arrange
      const userId = 'test-user-id';
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      });
      jwt.sign.mockReturnValue('new-jwt-token');

      // Act
      const result = await userService.refreshToken(userId);

      // Assert
      expect(result.message).toBe('Token refreshed successfully');
      expect(result.token).toBe('new-jwt-token');
      expect(result.user).toBeDefined();
    });
  });

  describe('refreshToken - Negative Cases', () => {
    it('should throw error if user not found', async () => {
      // Arrange
      const userId = 'nonexistent-id';
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(null)
      });

      // Act & Assert
      await expect(userService.refreshToken(userId)).rejects.toThrow(
        'User not found'
      );
    });
  });
});
